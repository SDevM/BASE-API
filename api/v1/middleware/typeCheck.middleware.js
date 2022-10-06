const JSONResponse = require('../../../lib/json.helper')
const JWTHelper = require('../../../lib/jwt.helper')

const typeCheck = (types) => {
	const originaltypes = types
	for (let index = 0; index < types.length; index++) {
		switch (types[index]) {
			case 'driver':
				types[index] = 0
				break
			case 'user':
				types[index] = 1
				break
			case 'admin':
				types[index] = 2
				break
		}
	}
	return async (req, res, next) => {
		let deco = JWTHelper.getToken(req, res, 'jwt_auth')
		console.log(deco)
		if (deco && types.includes(deco.type)) {
			next()
		} else {
			JSONResponse.error(
				req,
				res,
				401,
				`Access denied! Route reserved for ${originaltypes.join(', ')}.`
			)
		}
	}
}

module.exports = typeCheck