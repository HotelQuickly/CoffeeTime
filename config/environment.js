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
		admins: [
			'josef.nevoral@hotelquickly.com'
		],
		planForDaysInAdvance: process.env.PLAN_FOR_DAYS_IN_ADVANCE || 2
    }
})()

