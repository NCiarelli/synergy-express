// Import reuired modules from other files
const express = require("express");
const personalityInsights = require("./watson-api");

// Stuff to save profile to a file
let fs = require('fs');

// Setup a routing object for the server
const routes = express.Router();

// Quick response from server to show its alive and working
routes.get("/", (req, res) => {
  res.send("Server is up and working.");
});

// Generate a new Employee Personaolity Profile
routes.post("/profile", (req, res) => {
  // Setup get profile request for Watson
  let profileParams = {
    // Get the content from the request sent to the server.
    content: req.body,
    contentType: "application/json",
    consumptionPreferences: false,
    rawScores: true
  };
  // Send get profile request to Watson
  personalityInsights
    .profile(profileParams)
    .then(profile => {
      // console.log(JSON.stringify(profile, null, 2));
      // Send the resulting profile back to the Angular App
      res.json(profile);

      // // Write the profile to a file REMOVE FOR PRODUCTION
      // let jsonData = JSON.stringify(profile);
      // fs.writeFile("profile_saves/lastProfile.json", jsonData, function (err) {
      //   if (err) {
      //     console.log(err);
      //   }
      // });
      // console.log("Wrote profile to file");
    })
    .catch(err => {
      console.log("error:", err);
    });
});




module.exports = routes;
