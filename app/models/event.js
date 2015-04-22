'use strict'

var debug = require('debug')('coffee:app:models:event'),
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
    console.log(query)
    eventCollection.find(query, callback)
}

var save = function(event, callback) {
    eventCollection.save(event, callback)
}

exports.getMethods = function(params, mongoEventCollection) {
    eventCollection = mongoEventCollection
    log = params.utils.log

    return {
        hasUserPlannedEvent: hasUserPlannedEvent,
        save: save
    }
};