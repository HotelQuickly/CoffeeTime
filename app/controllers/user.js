'use strict'

var async = require('async'),
    utils,
    providers

var userList = function(request, response) {
    async.parallel({
        'users': providers.User.findAll
    }, function(error, results) {
        var locals = {
            users: results['users'],
			isAdmin: providers.Auth.isAdmin(request.user.email)
        }

        response.render('user/list.jade', locals)
    })
}

var userDelete = function(request, response) {
	if ( ! providers.Auth.isAdmin(request.user.email)) {
		return response.render('auth/notAllowed.jade');
	}
	providers.User.deleteUser(request.param('id'), function(error, result) {
		return response.redirect('/users/list')
	})
}

exports.register = function(params) {
    var app = params.app
    var routeMiddleware = params.routerMiddleware
    providers = params.providers
    utils = params.utils

    app.get('/users/list', routeMiddleware.isAuthenticated, userList)
    app.get('/users/:id/delete', routeMiddleware.isAuthenticated, userDelete)
}

