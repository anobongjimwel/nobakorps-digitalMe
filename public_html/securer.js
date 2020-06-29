// securer.js

const passwordHash = require('password-hash')

module.exports = {
    hashpassword: hashpassword,
    tokenize: tokenize
}

function hashpassword(password) {
    return "dm605$"+passwordHash.generate(password).substr(5)+"$$$"
}

function tokenize(accountType, stringToToken) {
    return "$"+accountType+'-'+passwordHash.generate(accountType).substr(5)
}