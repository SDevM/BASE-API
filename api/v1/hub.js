const router = require('express').Router()
const multer = require('multer')
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
		`Route for managing logins, session resumptions, user profile updates and deleting profile.`,
		`Activates a newly registered user.`,
		`Registers a new user.`,
		`Administrative management of users via IDs.`,
		`Route for managing logins and session resumption for admins.`,
		`Route for collecting all items or (admin)creating an item.`,
		`Administrative management of items via IDs.`,
		`Log out for any session.`,
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
	.post(userController.signIn)
	.get(userController.session)
	.patch(userController.updateUser)
	.delete(logout)
router.route('/users/register/:id').get(userController.verifyUser)
router.route('/users/register').post(upload.single('profile_pic'), userController.signUp).delete(userController.destroyUser)
router
	.route('/users/:id')
	.all(typeCheck(['admin']))
	.get(userController.getAny)
	.patch(userController.updateUserAny)
	.delete(userController.destroyUserAny)

router.route('/admins').post(adminsController.signIn).get(adminsController.session)

router
	.route('/items')
	.get(itemsController.get)
	.all(typeCheck(['admin']))
	.post(upload.single('image'), itemsController.add)
router
	.route('/items/:id')
	.all(typeCheck(['admin']))
	.patch(itemsController.update)
	.delete(itemsController.destroy)

router.route('/logout').all(logout)

module.exports = router

function logout(req, res) {
	JWTHelper.killToken(req, res, 'jwt_auth')
	JSONResponse.success(req, res, 200, 'Logged out successfully!')
}
