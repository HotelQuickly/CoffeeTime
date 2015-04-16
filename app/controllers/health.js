'use strict'

var healthyCheck = function(request, response) {
    response.json({
        ok: true
    })
}

exports.register = function(params) {
    var app = params.app

    app.get('/healthy-check', healthyCheck)
}

