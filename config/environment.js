'use strict'

module.exports = (function() {
    function constructMongoUri() {
        return 'mongodb://' +
            process.env.MONGO_USER + ':' + process.env.MONGO_PASSWORD + '@' +
            process.env.MONGO_ENDPOINT_1 + ':' + process.env.MONGO_PORT + ',' +
            process.env.MONGO_ENDPOINT_2 + ':' + process.env.MONGO_PORT + ',' +
            process.env.MONGO_ENDPOINT_3 + ':' + process.env.MONGO_PORT +
            '/' + process.env.MONGO_DATABASE
    }

    return {
        port: process.env.PORT || 5000,
        baseUrl: process.env.BASE_URL || 'http://localhost:5000',
        sessionSecret: process.env.SESSION_SECRET || 'HQ rocks',
        consumerKey: process.env.GOOGLE_CONSUMER_KEY,
        consumerSecret: process.env.GOOGLE_CONSUMER_SECRET,
        mongoUri: process.env.MONGO_URI,
        eventOrganiserEmail: process.env.EVENT_ORGANISER_EMAIL,
        admins: [
          'josef.nevoral@hotelquickly.com',
          'zienab.oliveria@hotelquickly.com'
        ],
        planForDaysInAdvance: process.env.PLAN_FOR_DAYS_IN_ADVANCE || 2
        }
})()

