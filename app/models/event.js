'use strict'

const debug = require('debug')('coffee:app:models:event'),
    moment = require('moment')
let eventCollection,
    log

const hasUserPlannedEvent = function(userEmail, startDateTime, endDateTime, callback) {
    debug('checking if user has already some event planned')
    const query = {
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
    eventCollection.find(query).toArray(callback)
}

const save = function(event, callback) {
    eventCollection.save(event, callback)
}

const findAll = function(callback) {
    eventCollection.find({}).toArray(callback)
}

const findPastEvents = function(callback) {
    eventCollection.find({
        "start.dateTime": { $lt: moment().format()}
    }).toArray(callback)
}

const findFutureEvents = function(callback) {
    eventCollection.find({
        "start.dateTime": { $gt: moment().format()}
    }).toArray(callback)
}

exports.getMethods = function(params, connection) {
    eventCollection = connection.collection('event')
    log = params.utils.log

    return {
        hasUserPlannedEvent: hasUserPlannedEvent,
        save: save,
        findAll: findAll,
        findFutureEvents: findFutureEvents,
        findPastEvents: findPastEvents
    }
};