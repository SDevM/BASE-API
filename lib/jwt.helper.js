require('dotenv').config()
const jwt = require('jsonwebtoken')
const { SESSION_SECRET } = process.env

class JWTHelper {
	/**
	 * Set a new jwt token on the custom header
	 * @param {Object} payload
	 * @param {String | Number} expire
	 */
	static #genToken(payload, expire) {
		return jwt.sign(payload, SESSION_SECRET, { expiresIn: expire })
	}

	/**
	 * Set a new jwt token on the custom header
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	static setToken(req, res, payload, name, expire = '1h') {
		const token = this.#genToken(payload, expire)
		res.set(name, token)
	}

	/**
	 * Set the token from the authorization header
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	static getToken(req, res, name) {
		let decoded
		try {
			decoded = jwt.verify(req.get('Authorizaton').split(' ')[1])
		} catch (err) {
			this.killToken(req, res, name)
			console.error(err)
			decoded = null
		}
		return decoded
	}

	/**
	 * Set the token to die immediately
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	static killToken(req, res, name) {
		token = this.#genToken({}, 0)
		res.set(name, token)
	}
}

module.exports = JWTHelper
