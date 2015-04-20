'use strict'
var debug = require('debug')('coffee:app:providers:calendar'),
    googleCalendar = require('google-calendar'),
    async = require('async'),
    datejs = require('datejs'),
    config,
    models,
    providers,
    usersFreeTime = [] // for caching results from google calendar API

var filterUserCompanyCalendar = function(calendars, userEmail) {
    return calendars.filter(function(item) {
        return item.id === userEmail
    })
}

var getListOfCalendars = function(userAccessToken, userData, callback) {
    debug('getting list of calendars')

    googleCalendar(userAccessToken).calendarList.list(function(error, data) {
        debug('callback after getting list of calendars')
        if (error) {
            return callback && callback(error)
        }
        callback && callback(null, userAccessToken, filterUserCompanyCalendar(data.items, userData.email))
    })
}

var getIfUserIsFree = function(userAccessToken, data, callback) {
    debug('getting info if user is free')

    if (usersFreeTime[userAccessToken]) {
        return callback && callback(null, usersFreeTime[userAccessToken])
    }

    var query = {
        // todo: find a way how to define it in configuration
        timeMin: new Date(Date.parse("next wednesday ").setHours(16, 0, 0)),
        timeMax: new Date(Date.parse("next wednesday ").setHours(16, 30, 0)),
        timeZone: 'Asia/Bangkok',
        items: data
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
                userOne: userOne,
                userTwo: userTwo,
                areUsersFree: result.userOneIsFree && result.userTwoIsFree
            }

            callback(null, returnResult)
        })
    }

    providers.User.findTwoUniqueUsers(matchFoundUsers)
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
        areUsersFree: areUsersFree
    }
}