'use strict'

var debug = require('debug')('coffee:models:event'),
    providers,
    models


var saveFromGoogleEventInsertData = function(googleEvent) {
    models.Event.save(googleEvent)
}

var setProviders = function(providerObject) {
    providers = providerObject
}

exports.getMethods = function(params) {
    models = params.models

    return {
        setProviders: setProviders,
        saveFromGoogleEventInsertData: saveFromGoogleEventInsertData,
        hasUserPlannedEvent: models.Event.hasUserPlannedEvent,
        findAll: models.Event.findAll,
        findFutureEvents: models.Event.findFutureEvents,
        findPastEvents: models.Event.findPastEvents
    }
}