// Import Watson SDK elements
const PersonalityInsightsV3 = require('ibm-watson/personality-insights/v3');
const { IamAuthenticator } = require('ibm-watson/auth');

try {
  // When not running via Heroku, this will load the .env file.
  require('dotenv').config();
} catch (e) {
  // When running with Heroku, dotenv doesn't exist so problem NEED TO FIX
}

// Setup the Authentication
const personalityInsights = new PersonalityInsightsV3({
  version: '2017-10-13',
  authenticator: new IamAuthenticator({
    apikey: process.env.API_KEY,
  }),
  url: 'https://gateway.watsonplatform.net/personality-insights/api',
});

module.exports = personalityInsights;
