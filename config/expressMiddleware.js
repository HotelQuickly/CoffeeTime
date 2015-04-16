'use strict'

var express = require('express'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    passport = require('passport'),
    debug = require('debug')('expressMiddleware')

// todo move to routesMiddleware and specify it's usage only for routes that should be secured
var isAuthenticated = function(request, response, next) {
    if ( ! request.isAuthenticated()
        && request.path != '/auth'
        && request.path != '/auth/callback'
    ) {
        return response.redirect('/auth')
    }
    next()
}

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

    app.use(isAuthenticated)


    app.use(express.static(__dirname + 'public'))
}
