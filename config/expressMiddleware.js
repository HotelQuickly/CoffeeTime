'use strict'

var express = require('express'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    passport = require('passport'),
    debug = require('debug')('expressMiddleware')


module.exports = function(app, config) {
    app.set('views', __dirname + '/../app/views')
    app.set('view engine', 'jade')

    app.use(session({
        secret: config.sessionSecret,
        store: new MongoStore({
            url: config.mongoUri
        })
    }));
    app.use(passport.initialize())
    app.use(passport.session())

    app.use(express.static(__dirname + 'public'))
}
