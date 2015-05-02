'use strict'

var userCollection,
    debug = require('debug')('coffee:models:user'),
    config,
    log

var findAll = function(callback) {
    userCollection.find({ email: { $ne: config.eventOrganiserEmail }}).sort({'name.familyName': 1}).toArray(function(error, results) {
        return callback && callback(null, results)
    })
}

var findById = function(userId, callback) {
    userCollection.findOne({id: userId}, callback)
}

var findByEmail = function(email, callback) {
    userCollection.findOne({email: email}, callback)
}

var findOrCreate = function(userData, callback) {
    var insertOrUpdateUserCallback = function (error, user) {
        if (error) {
            log.err('storage', error)
            return callback && callback(error)
        }

        var returnDataCallback = function(error, user) {
            return callback && callback(null, user)
        }

        if (user) {
            userCollection.update({id: userData.id}, { $set: userData}, returnDataCallback);
        } else {
            userCollection.save(userData, returnDataCallback);
        }
    }
    findById(userData.id, insertOrUpdateUserCallback)
}

/**
 * For some strange reason mongojs findOneAndUpdate is not working
 */
var findOneAndUpdate = function(options, callback) {
    userCollection.update(options.query, options.update, function(error, result) {
        userCollection.find(options.query, function(error, updatedData) {
            callback(null, updatedData[0])
        })
    })
}

var random = function(count) {
    return Math.floor( Math.random() * count )
}

var findRandomUser = function(userCount, excludeUsers, callback) {
    debug('Trying to find random user from %d users', userCount)
    if ( ! userCount) {
        userCount = 1
    }

    userCollection.find({
        email: { $ne: config.eventOrganiserEmail, $nin: excludeUsers }
    }).limit(-1).skip(random(userCount)).next(callback)
}

var countUsers = function(query, callback) {
    userCollection.count(query, callback)
}

exports.getMethods = function(params, mongoUserCollection) {
    userCollection = mongoUserCollection
    config = params.config
    log = params.utils.log

    return {
        findOrCreate: findOrCreate,
        findById: findById,
        findByEmail: findByEmail,
        findAll: findAll,
        update: userCollection.update,
        findOneAndUpdate: findOneAndUpdate,
        findRandomUser: findRandomUser,
        countUsers: countUsers
    }
};