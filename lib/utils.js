'use strict'
var moment = require('moment')

module.exports = {
    prettyDate: function(date) {
        return moment(date).format("MMMM Do YYYY, LT ZZ")
    }
}

