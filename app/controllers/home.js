'use strict'

var async = require('async'),
    utils,
    providers

var eventList = function(request, response) {
    async.parallel({
        'users': providers.User.findAll,
        'pastEvents': providers.Event.findPastEvents,
        'futureEvents': providers.Event.findFutureEvents
    }, function(error, results) {
        var locals = {
            users: results['users'],
            pastEvents: results['pastEvents'],
            futureEvents: results['futureEvents'],
            prettyDate: utils.prettyDate
        }

        response.render('home/index.jade', locals)
    })
}

exports.register = function(params) {
    var app = params.app
    var routeMiddleware = params.routerMiddleware
    providers = params.providers
    utils = params.utils

    app.get('/home', routeMiddleware.isAuthenticated, eventList)
}

