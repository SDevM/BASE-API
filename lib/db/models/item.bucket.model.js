const db = require('../db.js')

// TODO Verify the effects of nesting on required and unique
let itemBucketSchema = new db.Schema({
	customID: {
		type: {
			step: {
				type: Number,
				required: [true, 'Bucket must have a step'],
			},
			category: {
				type: db.Types.ObjectId,
				ref: 'categories',
				required: [true, 'Bucket must have a category'],
			},
		},
	},
	count: { type: Number, default: 0, required: [true, 'Bucket must maintain a counter'] },
	bucket: [{ type: db.Types.ObjectId, ref: 'movies' }],
})

const itemBucketModel = db.model('itemBuckets', itemBucketSchema)
module.exports = itemBucketModel
