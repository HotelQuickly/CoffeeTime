'use strict'

// bootstrap the env vars from a file
// silent prevents log to console on production server where there is
// no .env file

require('dotenv').config({silent: true})


var express = require('express'),
    http = require('http'),
    config = require('./config/environment')

var app = express()

require('./config/expressMiddleware')(app, config)

var params = {
    app: app,
    config: config,
    utils: {
        // loggers / helpers / etc
    }
}

var models = require('./app/models')(params)
params.models = models

var providers = require('./app/providers')(params)
params.providers = providers

var routerMiddleware = require('./app/routes/routeMiddleware')(params)
params.routerMiddleware = routerMiddleware

// boot strap routes
require('./app/routes')(params)

http.createServer(app).listen(config.port, function(){
    console.log('CoffeeTime running on port', config.port)
})