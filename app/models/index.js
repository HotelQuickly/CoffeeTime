'use strict'

var mongo = require('mongojs'),
    debug = require('debug')('coffee:models:index')

module.exports = function(params) {
    debug('initialisation')

    var mongoConnection = mongo.connect(params.config.mongoUri)

    mongoConnection.on('error', function(error) {
        debug('database error', error);
    });

    mongoConnection.on('ready', function() {
        debug('database connected');
    });

    return {
        User: require('./user').getMethods(mongoConnection.collection('user'))
    }
}

