'use strict'
var debug = require('debug')('coffee:providers:calendar'),
    googleCalendar = require('google-calendar'),
    async = require('async'),
    moment = require('moment'),
    config,
    models,
    providers

// todo: define the times from configuration
var startDateTime = moment().add(2, 'days').hours(7).minutes(0).seconds(0).utcOffset(7),
    endDateTime = moment().add(2, 'days').hours(7).minutes(30).seconds(0).utcOffset(7)


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
        callback && callback(null, userAccessToken, userData.email, filterUserCompanyCalendar(calendars.items, userData.email))
    })
}

var getIfUserIsFree = function(userAccessToken, userEmail, calendars, callback) {
    debug('getting info if user is free')

    var query = {
        timeMin: startDateTime,
        timeMax: endDateTime,
        timeZone: 'Asia/Bangkok',
        items: calendars
    }

    googleCalendar(userAccessToken).freebusy.query(query, {}, function(error, data) {
        debug('got response about user busyness', userEmail)

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
            return callback && callback(null, false)
        }

        providers.Event.hasUserPlannedEvent(userEmail, startDateTime, endDateTime, function(error, events) {
            debug('got users planned events')
            if (error) {
                return callback && callback(error)
            }

            if (events && events.length > 0) {
                return callback && callback(null, false)
            } else {
                return callback && callback(null, true)
            }
        })
    })
}

var isUserFree = function(userId, callback) {
    async.waterfall([
        async.apply(models.User.findById, userId),
        providers.Auth.refreshUserAccessToken,
        getListOfCalendars,
        getIfUserIsFree
    ], function(error, result) {
        callback(error, result)
    })
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

// todo: move this to utils
var getAttendeesEmails = function(attendees) {
    return attendees.map(function(attendee) {
        return { email: attendee.email }
    })
}

var createEvent = function(organiserAccessToken, organiserEmail, attendees, start, end, callback) {
    debug('creating event')

    var event = {
        summary: 'CoffeeTime - chat with a colleague',
        start: { dateTime: startDateTime.format() },
        end: { dateTime: endDateTime.format() },
        attendees: getAttendeesEmails(attendees),
        description: "Friendly chat about work, life and stuff.\n\n Make sure you get to know each other. " +
            "After the chat please fill out the other person profile in confluence (if he does not have one already).\n" +
            "Take a look at already created ones e.g. http://confluence.hotelquickly.com/display/TEAM/Chris+Schalkx"
    }

    googleCalendar(organiserAccessToken).events.insert(organiserEmail, event, function(error, result) {
        if (error) {
            return callback && callback(error)
        }

        providers.Event.saveFromGoogleEventInsertData(result)

        return callback && callback(null, result)
    })
}

var createEventsForAttendees = function(organiserData, attendees, callback) {
    if (attendees.length < 2) {
        callback('There has to be at least 2 attendees for an event')
    }

    providers.Auth.refreshUserAccessToken(organiserData, function(error, organiserAccessToken) {
        if (error) {
            return callback && callback(error)
        }
        createEvent(organiserAccessToken, organiserData.email, attendees, startDateTime, endDateTime, callback)
    })

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