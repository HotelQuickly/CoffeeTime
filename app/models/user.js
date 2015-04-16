'use strict'

var userCollection,
    debug = require('debug')('coffee:app:models:user')

var findById = function(userId, callback) {
    var foundUserCallback = function(error, user) {
        if (error) {
            callback(error)
        }
        callback(null, user);

    }

    userCollection.findOne({id: userId}, foundUserCallback);

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
            userCollection.update({id: userData.id}, userData, returnDataCallback);
        } else {
            userCollection.save(userData, returnDataCallback);
        }
    }
    findById(userData.id, insertOrUpdateUserCallback)
}


exports.getMethods = function(mongoUserCollection) {
    userCollection = mongoUserCollection

    return {
        findOrCreate: findOrCreate,
        findById: findById
    }
};