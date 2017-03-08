'use strict'

const MongoClient = require('mongodb').MongoClient
const debug = require('debug')('coffeetime:app:mongo-client')

const config = require('../../config/environment')

let connection = null
// eslint-disable-next-line no-unused-vars
let connecting = false

function getConnection() {
  if (connection) {
    return Promise.resolve(connection)
  }

  debug('initialising')
  connecting = true
  return MongoClient.connect(config.mongoUri)
      .then(function (db) {
        debug('mongo started')

        connection = db
        connecting = false

        return connection
      }).catch((error) => {
        debug('mongo start failed', error)
        connecting = false
        throw error
      })
}

module.exports = function(params) {
  debug('initialisation')

  return getConnection()
    .then(connection => {
      return {
        User: require('./user').getMethods(params, connection),
        Event: require('./event').getMethods(params, connection)
      }
    })
}
