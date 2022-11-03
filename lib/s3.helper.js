require('dotenv').config()
const { AWS_BUCKET_REGION, AWS_ACCESS_ID, AWS_ACCESS_KEY, AWS_BUCKET } =
	process.env
const S3 = require('aws-sdk/clients/s3')
const { bufferToStream } = require('./converters.helper')
const s3 = new S3({
	region: AWS_BUCKET_REGION,
	credentials: {
		accessKeyId: AWS_ACCESS_ID,
		secretAccessKey: AWS_ACCESS_KEY,
	},
})

class S3Helper {
	/**
	 * Upload a file's contents to s3
	 * @param {File} file 
	 * @param {String} name 
	 * @returns Promise
	 */
	static upload(file, name) {
		const uploadConf = {
			Bucket: AWS_BUCKET,
			Body: bufferToStream(file.buffer),
			Key: name,
		}

		return new Promise((resolve, reject) => {
			s3.upload(uploadConf)
				.promise()
				.then((data) => {
					resolve(data)
				})
				.catch((err) => {
					console.error(err)
					resolve(null)
				})
		})
	}

	/**
	 * Delete a file from s3
	 * @param {String} name 
	 * @returns Promise
	 */
	static delete(name) {
		const deleteConf = {
			Bucket: AWS_BUCKET,
			Key: name,
		}

		return new Promise((resolve, reject) => {
			s3.deleteObject(deleteConf)
				.promise()
				.then((data) => {
					resolve(data)
				})
				.catch((err) => {
					console.error(err)
					resolve(null)
				})
		})
	}

	/**
	 * Download a file from s3
	 * @param {String} name 
	 * @returns 
	 */
	static download(name) {
		const downConf = {
			Bucket: AWS_BUCKET,
			Key: name,
		}

		return new Promise((resolve, reject) => {
			s3.getObject(downConf)
				.promise()
				.then((data) => {
					resolve(data)
				})
				.catch((err) => {
					console.error(err)
					resolve(null)
				})
		})
	}
}

module.exports = S3Helper
