require('dotenv').config()
const mongoose = require('mongoose')
const { DBHOST } = process.env

mongoose.connect(DBHOST + '/quaco', (err) => {
	if (err) {
		console.log(`\tMongoDB failed to connect @ ${DBHOST}`)
		console.error(err)
		process.exit(-1)
	} else {
		console.log('\tMongoDB succesfully connected..')
	}
})

module.exports = mongoose
