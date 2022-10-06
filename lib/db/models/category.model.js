const db = require('../db.js')

let categorySchema = new db.Schema({
	name: { type: String, required: [true, 'Category name blank'] },
})

categorySchema.methods.checkDupe = function () {
	return new Promise(async (resolve, reject) => {
		const dupe = await db
			.model('categories')
			.find({ name: this.name })
			.catch((err) => {
				reject(err)
			})
		resolve(dupe.length > 0)
	})
}

const categoryModel = db.model('categories', categorySchema)
module.exports = categoryModel
