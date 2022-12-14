const JSONResponse = require('../../json.helper.js')
const db = require('../db.js')
const itemBucketModel = require('./item.bucket.model.js')

let itemSchema = new db.Schema({
	name: {
		type: String,
		unique: [true, 'Such an item already exists'],
		required: [true, 'No name provided'],
	},
	categories: {
		type: [db.Types.ObjectId],
		required: [true, 'No categories provided'],
		ref: 'categories',
	},
	imageUrl: {
		type: String,
		required: [true, 'No S3 file key rendered'],
	},
	price: {
		type: Number,
		required: [true, 'No price provided'],
	},
	stock: {
		type: Number,
		default: 100,
		required: [true, 'No stock provided'],
	},
})

/**
 * Execute after saving an item, in order to perform bucket logic
 * Add item references to the relevant buckets, create a bucket if necessary
 */
itemSchema.post('save', async function (doc) {
	doc.categories.forEach(async (e) => {
		let bucket = await itemBucketModel
			.findOne({ 'customID.category': e, count: { $lt: 100 } })
			.sort({ 'customID.step': 'asc' })
			.catch((err) => {
				doc.delete()
				JSONResponse.error(req, res, 500, 'Database Error', err)
			})
		if (!bucket) {
			newBucket([doc._id], 1, e)
		} else {
			bucket.bucket.push(doc._id)
			bucket.count++
			bucket.save().catch((err) => {
				JSONResponse.error(req, res, 500, 'Database Error', err)
				return
			})
		}
	})

	/**
	 * Create a new bucket in the database
	 * @param {Number} step
	 */
	let newBucket = (addition, step) => {
		let newbucket = new itemBucketModel({
			customID: {
				step: step,
				category: e,
			},
			bucket: [],
		})
		newbucket.bucket.push(addition)
		newbucket.count++
		newbucket.save().catch((err) => {
			doc.delete()
			JSONResponse.error(req, res, 500, 'Database Error', err)
		})
	}
})

/**
 * After deleting an item, remove it from all buckets
 */
itemSchema.post('deleteOne', async function (doc) {
	await S3Helper.delete(doc.image).catch((err) => {
		JSONResponse.error(req, res, 500, 'S3 Error', err)
	})
	await S3Helper.delete(doc.clip).catch((err) => {
		JSONResponse.error(req, res, 500, 'S3 Error', err)
	})
	doc.categories.forEach(async (e) => {
		let buckets = await itemBucketModel.find({ 'customID.category': e }).catch((err) => {
			doc.delete()
			JSONResponse.error(req, res, 500, 'Database Error', err)
			return
		})
		buckets.forEach((bucket) => {
			if (Array.from(bucket.bucket).includes(doc._id))
				bucket.bucket = Array.from(bucket.bucket).filter((e) => {
					return e != doc._id
				})
			bucket.save().catch((err) => {
				JSONResponse.error(req, res, 500, 'Database Error', err)
			})
		})
	})
})

// TODO pre-update image s3 logic

const itemModel = db.model('items', itemSchema)
module.exports = itemModel
