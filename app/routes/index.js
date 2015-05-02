'use strict'
var debug = require('debug')('coffee:routes:index')

module.exports = function(params) {
    var app = params.app

    // require controllers and have them register routes with the express app
    require('../controllers/health').register(params)
    require('../controllers/auth').register(params)
    require('../controllers/calendar').register(params)
    require('../controllers/user').register(params)
    require('../controllers/home').register(params)

}