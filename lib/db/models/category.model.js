const db = require('../db.js')

let categorySchema = new db.Schema({
	name: {
		type: String,
		required: [true, 'Category name blank'],
		unique: [true, 'This category already exists'],
	},
})

const categoryModel = db.model('categories', categorySchema)
module.exports = categoryModel
