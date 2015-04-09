'use strict'

var healthyCheck = function(request, response) {
    // todo: check database connection?
    response.json({
        ok: true
    })
}

exports.register = function(params) {
    var app = params.app

    app.get('/healthy-check', healthyCheck)
}

