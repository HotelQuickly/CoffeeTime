'use strict'
var debug = require('debug')('coffee:app:providers:user'),
    async = require('async'),
    config,
    models,
    providers


var findRandomUniqueUser = function(alreadyFoundUser, callback) {
    var maxTryCount = 5

    var findRandomUser = function(error, userCount, tryCount) {
        if (typeof tryCount === 'undefined') {
            tryCount = 1
        }
        debug('%d. try to find unique random user', tryCount)

        models.User.findRandomUser(userCount, function(error, user) {
            if ( ! user
                || alreadyFoundUser && user.id === alreadyFoundUser.id
            ) {
                // another try
                if (tryCount > maxTryCount) {
                    return callback && callback('Could not found unique user to match with')
                }
                findRandomUser(null, userCount, (tryCount+1))
            } else {
                callback(null, user)
            }
        })
    }

    models.User.countUsers({}, findRandomUser)
}

var findTwoUniqueUsers = function(mainCallback) {
    var userOne,
        userTwo

    async.waterfall([
        async.apply(findRandomUniqueUser, null),
        function(user, callback) {
            debug('trying to find second user')
            userOne = user
            findRandomUniqueUser(user, callback)
        }
    ], function(error, user) {
        if (error) {
            return mainCallback && mainCallback(error)
        }

        userTwo = user

        console.log('userOne is', userOne)
        console.log('userTow is', userTwo)

        mainCallback(null, userOne, userTwo)
    })
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
        findTwoUniqueUsers: findTwoUniqueUsers
    }
}