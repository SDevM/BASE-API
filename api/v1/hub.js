const router = require('express').Router()
const multer = require('multer')
const JSONResponse = require('../../lib/json.helper')
const S3Helper = require('../../lib/s3.helper')
const adminsController = require('./controllers/admins.controller')
const itemsController = require('./controllers/items.controller')
const upload = multer()
const userController = require('./controllers/users.controller')
const typeCheck = require('./middleware/typeCheck.middleware')

/**
 * Generates the API Docs from the list of routes in the system and attaches descriptions to them
 * from the descriptions array, when you add routes, it will change on the next load to reflect new routes
 * automatically. They appear in the same order as they are written in the code, match the array descriptions
 * to this order.
 */
router.all('', (req, res) => {
	let concat = []
	for (let layer of router.stack) {
		concat.push({
			path: layer.route.path,
			methods: Object.keys(layer.route.methods),
		})
	}
	const descriptions = [
		`API DOCS URL`,
		`Manage users as a CRUD collection where an ID is not needed.
		POST to Sign Up
		GET to validate a session or (admin) Get users as CRUD collection with pagination and filtration
		PATCH to update the current user
		DELETE to delete the current user`,
		`Logs a user in.`,
		`Verification route for a newly registered account.`,
		`Administrative management of users as a CRUD collection via IDs.
		GET any user by ID
		PATCH any user by ID
		DELETE any user by ID`,
		`Route for managing logins and session resumption for admins.`,
		`Route for collecting all items or (admin)creating an item.`,
		`Administrative management of items via IDs.`,
		`Destroy the session and thereby log-out.`,
	]
	let body = {
		name: 'BasicAPI v1',
		version: '1.0.0',
		routes: concat,
		description: descriptions,
	}
	res.render('summary', body)
})

router
	.route('/users')
	.post(upload.single('profile_pic'), userController.signUp)
	.get(userController.session, typeCheck(['admin']), userController.get)
	.patch(userController.updateUser)
	.delete(userController.destroyUser)

router.all('/users/login', userController.signIn)

router.all('/users/verify/:id(^[a-fA-Fd]{24}$)', userController.verifyUser)

router
	.route('/users/:id(^[a-fA-Fd]{24}$)')
	.all(typeCheck(['admin']))
	.get(userController.getId)
	.patch(userController.updateUserAny)
	.delete(userController.destroyUserAny)

router.route('/admins').post(adminsController.signIn).get(adminsController.session)

router
	.route('/items')
	.get(itemsController.get)
	.all(typeCheck(['admin']))
	.post(upload.single('image'), itemsController.add)
router
	.route('/items/:id(^[a-fA-Fd]{24}$)')
	.all(typeCheck(['admin']))
	.patch(itemsController.update)
	.delete(itemsController.destroy)

router.route('/logout').all(logout)

router.route('/s3/:key').get(async (req, res) => {
	let file = await S3Helper.download(req.params.key).catch((err) => {
		console.error(err);
		JSONResponse.error(req, res, 500, 'Failed to communicate with file storage')
	})
	if (file) res.send(file)
	else JSONResponse.error(req, res, 404, 'File not found')
})

module.exports = router

function logout(req, res) {
	JWTHelper.killToken(req, res, 'jwt_auth')
	JSONResponse.success(req, res, 200, 'Logged out successfully!')
}
