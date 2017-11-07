'use strict'

module.exports = (function() {
    return {
        port: process.env.PORT || 5000,
        baseUrl: process.env.BASE_URL || 'http://localhost:5000',
        sessionSecret: process.env.SESSION_SECRET || 'HQ rocks',
        consumerKey: process.env.GOOGLE_CONSUMER_KEY,
        consumerSecret: process.env.GOOGLE_CONSUMER_SECRET,
        mongoUri: process.env.MONGO_URI,
        eventOrganiserEmail: process.env.EVENT_ORGANISER_EMAIL,
        admins: process.env.ADMINS ? process.env.ADMINS.split(',') : [],
        planForDaysInAdvance: process.env.PLAN_FOR_DAYS_IN_ADVANCE || 2,
        utcOffset: process.env.UTC_OFFSET || 7,
        planToStartHour: process.env.PLAN_TO_START_HOUR || 15,
        planToEndHour: process.env.PLAN_TO_END_HOUR || 15,
        planToStartMinute: process.env.PLAN_TO_START_MINUTE || 30,
        planToEndMinute: process.env.PLAN_TO_END_MINUTE || 30
      }
})()
