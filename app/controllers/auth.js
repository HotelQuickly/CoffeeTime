'use strict'
var passport = require('passport'),
    debug = require('debug')('coffee:app:controllers:auth'),
    providers,
    config

exports.register = function(params) {
    var app = params.app
    config = params.config
    providers = params.providers

    providers.Auth.registerGoogleStrategy(params)

    var googleAuthParams = {
        scope: ['email', 'https://www.googleapis.com/auth/calendar'],
        accessType: 'offline',
        approvalPrompt: 'force'
    }

    app.get('/auth', passport.authenticate('google', googleAuthParams));

    app.get('/auth/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(request, response) {
        return response.redirect('/');
    });

}

