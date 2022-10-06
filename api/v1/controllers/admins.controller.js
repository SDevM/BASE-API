const adminModel = require('../../../lib/db/models/admin.model')
const { compare } = require('bcrypt')
const JSONResponse = require('../../../lib/json.helper')
const JWTHelper = require('../../../lib/jwt.helper')

class adminsController {
	//Read
	// static get(req, res) {
	// 	let body = JSON.parse(req.params.obj)
	// 	adminModel
	// 		.find(body)
	// 		.then((results) => {
	// 			if (results.length > 0)
	// 				JSONResponse.success(
	// 					req,
	// 					res,
	// 					200,
	// 					'Collected matching admins',
	// 					results
	// 				)
	// 			else {
	// 				JSONResponse.error(req, res, 404, 'Could not find any admins')
	// 			}
	// 		})
	// 		.catch((err) => {
	// 			JSONResponse.error(
	// 				req,
	// 				res,
	// 				500,
	// 				'Fatal error finding admin documents in database'
	// 			)
	// 		})
	// }

	//Create
	// static signUp(req, res) {
	// 	let body = req.body
	// 	hash(body.password, 12)
	// 		.then((hash) => {
	// 			body.password = hash
	// 			adminModel
	// 				.find({ email: body.token })
	// 				.then((result) => {
	// 					if (result.length > 0)
	// 						JSONResponse.error(req, res, 409, 'Admin already exists')
	// 					else {
	// 						let new_admin = new adminModel(body)
	// 						new_admin
	// 							.save()
	// 							.then(() => {
	// 								JSONResponse.success(req,
	// 									res,
	// 									201,
	// 									'Admin created successfully',
	// 									new_admin
	// 								)
	// 							})
	// 							.catch((err) => {
	// 								JSONResponse.error(req,
	// 									res,
	// 									500,
	// 									'Fatal error saving admin'
	// 								)
	// 							})
	// 					}
	// 				})
	// 				.catch((err) => {
	// 					JSONResponse.error(req,
	// 						res,
	// 						500,
	// 						'Fatal error validating email',
	// 						err
	// 					)
	// 				})
	// 		})
	// 		.catch((err) => {
	// 			JSONResponse.error(req, res, 500, 'Fatal error hashing password', err)
	// 		})
	// }

	//Read
	/**
	 * Sign in as administrator
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	static signIn(req, res) {
		let body = req.body
		adminModel
			.findOne({ token: body.token })
			.then((result) => {
				if (result) {
					compare(
						body.passphrase,
						Buffer.from(result.passphrase, 'utf-8').toString(),
						(err, same) => {
							if (err) {
								JSONResponse.error(req, res, 500, 'Server Error', err)
							} else if (same) {
								JWTHelper.setToken(
									req,
									res,
									{
										type: 0,
										self: result._id.toString(),
									},
									'jwt_auth'
								)
								JSONResponse.success(req, res, 200, 'Successful login')
							} else {
								JSONResponse.error(req, res, 401, "Password doesn't match")
							}
						}
					)
				} else JSONResponse.error(req, res, 404, 'No document found')
			})
			.catch((err) => {
				JSONResponse.error(req, res, 500, 'Database Error', err)
			})
	}

	/**
	 * Resume administrator session
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	static session(req, res) {
		let decoded = JWTHelper.getToken(req, res, 'jwt_auth')
		if (decoded && decoded.type == 2)
			adminModel
				.findById(decoded.self)
				.then((result) => {
					JSONResponse.success(req, res, 200, 'Session resumed', result)
				})
				.catch((err) => {
					JSONResponse.error(req, res, 500, 'Database Error', err)
				})
		else JSONResponse.error(req, res, 401, 'No session')
	}

	//Update
	// static updateAdmin(req, res) {
	// 	let body = req.body
	// 	let aid = JWTHelper.getToken(req, res, 'jwt_auth').self
	// 	adminModel.findByIdAndUpdate(aid, body, (err, result) => {
	// 		if (err) {
	// 			JSONResponse.error(
	// 				req,
	// 				res,
	// 				500,
	// 				'Fatal error handling admin model',
	// 				err
	// 			)
	// 		} else if (result.length == 1) {
	// 			JSONResponse.success(
	// 				req,
	// 				res,
	// 				200,
	// 				'Successfully updated admin',
	// 				result
	// 			)
	// 		} else {
	// 			JSONResponse.error(req, res, 404, 'Could not find specified admin')
	// 		}
	// 	})
	// }

	//Delete
	// static deleteAdmin(req, res) {
	// 	let aid = JWTHelper.getToken(req, res, 'jwt_auth').self
	// 	adminModel.findByIdAndDelete(aid, null, (err, result) => {
	// 		if (err) {
	// 			JSONResponse.error(
	// 				req,
	// 				res,
	// 				500,
	// 				'Fatal error handling admin model',
	// 				err
	// 			)
	// 		} else if (result) {
	// 			JSONResponse.success(req, res, 200, 'Successfully deleted an admin')
	// 		} else {
	// 			JSONResponse.error(req, res, 404, 'Could not find admin')
	// 		}
	// 	})
	// }
}
module.exports = adminsController
