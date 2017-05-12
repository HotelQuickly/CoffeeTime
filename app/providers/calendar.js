'use strict'
const debug = require('debug')('coffee:providers:calendar'),
    googleCalendar = require('google-calendar'),
    async = require('async'),
    moment = require('moment')

let config,
    models,
    providers,
	  logger

const getStartDateTime = function() {
	return moment()
    .add(config.planForDaysInAdvance, 'days')
    .utcOffset(config.utcOffset)
    .hours(config.planToStartHour)
    .minutes(config.planToStartMinute)
    .seconds(0)
}

const getEndDateTime = function() {
	return moment()
    .add(config.planForDaysInAdvance, 'days')
    .utcOffset(config.utcOffset)
    .hours(config.planToEndHour)
    .minutes(config.planToEndMinute)
    .seconds(0)
};

const filterUserCompanyCalendar = function(calendars, userEmail) {
    return calendars.filter(function(item) {
        return item.id === userEmail
    })
}

const getListOfCalendars = function(userAccessToken, userData, callback) {
    debug('getting list of calendars')

    if (!userAccessToken) {
        return callback(null, false, null, callback)
    }

    googleCalendar(userAccessToken).calendarList.list(function(error, calendars) {
        debug('callback after getting list of calendars')
        if (error) {
			logger.err(error)
            return callback && callback(error)
        }
        callback && callback(null, userAccessToken, userData.email, filterUserCompanyCalendar(calendars.items, userData.email))
    })
}

const getIfUserIsFree = function(userAccessToken, userEmail, calendars, callback) {
    debug('getting info if user is free')

    if (!userAccessToken) {
        return callback(null, false)
    }

    const query = {
        timeMin: getStartDateTime(),
        timeMax: getEndDateTime(),
        timeZone: 'Asia/Bangkok',
        items: calendars
    }

    googleCalendar(userAccessToken).freebusy.query(query, {}, function(error, data) {
        if (error) {
			logger.err(error)
            return callback && callback(error)
        }
        /**
         * data are in format
         * {
         *      calendars: {[
         *          josef.nevoral@gmail.com: {
         *              busy: [
         *                  timeStart: "2015-04-24 17:00:00"
         *                  timeEnd: "2015-04-24 17:30:00"
         *              ]
                 *  }
         *      ]}
         * }
         */
        const busyTimes = data.calendars[Object.keys(data.calendars)[0]].busy

        if (busyTimes.length > 0) {
            debug('User is busy', userEmail, busyTimes)
            return callback && callback(null, false)
        }

        providers.Event.hasUserPlannedEvent(userEmail, getStartDateTime(), getEndDateTime(), function(error, events) {
            debug('got users planned events')
            if (error) {
				logger.err(error)
                return callback && callback(error)
            }
            debug('He has events planned: ', events)
            if (events && events.length > 0) {
                return callback && callback(null, false)
            } else {
                return callback && callback(null, true)
            }
        })
    })
}

const isUserFree = function(userId, callback) {
    async.waterfall([
        async.apply(models.User.findById, userId),
        providers.Auth.refreshUserAccessToken,
        getListOfCalendars,
        getIfUserIsFree
    ], function(error, result) {
        if (error == 'Refresh failed') {
            return callback(null, false)
        }
        callback(error, result)
    })
}


const areUsersFree = function(usersWithAlreadyPlannedEvent, callback) {

    const matchFoundUsers = function(error, userOne, userTwo) {
        if (error) {
			logger.err(error)
            return callback && callback(error)
        }

        async.parallel({
            userOneIsFree: async.apply(isUserFree, userOne.id),
            userTwoIsFree: async.apply(isUserFree, userTwo.id)
        }, function(error, result) {
            if (error) {
				logger.err(error)
                return callback && callback(error)
            }

            const returnResult = {
                users: [userOne, userTwo],
                areUsersFree: result.userOneIsFree && result.userTwoIsFree
            }

            callback(null, returnResult)
        })
    }

    providers.User.findTwoUniqueUsers(usersWithAlreadyPlannedEvent, matchFoundUsers)
}

// todo: move this to utils
const getAttendeesEmails = function(attendees) {
    return attendees.map(function(attendee) {
        return { email: attendee.email }
    })
}

const createEvent = function(organiserAccessToken, organiserEmail, attendees, start, end, callback) {
    debug('creating event')

    const event = {
        summary: 'CoffeeTime - chat with a colleague',
        start: { dateTime: getStartDateTime().format() },
        end: { dateTime: getEndDateTime().format() },
        attendees: getAttendeesEmails(attendees),
        description: "Let's get to know each other. We can chat about life, work or favourite coffee. Important it that we talk."
    }

    googleCalendar(organiserAccessToken).events.insert(organiserEmail, event, function(error, result) {
        if (error) {
			logger.err(error)
            return callback && callback(error)
        }

        providers.Event.saveFromGoogleEventInsertData(result)

        return callback && callback(null, result)
    })
}

const createEventsForAttendees = function(organiserData, attendees, callback) {
    if (attendees.length < 2) {
        callback('There has to be at least 2 attendees for an event')
    }

    providers.Auth.refreshUserAccessToken(organiserData, function(error, organiserAccessToken) {
        if (error) {
			logger.err(error)
            return callback && callback(error)
        }
        createEvent(organiserAccessToken, organiserData.email, attendees, getStartDateTime(), getEndDateTime(), callback)
    })

}


const setProviders = function(providerObject) {
    providers = providerObject
}

exports.getMethods = function(params) {
    config = params.config
    models = params.models
    providers = params.providers
	logger = params.utils.log

    return {
        setProviders: setProviders,
        isUserFree: isUserFree,
        areUsersFree: areUsersFree,
        createEventsForAttendees: createEventsForAttendees
    }
}