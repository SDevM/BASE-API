class JSONResponse {
	static success(res, status = 200, message = 'success', data = null) {
		res.status(status).json({
			status: status,
			message,
			data,
		})
	}

	static error(
		req,
		res,
		status = 500,
		message = 'error',
		error = new Error(message)
	) {
		res.status(status).json({
			status: status,
			message,
			error,
		})
	}
}

module.exports = JSONResponse
