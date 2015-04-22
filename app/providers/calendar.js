'use strict'
var debug = require('debug')('coffee:app:providers:calendar'),
    googleCalendar = require('google-calendar'),
    async = require('async'),
    datejs = require('datejs'),
    config,
    models,
    providers,
    usersFreeTime = [] // for caching results from google calendar API

// todo: find a way how to define it in configuration
var startDateTime = new Date(Date.parse("next wednesday ").setHours(7, 0, 0)),
    endDateTime = new Date(Date.parse("next wednesday ").setHours(7, 30, 0))


var filterUserCompanyCalendar = function(calendars, userEmail) {
    return calendars.filter(function(item) {
        return item.id === userEmail
    })
}

var getListOfCalendars = function(userAccessToken, userData, callback) {
    debug('getting list of calendars')

    googleCalendar(userAccessToken).calendarList.list(function(error, calendars) {
        debug('callback after getting list of calendars')
        if (error) {
            return callback && callback(error)
        }
        callback && callback(null, userAccessToken, filterUserCompanyCalendar(calendars.items, userData.email))
    })
}

var getIfUserIsFree = function(userAccessToken, calendars, callback) {
    debug('getting info if user is free')

    if (usersFreeTime[userAccessToken]) {
        return callback && callback(null, usersFreeTime[userAccessToken])
    }

    var query = {
        timeMin: startDateTime,
        timeMax: endDateTime,
        timeZone: 'Asia/Bangkok',
        items: calendars
    }

    googleCalendar(userAccessToken).freebusy.query(query, {}, function(error, data) {
        debug('got response about user busyness')

        if (error) {
            return callback && callback(error)
        }
        /**
         * data are in format
         * {
         *      calendars: {[
         *          josef.nevoral@hotelquickly.com: {
         *              busy: [
         *                  timeStart: "2015-04-24 17:00:00"
         *                  timeEnd: "2015-04-24 17:30:00"
         *              ]
                 *  }
         *      ]}
         * }
         */
        var busyTimes = data.calendars[Object.keys(data.calendars)[0]].busy

        if (busyTimes.length > 0) {
            usersFreeTime[userAccessToken] = false
            return callback && callback(null, false)
        }

        usersFreeTime[userAccessToken] = true
        callback(null, true)
    })
}

var isUserFree = function(userId, callback) {

    async.waterfall([
        async.apply(models.User.findById, userId),
        providers.Auth.refreshUserAccessToken,
        getListOfCalendars,
        getIfUserIsFree
    ], callback)
}


var areUsersFree = function(callback) {

    var matchFoundUsers = function(error, userOne, userTwo) {
        if (error) {
            return callback && callback(error)
        }

        async.parallel({
            userOneIsFree: async.apply(isUserFree, userOne.id),
            userTwoIsFree: async.apply(isUserFree, userTwo.id)
        }, function(error, result) {
            if (error) {
                return callback && callback(error)
            }

            var returnResult = {
                users: [userOne, userTwo],
                areUsersFree: result.userOneIsFree && result.userTwoIsFree
            }

            callback(null, returnResult)
        })
    }

    providers.User.findTwoUniqueUsers(matchFoundUsers)
}

// todo: where to put this helper functions?
// filters array of attendees to skip "organizer" of event and formats the result to
// [ { email: userEmail} ]
var filterAttendeesEmails = function(attendees, userEmail) {
    return attendees.map(function(attendee) {
        if (attendee.email !== userEmail) {
            return { email: attendee.email }
        }
    })
}

var createEvent = function(userAccessToken, userEmail, attendees, start, end, callback) {
    var event = {
        summary: 'CoffeeTime meeting between two of us',
        start: { dateTime: "2015-04-22T07:00:00.000Z"/*start*/ },
        end: { dateTime: "2015-04-22T07:30:00.000Z"/*end*/ },
        attendees: filterAttendeesEmails(attendees, userEmail)
    }

    console.log('sending event to ', userEmail, event)

    googleCalendar(userAccessToken).events.insert(userEmail, event, function(error, result) {
        if (error) {
            return callback && callback(error)
        }

        return callback && callback(null, result)
    })
}

var createEventsForAttendees = function(attendees, callback) {
    if (attendees.length < 2) {
        callback('There has to be at least 2 attendees for an event')
    }

    createEvent(attendees[0].accessToken, attendees[0].email, attendees, startDateTime, endDateTime, callback)
}


var setProviders = function(providerObject) {
    providers = providerObject
}

exports.getMethods = function(params) {
    config = params.config
    models = params.models
    providers = params.providers

    return {
        setProviders: setProviders,
        isUserFree: isUserFree,
        areUsersFree: areUsersFree,
        createEventsForAttendees: createEventsForAttendees
    }
}