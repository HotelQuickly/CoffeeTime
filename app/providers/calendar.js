'use strict'
var debug = require('debug')('coffee:app:providers:calendar'),
    googleCalendar = require('google-calendar'),
    async = require('async'),
    config,
    models,
    providers


var filterUserCompanyCalendar = function(calendars, userEmail) {
    return calendars.filter(function(item) {
        return item.id === userEmail
    })
}

var getListOfCalendars = function(userAccessToken, userData, callback) {
    debug('getting list of calendars')

    googleCalendar(userAccessToken).calendarList.list(function(error, data) {
        debug('callback after getting list of calendars')
        callback && callback(null, userAccessToken, filterUserCompanyCalendar(data.items, userData.email))
    })
}

var getIfUserIsBusy = function(userAccessToken, data, callback) {
    debug('getting info is user is busy')

    debug('test')
    debug('what about now')
    var query = {
        timeMin: new Date("2015-04-23T09:00:00"),
        timeMax: new Date("2015-04-23T13:00:00"),
        items: data
    }

    googleCalendar(userAccessToken).freebusy.query(query, {}, callback)
}

var isUserBusy = function(userId, callback) {

    async.waterfall([
        async.apply(models.User.findById, userId),
        providers.Auth.refreshUserAccessToken,
        getListOfCalendars,
        getIfUserIsBusy
    ], callback)
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
        isUserBusy: isUserBusy
    }
}