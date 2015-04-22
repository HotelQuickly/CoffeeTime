'use strict'

var debug = require('debug')('coffee:app:models:event'),
    eventCollection,
    log


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

exports.getMethods = function(params, mongoEventCollection) {
    eventCollection = mongoEventCollection
    log = params.utils.log

    return {
        hasUserPlannedEvent: hasUserPlannedEvent
    }
};