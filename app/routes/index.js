'use strict'
var debug = require('debug')('index')

module.exports = function(params) {
    debug(params)
    // require controllers and have them register routes with the express app
    require('../controllers/health').register(params)

}