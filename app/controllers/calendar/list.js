'use strict'
var googleCalendar = require('google-calendar'),
    debug = require('debug')('coffee:controllers:calendar'),
    providers

var isUserBusy = function(request, response) {
    providers.Calendar.isUserBusy('107878366677658082756'/*request.user.id*/, function(error, data) {
        if (error) {
            return response.json(error)
        }

        var locals = {
            title: 'You are authenticated, dude, you did it!',
            events: data
        };
        response.json(data)
        //response.render('index.jade', locals);
    })
}

exports.register = function(params) {
    var app = params.app
    var routeMiddleware = params.routerMiddleware
    providers = params.providers

    app.get('/calendar/list'/*, routeMiddleware.isAuthenticated*/, isUserBusy)

}


