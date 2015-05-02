'use strict'

var async = require('async'),
    utils,
    providers

var userList = function(request, response) {
    async.parallel({
        'users': providers.User.findAll
    }, function(error, results) {
        var locals = {
            users: results['users']
        }

        response.render('user/list.jade', locals)
    })
}

exports.register = function(params) {
    var app = params.app
    var routeMiddleware = params.routerMiddleware
    providers = params.providers
    utils = params.utils

    app.get('/users/list', routeMiddleware.isAuthenticated, userList)
}

