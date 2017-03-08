'use strict'

// bootstrap the env variables from a file
// silent prevents log to console on production server where there is
// no .env file

require('dotenv').config({silent: true})
const logentries = require('node-logentries')
const log = logentries.logger({
    token: process.env.LOGENTRIES_TOKEN || '4eb1b41a-75f3-4b50-8bb6-fbfe24ddda73'
})

const express = require('express'),
    http = require('http'),
    config = require('./config/environment'),
    utils = require('./lib/utils')

utils.log = log

const app = express()

require('./config/expressMiddleware')(app, config)

const params = {
    app: app,
    config: config,
    utils: utils
}

require('./app/models')(params)
  .then(models => {
    params.models = models

    const providers = require('./app/providers')(params)
    params.providers = providers

    const routerMiddleware = require('./app/routes/routeMiddleware')(params)
    params.routerMiddleware = routerMiddleware

    // boot strap routes
    require('./app/routes')(params)

    http.createServer(app).listen(config.port, function(){
      console.log('CoffeeTime running on port', config.port)
    })
  })
