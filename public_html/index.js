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

// Localization
var lang = new Array()
lang['en-US'] = require('./js/lang/en-US.json')
lang['ja-JA'] = require('./js/lang/ja-JA.json')
lang['tl-PH'] = require('./js/lang/tl-PH.json')

app.use(bodyParser())
app.set('view engine', 'ejs')

// ROUTES
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))
app.use('/img', express.static('img'))

app.use(session({
	secret: "digitalMeSecretString",
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 30 * 3 // 3 Months
	}
}))

app.get('/applicant', (req, res) => {
	if (req.session.lang === undefined) req.session.lang = 'en-US'
	res.locals.lang = lang[req.session.lang]
	res.render('applicant_index')
})

app.get('/applicant', (req, res) => {
	if (req.session.lang === undefined) req.session.lang = 'en-US'
	res.locals.lang = lang[req.session.lang]
	res.render('applicant_index')
})

app.get('/applicant/login', (req, res) => {
	if (req.session.lang === undefined) req.session.lang = 'en-US'
	res.locals.lang = lang[req.session.lang]
	res.render('applicant_login')
})

app.get('/applicant/documents', (req, res) => {
	if (req.session.lang === undefined) req.session.lang = 'en-US'
	res.locals.lang = lang[req.session.lang]
	res.render('applicant_documents')
})


app.get('/applicant/settings', (req, res) => {
	if (req.session.lang === undefined) req.session.lang = 'en-US'
	res.locals.lang = lang[req.session.lang]
	res.render('applicant_settings')
})

app.post('/applicant/settings/changeLanguage', (req, res) => {
	if (req.body.lang !== undefined || req.body.lang !== "") {
		req.session.lang = req.body.lang
	}
	res.redirect('/applicant')
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

app.post('/ajx/check-applicant-duplicates', (req, res) => {
	var walletAddress = req.body.walletAddress
	var emailAddress = req.body.emailAddress
	if (
		(walletAddress != null && typeof walletAddress !== undefined) &&
		(emailAddress != null && typeof  emailAddress !== undefined)
	) {
		applicants.hasDuplicates(walletAddress, emailAddress)
			.then(result => {
				res.json({status: "ok", result: result.length!=0?"yes":"no", duplicates: result.length, date: logger.genLongTime()})
			})
			.catch(err => {
				console.log(err)
				res.json({status: "error", "date": logger.genLongTime()})
			})
	} else {
		res.json({status: "incomplete", "date": logger.genLongTime()})
	}
})

app.post('/ajx/login-applicant', (req, res) => {
	var emailAddress = req.body.emailAddress
	var password = req.body.password
	if (emailAddress != null && password != null) {
		applicants.login(emailAddress, password)
			.then(result => {
				console.log(result)
				res.json({status: "ok"})
			})
			.catch(_ => {
				console.log(_)
				res.json({status: "not ok"})
			})
	} else {
		res.json({status: "not ok"})
	}
})

app.listen(port, () => console.log('DigitalMe now actively listening at port '+port))