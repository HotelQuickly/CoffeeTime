'use strict'
var debug = require('debug')('coffee:providers:user'),
    async = require('async'),
    config,
    models,
    providers,
    usersWithAlreadyPlannedEvent

// for matching all possible users
var currentLoopNumber = 1


var findRandomUniqueUser = function(alreadyFoundUser, excludeUsers, callback) {
    var maxTryCount = 5

    var findRandomUser = function(error, userCount, tryCount) {
        if (typeof tryCount === 'undefined') {
            tryCount = 1
        }
        debug('%d. try to find unique random user', tryCount)

        models.User.findRandomUser(userCount, excludeUsers, function(error, user) {
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

    models.User.countUsers({email: { $ne: config.eventOrganiserEmail, $nin: excludeUsers}}, findRandomUser)
}

var findTwoUniqueUsers = function(excludeUsers, mainCallback) {
    var userOne,
        userTwo

    async.waterfall([
        async.apply(findRandomUniqueUser, null, excludeUsers),
        function(user, callback) {
            debug('trying to find second user')
            userOne = user
            findRandomUniqueUser(user, excludeUsers, callback)
        }
    ], function(error, user) {
        if (error) {
            return mainCallback && mainCallback(error)
        }

        userTwo = user

        mainCallback(null, userOne, userTwo)
    })
}

var addUsersToPlannedEvents = function(users) {
    for (var userIndex in users) {
        usersWithAlreadyPlannedEvent.push(users[userIndex].email)
    }
}

// todo: too many errors checking, is there a better way?
var matchUsers = function(callback) {
    debug('matching users')
    providers.Calendar.areUsersFree(usersWithAlreadyPlannedEvent, function(error, result) {
        currentLoopNumber++;

        if (error) {
            return callback && callback(error)
        }

        var foundOrganiserAccountCallback = function(error, organiser) {
            if (error) {
                return callback && callback(error)
            }
            addUsersToPlannedEvents(result.users)

            providers.Calendar.createEventsForAttendees(organiser, result.users, function(error, createEventsResult) {
                if (error) {
                    return callback && callback(error)
                }

                return callback && callback()
            })
        }

        if (result.areUsersFree) {
            providers.User.findByEmail(config.eventOrganiserEmail, foundOrganiserAccountCallback)
        } else {
            debug('users are not free')
            return callback && callback()
        }
    })
}

var planCoffeeTimeForRandomUsers = function(mainCallback) {
    models.User.countUsers({}, function(error, usersCount) {
        var maxUserLoopMatching = usersCount
        usersWithAlreadyPlannedEvent = []

        async.whilst(
            function() {
                debug('current loop number: ', currentLoopNumber)
                return currentLoopNumber <= maxUserLoopMatching
            },
            matchUsers,
            function(error) {
                currentLoopNumber = 1;
                if (error) {
                    return mainCallback && mainCallback(error)
                } else {
                    return mainCallback && mainCallback(null, 'matching finished')
                }
            }
        )
    })

}

var deleteUser = function(userId, callback) {
	models.User.deleteUser(userId, callback)

};

var setProviders = function(providerObject) {
    providers = providerObject
}

exports.getMethods = function(params) {
    config = params.config
    models = params.models
    providers = params.providers

    return {
        setProviders: setProviders,
        findTwoUniqueUsers: findTwoUniqueUsers,
        findByEmail: models.User.findByEmail,
        findAll: models.User.findAll,
        planCoffeeTimeForRandomUsers: planCoffeeTimeForRandomUsers,
		deleteUser: deleteUser
    }
}