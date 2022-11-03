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
 */
itemSchema.post('save', async function (doc) {
	doc.categories.forEach(async (e) => {
		let details = new Map()
		details.set('categories', e)
		let bucket = await itemBucketModel
			.findOne({ 'customID.details': details, count: { $lt: 100 } })
			.sort({ 'customID.step': 'asc' })
			.catch((err) => {
				doc.delete()
				JSONResponse.error(req, res, 500, 'Database Error', err)
				return
			})
		if (!bucket) {
			newBucket([doc._id], 1)
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
	 * Create a new bucket int he database
	 * @param {Number} step
	 */
	let newBucket = (addition, step) => {
		let newbucket = new itemBucketModel({
			customID: {
				step: step,
				details: new Map(),
			},
			bucket: [],
		})
		newbucket.customID.details.set('category', e)
		newbucket.bucket.push(addition)
		newbucket.count++
		newbucket.save().catch((err) => {
			doc.delete()
			JSONResponse.error(req, res, 500, 'Database Error', err)
		})
	}
})

itemSchema.post('deleteOne', async function (doc) {
	doc.categories.forEach(async (e) => {
		let details = new Map()
		details.set('categories', e)
		let buckets = await itemBucketModel.find({ 'customID.details': details }).catch((err) => {
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

const itemModel = db.model('items', itemSchema)
module.exports = itemModel
