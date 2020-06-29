// CONSTANTS

const mongo = require('mongodb').MongoClient
const express = require('express')
const session = require('express-session')
const serveIndex = require('serve-index')
const passwordHash = require('password-hash')
const applicants = require('./applicants')
const logger = require('./logger')
const app = express()
const bodyParser = require('body-parser')
const port = process.env.port || 9000

app.use(bodyParser())

// ROUTES
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))
app.use('/img', express.static('img'))


app.get('/applicant', (req, res) => {
	res.sendFile(__dirname+'/html/applicant/index.html')
})

app.post('/ajx/add-applicant', (req, res) => {
	var walletAddress = req.body.walletAddress
	var emailAddress = req.body.emailAddress
	var password = req.body.password
	var name = req.body.name
	var physicalAddress = req.body.physicalAddress
	var nationality = req.body.nationality
	var salaryFlooringCurrency = req.body.salaryFlooringCurrency
	var salaryFlooring = req.body.salaryFlooring
	var salaryCeilingCurrency = req.body.salaryCeilingCurrency
	var salaryCeiling = req.body.salaryCeiling
	if (
		(walletAddress != null && walletAddress != "") &&
		(emailAddress != null && emailAddress != "") &&
		(password != null && password != "") &&
		(name != null && name != "") &&
		(physicalAddress != null && physicalAddress != "") &&
		(nationality != null && nationality != "") &&
		(salaryFlooringCurrency != null && salaryFlooringCurrency != "") &&
		(salaryFlooring != null && isFinite(salaryFlooring)) &&
		(salaryCeilingCurrency != null && salaryCeilingCurrency != "") &&
		(salaryCeiling != null && isFinite(salaryCeiling))
	) {
		applicants.apply(req.body.walletAddress, req.body.emailAddress, req.body.password, req.body.name, req.body.physicalAddress, req.body.nationality, req.body.salaryFlooringCurrency, req.body.salaryFlooring, req.body.salaryCeilingCurrency, req.body.salaryCeiling, true, 0)
			.then(result => {
				res.json({status: "ok", date: logger.genLongTime()})
			})
			.catch(error => {
				var statusMsg
				switch (error.code) {
					case 11000:
						statusMsg = "duplicate"
						break;

					default:
						statusMsg = "unknown"
						break;
				}
				res.json({status: statusMsg, problem: error, date: logger.genLongTime()})
			})
	} else {
		res.json({status: "incomplete", date: logger.genLongTime()})
	}
})

app.get('/ajx/has-duplicates')

app.listen(port, () => console.log('DigitalMe now actively listening at port '+port))