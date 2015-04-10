'use strict'

// bootstrap the env vars from a file
// silent prevents log to console on production server where there is
// no .env file

require('dotenv').config({silent: true})


var app = require('express')(),
    http = require('http'),
    config = require('./config/environment')

var params = {
    app: app,
    config: config,
    utils: {
        // loggers / helpers / etc
    }
}

// boot strap routes
require('./app/routes')(params)

http.createServer(app).listen(config.port, function(){
    console.log('CoffeeTime running on port', config.port)
})