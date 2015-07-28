'use strict'

var passport = require('passport'),
    debug = require('debug')('coffee:providers:auth'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    google = require('googleapis'),
    refresh = require('passport-oauth2-refresh'),
    moment = require('moment'),
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

var calculateAccessTokenExpiration = function(expiresIn) {
    return new Date((new Date()).getTime() + (expiresIn * 1000))
}

var registerGoogleStrategy = function() {
    var strategy = new GoogleStrategy({
            clientID: config.consumerKey,
            clientSecret: config.consumerSecret,
            callbackURL: config.baseUrl + "/auth/callback"
        },
        function(accessToken, refreshToken, params, profile, done) {
            var userData = {
                id: profile.id,
                email: profile.emails[0].value,
                displayName: profile.displayName,
                name: profile.name,
                accessToken: accessToken,
                accessTokenExpiresIn: calculateAccessTokenExpiration(params.expires_in),
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
    if ((new Date(user.accessTokenExpiresIn)).getTime() > (new Date()).getTime() + 60000) {
        return callback && callback(null, user.accessToken, user)
    }

    debug('attempting to refresh user token')
    refresh.requestNewAccessToken('google', user.refreshToken, function(err, accessToken, params) {
        debug('refreshed user access token')
        models.User.findOneAndUpdate({
                query: { id: user.id },
                update: { $set: {
                    accessToken: accessToken,
                    accessTokenExpiresIn: moment().add(1, 'hour').format()
                }},
                new: true
            }, function(error, user) {
                callback(null, accessToken, user);
        });
    });
}

var isAdmin = function(email) {
	return config.admins.indexOf(email) > -1;
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
        refreshUserAccessToken: refreshUserAccessToken,
		isAdmin: isAdmin
    }
}