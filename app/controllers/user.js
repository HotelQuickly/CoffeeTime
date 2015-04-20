'use strict'

var models

var userList = function(request, response) {
    models.User.findAll(function(err, results) {
        var locals = {
            users: results
        }
console.log(locals)
        response.render('user/list.jade', locals)
    })
}

exports.register = function(params) {
    var app = params.app
    var routeMiddleware = params.routerMiddleware
    models = params.models

    app.get('/users/list', routeMiddleware.isAuthenticated, userList)
}

