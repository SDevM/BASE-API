require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()
const API_V1 = require('./api/v1/hub.js')
const { NAME, CORS, SERVER_SECRET, DOMAIN, PORT, PRODUCTION } = process.env
const APP_NAME = NAME || 'Express API'

// Establish API
app.all('', (req, res) => {
	res.render('verify', {
		Title: APP_NAME,
		Details: `>> ${CORS} <<`,
	})
})

// Middlewares
app.options(
	'*',
	cors({
		origin: CORS,
		credentials: true,
	})
)
app.use(
	cors({
		origin: CORS,
		credentials: true,
	})
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(SERVER_SECRET))

// View Engine
app.set('views', 'templates')
app.set('view engine', 'ejs')

// API Version
app.use('/api/v1', API_V1)

// Start express app
if (PRODUCTION !== 'production')
	app.listen(PORT, () => {
		console.log(`\n\tServer listening on ${DOMAIN}:${PORT}\n`)
	})
else {
	const _app = app.listen(PORT, require('os').hostname(), () => {
		console.log(
			`\n\t${APP_NAME} listening on https://${_app.address().address}:${
				_app.address().port
			}\n`
		)
	})
}
