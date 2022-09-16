const { compare, hash, genSaltSync } = require('bcrypt')
const emailHelper = require('../../email.helper.js')
const S3Helper = require('../../s3.helper.js')
const db = require('../db.js')
require('dotenv').config()
const { DOMAIN } = process.env

let userSchema = new db.Schema({
	name: { type: String, required: [true, 'No name provided'] },
	username: { type: String, required: [true, 'No username provided'] },
	email: {
		type: String,
		unique: [true, 'Login exists for this email'],
		required: [true, 'No email provided'],
	},
	password: {
		type: String,
		minLength: [8, 'Password too short'],
		maxLength: [16, 'Password too long'],
		required: [true, 'No password provided'],
	},
	address: { type: String, required: [true, 'No address provided'] },
	profile_pic: {
		type: { key: String, link: String },
		required: [true, 'No profile avatar provided'],
	},
	active: {
		type: Boolean,
		default: false,
		required: [true, 'No active state provided'],
	},
})

/**
 * Do password verification and hashing at savetime
 */
userSchema.pre('save', async function (next, opts) {
	this.active = false
	if (
		/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])((?=.*[^\w\d\s:])|(?=.*[_]))([^\s])*$/gm.test(
			this.password
		)
	) {
		const _hash = await hash(this.password, genSaltSync(12)).catch((err) => {
			throw new Error('Failure hashing password')
		})
		this.password = _hash
		next()
	} else throw new Error('Password does not meet requirements \n Password must be between eight and sixteen characters \n Password must have one letter \n Password must have one number \n Password must have one symbol')
})

/**
 * Send verify email right after the user is created
 */
userSchema.post('save', function (doc) {
	emailHelper.sendMail(
		doc.email,
		'API no-reply',
		`Please click the link to confirm that this is you creating an account on our platform.\n${DOMAIN}/api/v1/users/verify/${doc._id}`
	)
})

/**
 * Logic for when a new profile picture is uploaded by a user, to replace the old one and delete it from AWS S3
 */
userSchema.pre('findOneAndUpdate', async function (next, opts) {
	if (this.profile_pic) {
		const docToUpdate = await this.model.findOne(this.getQuery())
		const now = Date.now().toString(16)
		const manageupload = await S3Helper.upload(this.profile_pic, now)
		if (manageupload) {
			this.set({
				profile_pic: { key: now, link: manageupload.Location },
			})
			const oldKey = docToUpdate.profile_pic.key
			await S3Helper.delete(oldKey)
			next()
		} else throw new Error('Upload failed')
	}
})

/**
 * Sign into this user if the password is correct
 * @param {string} password
 * @returns Promise
 */
userSchema.methods.SignIn = function (password) {
	return new Promise(async (resolve, reject) => {
		const same = await compare(password, this.password).catch((err) => {
			reject(err)
		})
		if (same) resolve(true)
		resolve(false)
	})
}

const userModel = db.model('users', userSchema)
module.exports = userModel
