const { Readable } = require('stream')

/**
 * @param binary Buffer
 * @returns Readable
 */
exports.bufferToStream = (binary) => {
	const readableInstanceStream = new Readable({
		read() {
			this.push(binary)
			this.push(null)
		},
	})

	return readableInstanceStream
}	
