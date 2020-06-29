// applicants.js

const mongo = require('mongodb').MongoClient
const express = require('express')
const securer = require('./securer')
const session = require('express-session')
const serveIndex = require('serve-index')
const logger = require('./logger')
const app = express()

var mongourl = "mongodb://localhost:27017"
var mongoopts = { useUnifiedTopology: true }

var db

app.use(session({
    secret: "digitalMeSecretString",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30 * 3 // 3 Months
    }
}))

module.exports = {
    apply: apply,
    hasDuplicate: (walletAddress, emailAddress) => {
        // mongo.connect(mongourl, mongoopts)
        // function(err, db) {
        //     if (err) throw err;
        //     var dbo = db.db("digitalme");
        //     var query = { $or: [{ walletAddress: walletAddress, emailAddress: emailAddress }] }
        //     dbo.collection("applicants").find(query).toArray(function(err, result) {
        //         if (err) throw err
        //         db.close()
        //     })
        // })
    },
}

// Async Functions

async function apply(walletAddress, emailAddress, password, name, physicalAddress, nationality, salaryFlooringCurrency = "PHP", salaryFlooring = 0, salaryCeilingCurrency = "PHP", salaryCeiling = 0, exists = true, nameChanges = 0) {
    return new Promise((resolve, reject) => {
        mongo.connect(mongourl, mongoopts, (err, con) => {
            if (err)
            {
                logger.logError(walletAddress + " is not added as an applicant, an error has occured.")
                reject(err)
            }
            db = con.db('digitalme')
            var applicant = {
                walletAddress: walletAddress,
                emailAddress: emailAddress,
                password: securer.hashpassword("1234"),
                name: name,
                nameChanges: nameChanges,
                physicalAddress: physicalAddress,
                nationality: nationality,
                exists: exists,
                salaryFlooringCurrency: salaryFlooringCurrency,
                salaryFlooring: salaryFlooring,
                salaryCeilingCurrency: salaryCeilingCurrency,
                salaryCeiling: salaryCeiling,
                token: securer.tokenize("applicant", walletAddress),
                resetPasscode: Math.floor(Math.random()*1000001)
            }
            var insertion = db.collection('applicants').insertOne(applicant, (err, result) => {
                if (err !== null) {
                    var errorStatement
                    switch (err.code) {
                        case 11000:
                            errorStatement = walletAddress + " is not added as an applicant, duplicates found."
                    }
                    logger.logError(errorStatement)
                    return reject(err)
                } else {
                    logger.logSuccess(walletAddress + " has been added as an applicant.")
                    return resolve(true)
                }
            })
        })
    })
}

async function hasDuplicates(walletAddress, emailAddress) {
    return new Promise((resolve, reject) => {
        mongo.connect(mongourl, mongoopts, (err, con) => {
            if (err) reject(err)
            db = con.db('digitalme')
            var query = { $or: [{ walletAddress: walletAddress, emailAddress: emailAddress }] }
            db.collection("applicants").find(query).toArray(function(err, result) {
                if (err) {
                    logger.logError("An error has occured in finding duplicates for ("+walletAddress+") and "+"("+emailAddress+")")
                    return reject(err)
                } else {
                    db.close()
                    console.log(result)
                    return resolve(true)
                }
            })
        })
    })
}
