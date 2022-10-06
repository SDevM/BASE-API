class JSONResponse {
	/**
	 * Sends a successful json response to the request
	 * @param {*} res Res from the middleware
	 * @param {*} status Status number of the response
	 * @param {*} message Message to send along with the response
	 * @param {*} data Relevant data
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
	 * @param {*} res Res from the middleware
	 * @param {*} status Status number of the response
	 * @param {*} message Message to send along with the response
	 * @param {*} error Relevant error
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
