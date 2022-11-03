class JSONResponse {
	/**
	 * Sends a successful json response to the request
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 * @param {Number} status Status number of the response
	 * @param {String} message Message to send along with the response
	 * @param {Object} data Payload
	 */
	static success(req, res, status = 200, message = 'Success', data = null) {
		res.status(status).json({
			status: status,
			message,
			data,
		})
	}

	/**
	 * Sends an erroneous json response to the request
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 * @param {Number} status Status number of the response
	 * @param {String} message Message to send along with the response
	 * @param {Error} error Relevant error
	 */
	static error(req, res, status = 500, message = 'Error', error) {
		let out = !error ? new Error(message) : error
		console.error(out)
		res.status(status).json({
			status: status,
			message,
			error: out,
		})
	}
}

module.exports = JSONResponse
