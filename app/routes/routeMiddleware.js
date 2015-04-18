'use strict';

var debug = require('debug')('coffee:middleware:base')

var isAuthenticated = function(request, response, next) {
    if ( ! request.isAuthenticated()) {
        return response.redirect('/auth')
    }
    next()
}

module.exports = function(params) {
    return {
        isAuthenticated: isAuthenticated
    }
}
