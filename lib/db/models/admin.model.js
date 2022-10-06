const { compare, hash, genSaltSync } = require('bcrypt')
const db = require('../db.js')
require('dotenv').config()

let adminSchema = new db.Schema({
	name: { type: String, required: [true, 'No name provided'] },
	token: {
		type: String,
		unique: [true, 'Login exists for this token'],
		required: [true, 'No token provided'],
	},
	passphrase: {
		type: String,
		minLength: [8, 'Password too short'],
		maxLength: [16, 'Password too long'],
		required: [true, 'No password provided'],
	},
	profile_pic: {
		type: { key: String, link: String },
		required: [true, 'No profile avatar provided'],
	},
})

adminSchema.pre('save', async function (next, opts) {
	this.active = false
	if (
		/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])((?=.*[^\w\d\s:])|(?=.*[_]))([^\s])*$/gm.test(this.password)
	) {
		const _hash = await hash(this.password, genSaltSync(12)).catch((err) => {
			throw new Error('Failure hashing password')
		})
		this.password = _hash
		next()
	} else throw new Error('Password does not meet requirements \n Password must be between 8 and 16 characters \n Password must have one letter \n Password must have 1 number \n Password must have one symbol')
})

// adminSchema.pre('findOneAndUpdate', async function (next, opts) {
// 	if (this.profile_pic) {
// 		const docToUpdate = await this.model.findOne(this.getQuery())
// 		const now = Date.now().toString(16)
// 		const manageupload = await S3Helper.upload(this.profile_pic, now)
// 		if (manageupload) {
// 			this.set({
// 				profile_pic: { key: now, link: manageupload.Location },
// 			})
// 			const oldKey = docToUpdate.profile_pic.key
// 			await S3Helper.delete(oldKey)
// 			next()
// 		} else throw new Error('Upload failed')
// 	}
// })

adminSchema.methods.SignIn = function (password) {
	return new Promise(async (resolve, reject) => {
		const same = await compare(password, this.password).catch((err) => {
			reject(err)
		})
		if (same) resolve(true)
		resolve(false)
	})
}

const adminModel = db.model('admins', adminSchema)
module.exports = adminModel
