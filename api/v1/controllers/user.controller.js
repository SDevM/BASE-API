const userModel = require('../../../lib/db/models/user.model')
const JSONResponse = require('../../../lib/json.helper')
const JWTHelper = require('../../../lib/jwt.helper')
const S3Helper = require('../../../lib/s3.helper')

class controller {
	static getAny(req, res) {
		const body = JSON.parse(req.params.obj)
		userModel
			.find(body ?? {})
			.then((results) => {
				if (results.length > 0)
					JSONResponse.success(
						req,
						res,
						200,
						'Collected matching users',
						results
					)
				else JSONResponse.error(req, res, 404, 'Could not find any users')
			})
			.catch((err) => {
				JSONResponse.error(
					req,
					res,
					500,
					'Fatal error handling user model',
					err
				)
			})
	}

	static async signUp(req, res) {
		const body = req.body
		const now = Date.now().toString(16)
		const manageupload = await S3Helper.upload(req.file, now)
		if (manageupload)
			body.profile_pic = { key: now, link: manageupload.Location }
		const new_user = new userModel(body)
		const valResult = await new_user.validate().catch((err) => {
			JSONResponse.error(
				req,
				res,
				400,
				err.errors[
					Object.keys(err.errors)[Object.keys(err.errors).length - 1]
				].properties.message,
				err.errors[
					Object.keys(err.errors)[Object.keys(err.errors).length - 1]
				]
			)
		})
		if (valResult) {
			const saved_user = await new_user.save().catch((err) => {
				JSONResponse.error(req, res, 400, err.message, err)
			})
			JSONResponse.success(req, res, 201, saved_user)
		}
	}

	static async signIn(req, res) {
		const body = req.body
		const user = await userModel
			.findOne({ email: body.email })
			.catch((err) => {
				JSONResponse.error(
					req,
					res,
					500,
					'Fatal error handling user model',
					err
				)
			})
		if (user) {
			const login = await result.SignIn(body.password).catch((err) => {
				JSONResponse.error(req, res, 500, 'Fatal Error! Server Down!', err)
			})
			if (login) {
				JWTHelper.setToken(
					req,
					res,
					{
						type: 1,
						self: result._id.toString(),
					},
					'jwt_auth'
				)
				JSONResponse.success(req, res, 200, 'Successful login')
			} else {
				JSONResponse.error(req, res, 401, 'Password does not match')
			}
		} else JSONResponse.error(req, res, 404, 'Account does not exist')
	}

	static async session(req, res) {
		const decoded = JWTHelper.getToken(req, res, 'jwt_auth')
		if (decoded && decoded.type == 1) {
			const user = await userModel.findById(decoded.self).catch((err) => {
				JSONResponse.error(
					req,
					res,
					500,
					'Failure handling user model',
					err
				)
			})
			if (user) JSONResponse.success(req, res, 200, 'Session resumed', user)
			else JSONResponse.error(req, res, 404, 'Account does not exist')
		} else JSONResponse.error(req, res, 401, 'No session!')
	}

	//Update
	static async verifyUser(req, res) {
		const uid = req.params.id
		const user = await userModel
			.findByIdAndUpdate(uid, { active: true })
			.catch((err) => {
				res.status(500).render('verify', {
					Title: 'Fatal Error! Server Down!',
					Details: err.message,
				})
			})
		if (user) {
			res.status(200).render('verify', {
				Title: 'User verified successfully',
				Link: 'https://your.website/login',
			})
		} else {
			res.status(200).render('verify', {
				Title: 'No User Found!',
				Details: `Trying copying your activation link directly if you attempted to type it`,
			})
		}
	}

	//Refactor to async await
	static async updateUser(req, res) {
		const body = req.body
		body.profile_pic = req.file
		const decoded = JWTHelper.getToken(req, res, 'jwt_auth')
		const uid = decoded.self
		const user = await userModel
			.findByIdAndUpdate(uid, body, { new: true })
			.catch((err) => {
				JSONResponse.error(req, res, 500, err.message, err)
			})
		if (user) {
			JSONResponse.success(
				req,
				res,
				200,
				'Successfully updated user',
				result
			)
		} else JSONResponse.error(req, res, 404, 'Could not find specified user')
	}

	static async updateUserAny(req, res) {
		const uid = req.params.id
		const body = req.body
		body.profile_pic = req.file
		const user = await userModel
			.findByIdAndUpdate(uid, body, { new: true })
			.catch((err) => {
				JSONResponse.error(req, res, 500, err.message, err)
			})
		if (user) {
			JSONResponse.success(
				req,
				res,
				200,
				'Successfully updated user',
				result
			)
		} else JSONResponse.error(req, res, 404, 'Could not find specified user')
	}

	static async destroyUser(req, res) {
		const decoded = JWTHelper.getToken(req, res, 'jwt_auth')
		const uid = decoded.self
		const user = await userModel.findByIdAndDelete(uid).catch((err) => {
			JSONResponse.error(
				req,
				res,
				500,
				'Fatal error handling user model',
				err
			)
		})
		if (user) {
			JSONResponse.success(req, res, 200, 'Successfully removed user')
		} else {
			JSONResponse.error(req, res, 404, 'Could not find specified user')
		}
	}

	static async destroyUserAny(req, res) {
		const uid = req.params.id
		const user = await userModel.findByIdAndDelete(uid).catch((err) => {
			JSONResponse.error(
				req,
				res,
				500,
				'Fatal error handling user model',
				err
			)
		})
		if (user) {
			JSONResponse.success(req, res, 200, 'Successfully removed user')
		} else {
			JSONResponse.error(req, res, 404, 'Could not find specified user')
		}
	}
}
module.exports = controller
