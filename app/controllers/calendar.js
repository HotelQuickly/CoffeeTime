'use strict'
var debug = require('debug')('coffee:controllers:calendar'),
    providers

var planCoffeeTimeForRandomUsers = function(request, response) {
    // improve to
    // while there are users without coffee time, try to match them
    // limit loop to 3* userCount
    providers.Calendar.areUsersFree(function(error, result) {

        // plan an event for them

        // log the event to mongo for this 2 users

        if (result.areUsersFree) {
            providers.Calendar.createEventsForAttendees(result.users, function(error, createEventsResult) {
                response.json({
                    error: error,
                    result: createEventsResult
                })
            })

        } else {
            response.json('They are not free')
        }
    })
}

var areUsersBusy = function(request, response) {
    providers.Calendar.areUsersFree(function(error, result) {
        response.json({areUsersFree: result})
    })
}

exports.register = function(params) {
    var app = params.app
    var routeMiddleware = params.routerMiddleware
    providers = params.providers

    app.get('/calendar/'/*, routeMiddleware.isAuthenticated*/, areUsersBusy)

    app.get('/calendar/match', planCoffeeTimeForRandomUsers)
}
