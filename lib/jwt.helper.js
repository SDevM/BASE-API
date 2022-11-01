require('dotenv').config()
const jwt = require('jsonwebtoken')
const { SESSION_SECRET } = process.env

class JWTHelper {
	static #genToken(payload, expire = '1d') {
		return jwt.sign(payload, SESSION_SECRET, { expiresIn: expire })
	}
	static setToken(req, res, payload, name, expire = '1d') {
		const token = this.#genToken(payload, expire)
		res.cookie(name, token, {
			expiresIn: expire,
			httpOnly: !req.useragent.isMobile,
			secure: true,
			signed: true,
			sameSite: 'none',
		})
	}
	static getToken(req, res, name) {
		let decoded
		try {
			decoded = jwt.verify(req.signedCookies[name], SESSION_SECRET)
		} catch (err) {
			this.killToken(req, res, name)
			console.error(err)
			decoded = null
		}
		return decoded
	}
	static killToken(req, res, name) {
		res.cookie(name, null, {
			expiresIn: 0,
			httpOnly: !req.useragent.isMobile,
			secure: true,
			signed: true,
			sameSite: 'none',
		})
	}
}

module.exports = JWTHelper
