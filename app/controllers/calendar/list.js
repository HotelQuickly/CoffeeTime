'use strict'
var googleCalendar = require('google-calendar'),
    debug = require('debug')('calendarList')

exports.register = function(params) {
    var app = params.app

    app.get('/', function(request, response) {

        googleCalendar(request.user.accessToken).calendarList.list(function(error, data) {
            if (error)  {
                return response.send(500, error)
            }

            var locals = {
                title: 'You are authenticated, dude, you did it!',
                events: data
            };
            response.render('index.jade', locals);
        })

    })

}


