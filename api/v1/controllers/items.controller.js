const itemBucketModel = require('../../../lib/db/models/item.bucket.model')
const itemModel = require('../../../lib/db/models/item.model')
const JSONResponse = require('../../../lib/json.helper')
const S3Helper = require('../../../lib/s3.helper')

class itemsController {
	//Read
	/**
	 * Get collective items
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	static async get(req, res) {
		let { page, limit, field, value } = req.query
		if (page && limit && [10, 20, 25, 50].includes(parseInt(limit)) && parseInt(page) > 0) {
			let bucketnum = Math.floor((page * limit) / 100) + 1
			let indexStart = ((page - 1) * limit) % 100
			let filterBody = {
				'customID.step': bucketnum,
			}
			if (field && value && field.length == value.length) {
				field.forEach((e, index) => {
					filterBody[`customID.${e}`] = value[index]
				})
			} else {
				filterBody['customID.category'] = '6369a13a274f9c5d48860101'
			}
			let error = false
			const bucket = await itemBucketModel.findOne(filterBody).catch((err) => {
				error = true
				JSONResponse.error(req, res, 500, 'Database Error', err)
			})
			if (bucket) {
				await bucket.populate('bucket')
				let subArray = bucket.bucket.slice(indexStart, indexStart + limit)
				JSONResponse.success(req, res, 200, 'Collected matching documents', subArray)
			} else if (!bucket && !error)
				JSONResponse.success(req, res, 200, 'Could not find any matching documents')
		} else {
			JSONResponse.error(req, res, 501, 'Incorrect query string')
			return
		}
	}

	/**
	 * Get an item by ID
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	static async getOne(req, res) {
		let id = req.params.id
		let item = await itemModel.findById(id).catch((err) => {
			JSONResponse.error(req, res, 500, 'Database Error', err)
		})
		if (item) {
			JSONResponse.success(req, res, 200, 'Collected matching document', item)
		} else JSONResponse.error(req, res, 404, 'Could not find any matching documents')
	}

	// TODO Include buckets interactions
	//Create
	/**
	 * Create a new item
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	static async add(req, res) {
		let body = req.body
		let now = Date.now().toString(16)
		let manageupload = await S3Helper.upload(req.files['image'][0], now + '_img')
		if (manageupload) body.image = now + '_img'
		manageupload = await S3Helper.upload(req.files['clip'][0], now + '_clip')
		if (manageupload) body.clip = now + '_clip'
		if (Array.isArray(body.categories)) body.categories.push('6369a13a274f9c5d48860101')
		else if (body.categories) body.categories = ['6369a13a274f9c5d48860101', body.categories]
		else body.categories = ['6369a13a274f9c5d48860101']
		let newdoc = new itemModel(body)
		let valid = true
		await newdoc.validate().catch((err) => {
			valid = false
			JSONResponse.error(
				req,
				res,
				400,
				err.errors[Object.keys(err.errors)[Object.keys(err.errors).length - 1]].properties
					.message,
				err.errors[Object.keys(err.errors)[Object.keys(err.errors).length - 1]]
			)
		})
		if (valid) {
			const newerdoc = await newdoc.save().catch((err) => {
				JSONResponse.error(req, res, 500, 'Database Error', err)
			})
			if (newerdoc)
				JSONResponse.success(req, res, 202, 'Document added successfully', newerdoc)
		}
	}

	//Delete
	/**
	 * Erase an item by ID
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	static async destroy(req, res) {
		let id = req.params.id
		const olddoc = await itemModel.findByIdAndDelete(id).catch((err) => {
			JSONResponse.error(req, res, 500, 'Database Error', err)
		})

		if (olddoc) {
			JSONResponse.success(req, res, 200, 'Successfully removed document')
		} else {
			JSONResponse.error(req, res, 404, 'Could not find document')
		}
	}

	//Update
	/**
	 * Update an item by ID
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	static async update(req, res) {
		let id = req.params.id
		let body = req.body
		const newdoc = await itemModel.findByIdAndUpdate(id, body).catch((err) => {
			JSONResponse.error(req, res, 500, 'Database Error', err)
		})
		if (newdoc) {
			JSONResponse.success(req, res, 200, 'Successfully updated document', newdoc)
		} else {
			JSONResponse.error(req, res, 404, 'Could not find document')
		}
	}
}

module.exports = itemsController
