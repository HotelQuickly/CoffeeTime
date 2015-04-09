var Promise = require("bluebird")

var oauth = require('oauth')

var mongo = Promise.promisifyAll(require('mongodb'))

var gcal = Promise.promisifyAll(require('google-calendar'))


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