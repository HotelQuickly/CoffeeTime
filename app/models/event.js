'use strict'

var debug = require('debug')('coffee:app:models:event'),
    eventCollection


var hasUserPlannedEvent = function(userId, date, callback) {
    eventCollection.find({ $or: [
        {
            userOneId: userId
        },
        {
            userTwoId: userId
        }
    ]}, callback)
}

exports.getMethods = function(mongoEventCollection) {
    eventCollection = mongoEventCollection

    return {
        hasUserPlannedEvent: hasUserPlannedEvent
    }
};