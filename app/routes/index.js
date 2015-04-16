'use strict'
var debug = require('debug')('coffee:app:routes:index')

module.exports = function(params) {
    // require controllers and have them register routes with the express app
    require('../controllers/health').register(params)
    require('../controllers/auth').register(params)
    require('../controllers/calendar/list').register(params)

}