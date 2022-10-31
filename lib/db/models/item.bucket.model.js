const db = require('../db.js')

// TODO Verify the effects of nesting on required and unique
let itemBucketSchema = new db.Schema({
	customID: {
		type: {
			step: {
				type: Number,
			},
			details: {
				type: Map,
				of: String,
			},
		},
		required: [true, 'Bucket must have a customID'],
		unique: [true, 'Custom ID must be unique'],
	},
	count: { type: Number, default: 0, required: [true, 'Bucket must maintain a counter'] },
	bucket: [{ type: db.Types.ObjectId, ref: 'items' }],
})

const itemBucketModel = db.model('itemBuckets', itemBucketSchema)
module.exports = itemBucketModel
