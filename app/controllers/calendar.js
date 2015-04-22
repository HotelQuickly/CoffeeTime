'use strict'
var debug = require('debug')('coffee:controllers:calendar'),
    log,
    config,
    providers

var planCoffeeTimeForRandomUsers = function(request, response) {
    // improve to
    // while there are users without coffee time, try to match them
    // limit loop to 3* userCount
    providers.Calendar.areUsersFree(function(error, result) {
        if (error) {
            return response.json(error)
        }

        // plan an event for them

        // log the event to mongo for this 2 users

        var foundOrganiserAccountCallback = function(error, organiser) {
            if (error) {
                log.err(error)
                response.json({
                    error: error
                })
            }
            providers.Calendar.createEventsForAttendees(organiser, result.users, function(error, createEventsResult) {
                response.json({
                    error: error,
                    result: createEventsResult
                })
            })
        }

        if (result.areUsersFree) {
            providers.User.findByEmail(config.eventOrganiserEmail, foundOrganiserAccountCallback)
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
    config = params.config
    log = params.utils.log

    app.get('/calendar/'/*, routeMiddleware.isAuthenticated*/, areUsersBusy)

    app.get('/calendar/match', planCoffeeTimeForRandomUsers)
}
