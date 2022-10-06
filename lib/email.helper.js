require('dotenv').config()
const { GMAILU, GMAILP } = process.env
var nodemailer = require('nodemailer')

class Emailer {
	#transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: GMAILU,
			pass: GMAILP,
		},
	})

	constructor() {}
	/**
	 * Sends an email to the intended recipient.
	 * @param {*} to - The recipient or recipient array for the email
	 * @param {*} sub - The subject of the email
	 * @param {*} body - The body of the email
	 */
	sendMail(to, sub, body) {
		let mailOptions = {
			to: to,
			from: GMAILU,
			subject: sub,
			text: body,
		}
		this.#transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.error(error)
				throw error
			} else {
				console.log('Email sent: ' + info.response)
			}
		})
	}
}

module.exports = new Emailer()
