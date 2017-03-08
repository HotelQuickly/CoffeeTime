'use strict'

const debug = require('debug')('coffee:models:user'),
	  moment = require('moment')

let config,
    log,
    userCollection

const findAll = function(callback) {
	const condition = {
		email: { $ne: config.eventOrganiserEmail },
		delFlag: { $ne: 1}
	}
    userCollection.find(condition).sort({'name.familyName': 1}).toArray(function(error, results) {
        return callback && callback(null, results)
    })
}

const findById = function(userId, callback) {
    userCollection.findOne({id: userId}, callback)
}

const findByEmail = function(email, callback) {
    userCollection.findOne({email: email}, callback)
}

const findOrCreate = function(userData, callback) {
    const insertOrUpdateUserCallback = function (error, user) {
        if (error) {
            log.err('storage', error)
            return callback && callback(error)
        }

        const returnDataCallback = function(error, user) {
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
const findOneAndUpdate = function(options, callback) {
    userCollection.update(options.query, options.update, function(error, result) {
        userCollection.find(options.query, function(error, updatedData) {
            callback(null, updatedData[0])
        })
    })
}

const random = function(count) {
    return Math.floor( Math.random() * count )
}

const findRandomUser = function(userCount, excludeUsers, callback) {
    debug('Trying to find random user from %d users', userCount)
    if ( ! userCount) {
        userCount = 1
    }

    userCollection.find({
        email: { $ne: config.eventOrganiserEmail, $nin: excludeUsers },
		delFlag: { $ne: 1}
    }).limit(-1).skip(random(userCount)).next(callback)
}

const deleteUser = function(userId, callback) {
	const data = {
		delFlag: 1,
		deletedAt: moment().format()
	}

	userCollection.update({id: userId}, { $set: data }, function(error, data) {
		if (error) {
			return callback(error)
		}
		return callback(null, data);
	});
}

const countUsers = function(query, callback) {
    userCollection.count(query, callback)
}

exports.getMethods = function(params, connection) {
    userCollection = connection.collection('user')
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
      countUsers: countUsers,
      deleteUser: deleteUser
    }
};