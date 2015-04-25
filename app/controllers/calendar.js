'use strict'
var debug = require('debug')('coffee:controllers:calendar'),
    log,
    config,
    providers

var planCoffeeTimeForRandomUsers = function(request, response) {
    providers.User.planCoffeeTimeForRandomUsers(function(error, result) {
        response.json({
            error: error,
            response: result
        })
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
