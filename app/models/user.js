'use strict'

var userCollection,
    debug = require('debug')('coffee:app:models:user')

var findAll = function(callback) {
    userCollection.find({}).sort({'name.familyName': 1}).toArray(function(error, results) {
        return callback && callback(null, results)
    })
}

var findById = function(userId, callback) {
    userCollection.findOne({id: userId}, callback)
}

var findOrCreate = function(userData, callback) {
    var insertOrUpdateUserCallback = function (error, user) {
        if (error) {
            // todo: log to log management system
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


exports.getMethods = function(mongoUserCollection) {
    userCollection = mongoUserCollection

    return {
        findOrCreate: findOrCreate,
        findById: findById,
        findAll: findAll,
        update: userCollection.update,
        findOneAndUpdate: findOneAndUpdate
    }
};