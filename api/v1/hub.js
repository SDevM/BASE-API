const router = require('express').Router()
const userController = require('./controllers/user.controller')
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
	.delete(userController.destroyUser)
router.route('/users/register/:id').get(userController.verifyUser)
router.route('/users/register').post(userController.signUp)
router
	.route('/users/:id')
	.all(typeCheck(['admin']))
	.get(userController.getAny)
	.patch(userController.updateUserAny)
	.delete(userController.destroyUserAny)

module.exports = router
