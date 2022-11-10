
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
	static setToken(req, res, payload, name, expire = '1d') {
		const token = this.#genToken(payload, expire)
		res.append(name, `Bearer ${token}`)
	}

	/**
	 * Get the token from the authorization header
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	static getToken(req, res, name) {
		let decoded
		try {
			decoded = jwt.verify(req.headers.authorization.split(' ')[1], SESSION_SECRET)
		} catch (err) {
			console.error('Killing token', err)
			this.killToken(req, res, name)
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
		const token = this.#genToken({}, 0)
		res.append(name, `Bearer ${token}`)
	}
}

module.exports = JWTHelper
