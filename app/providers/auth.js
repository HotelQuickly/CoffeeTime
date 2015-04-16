'use strict'

var passport = require('passport'),
    debug = require('debug')('coffee:app:providers:auth'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    config,
    models,
    providers


passport.serializeUser(function(userId, done) {
    debug('serializing')
    done(null, userId);
});

passport.deserializeUser(function(userId, done) {
    debug('deserializing')
    models.User.findById(userId, function(error, userData) {
        done(null, userData);
    })
});

var registerGoogleStrategy = function() {
    passport.use(new GoogleStrategy({
            clientID: config.consumerKey,
            clientSecret: config.consumerSecret,
            // read this from
            callbackURL: "http://localhost:5000/auth/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            profile.accessToken = accessToken
            models.User.findOrCreate(profile)
            return done(null, profile.id);
        }
    ));
}

var setProviders = function(providerObject) {
    providers = providerObject
}

exports.getMethods = function(params) {
    config = params.config
    models = params.models
    providers = params.providers

    return {
        setProviders: setProviders,
        registerGoogleStrategy: registerGoogleStrategy
    }
}