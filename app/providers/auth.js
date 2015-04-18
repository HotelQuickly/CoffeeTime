'use strict'

var passport = require('passport'),
    debug = require('debug')('coffee:app:providers:auth'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    google = require('googleapis'),
    refresh = require('passport-oauth2-refresh'),
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
    var strategy = new GoogleStrategy({
            clientID: config.consumerKey,
            clientSecret: config.consumerSecret,
            // tood: read this from params.conf
            callbackURL: "http://localhost:5000/auth/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            var userData = {
                id: profile.id,
                email: profile.emails[0].value,
                displayName: profile.displayName,
                name: profile.name,
                accessToken: accessToken,
                refreshToken: refreshToken
            }

            models.User.findOrCreate(userData)
            return done(null, userData.id);
        }
    )

    passport.use(strategy);
    refresh.use(strategy);
}

var refreshUserAccessToken = function(user, callback) {
    console.log(user)
    debug('attempting to refresh user token')
    refresh.requestNewAccessToken('google', user.refreshToken, function(err, accessToken) {
        debug('refreshed user access token')
        models.User.findOneAndUpdate({
                query: { id: user.id },
                update: { $set: {accessToken: accessToken }},
                new: true
            }, function(error, user) {
                callback(null, accessToken, user);
        });
    });
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
        registerGoogleStrategy: registerGoogleStrategy,
        refreshUserAccessToken: refreshUserAccessToken
    }
}