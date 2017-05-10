# Coffee Time

An application for connecting people. People can connect their calendar to the app. CoffeeTime then matches 2 people every week based on their free time in calendar and sends them invitation for a talk.

CoffeeTime was developed because our company is growing to the point, where people stop know each other.

## Requirements
* npm
* node
* mongodb
* Google app API key

## Installation
Clone the repository

```
git clone https://github.com/HotelQuickly/CoffeeTime.git && cd CoffeeTime
```
Install dependencies

```
npm install
```
Define environment variables. I suggest using .env file together with [nodemon](https://github.com/remy/nodemon). Example of variables:

```
PORT=5000 
DEBUG=coffee:* 
BASE_URL=http://localhost:5000 
GOOGLE_CONSUMER_KEY=xxx 
GOOGLE_CONSUMER_SECRET=xxx 
MONGO_URI=mongodb://localhost/coffeetime 
EVENT_ORGANISER_EMAIL=(gmail account of google calendar event organiser, e.g. coffee.time@gmail.com)
LOGENTRIES_TOKEN=xxx 
```

`LOGENTRIES_TOKEN` is optional, keep empty if you don't have logentries.com account. You can create your free account for logging errors.

## Get Google API key
You would need create Google application to which users will authorise.

* Go to [google developer console](https://console.developers.google.com/project/), log in with your google account and create new project
* In left-hand menu choose APIs & auth => Credentials
* Click `Create new Client ID` button
* From the pop up choose `Web application` type
* Fill in your app name and other informations, confirm when done
* Add URLs for authorized origins (e.g. `http://localhost:5000`)
* Add URLs for authorization callback, path is `/auth/callback` (e.g. `http://localhost:5000/auth/callback`)
* Copy `Client ID` and `Client secret` and fill them in .env file to `GOOGLE_CONSUMER_KEY` and `GOOGLE_CONSUMER_SECRET` environment variables

Run the app

```
nodemon index.js
```
And open `http://localhost:5000/` in your browser

## Usage

Application provides endpoint `/calendar/match`. Setup a cron job to his this URL once a week.
By default, the meeting is schedule to 3pm GMT+7 for 30 minutes in 2 days when the cron runs. (e.g. if you set the cron to run at 7am every Monday. The meeting will be scheduled to 3pm on Wednesday.

You can change the default schedule time by env variables:

- `UTC_OFFSET` Define the timezone in hours
- `PLAN_TO_START_HOUR` Hour of when the meeting should start
- `PLAN_TO_END_HOUR` Hour of when the meeting should end
- `PLAN_TO_START_MINUTE` Minute of when the meeting should start
- `PLAN_TO_END_MINUTE` Minute of when the meeting should end

### Master account

You *have to* login with the master account defined in env var `EVENT_ORGANISER_EMAIL` before running matching cron.
Without login with this account, no meeting can be planned (Because this master account is organiser of each meeting - so that both guests can decline the invitation)