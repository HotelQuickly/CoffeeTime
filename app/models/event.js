'use strict'

var debug = require('debug')('coffee:app:models:event'),
    moment = require('moment'),
    eventCollection,
    log

var hasUserPlannedEvent = function(userEmail, startDateTime, endDateTime, callback) {
    debug('checking if user has already some event planned')
    var query = {
        attendees: {
            $elemMatch: {
                email: userEmail
            }
        },
        start: {
            dateTime: startDateTime.format()
        },
        end: {
            dateTime: endDateTime.format()
        }
    }
    eventCollection.find(query, callback)
}

var save = function(event, callback) {
    eventCollection.save(event, callback)
}

var findAll = function(callback) {
    eventCollection.find({}).toArray(callback)
}

var findPastEvents = function(callback) {
    eventCollection.find({
        "start.dateTime": { $lt: moment().format()}
    }).toArray(callback)
}

var findFutureEvents = function(callback) {
    eventCollection.find({
        "start.dateTime": { $gt: new Date}
    }).toArray(callback)
}

exports.getMethods = function(params, mongoEventCollection) {
    eventCollection = mongoEventCollection
    log = params.utils.log

    return {
        hasUserPlannedEvent: hasUserPlannedEvent,
        save: save,
        findAll: findAll,
        findFutureEvents: findFutureEvents,
        findPastEvents: findPastEvents
    }
};