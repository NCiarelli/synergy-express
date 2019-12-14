// Import reuired modules from other files
const express = require("express");
const personalityInsights = require("./watson-api");
const pool = require("./pg-connection-pool");

// Stuff to save profile to a file
let fs = require('fs');

// Setup a routing object for the server
const routes = express.Router();

// Quick response from server to show its alive and working
routes.get("/", (req, res) => {
  res.send("Server is up and working.");
});

// Generate a new Employee Personaolity Profile
routes.post("/profile", (request, response) => {
  // Setup a get profile request for Watson
  let profileParams = {
    // Get the content from the request sent to the server.
    content: request.body,
    contentType: "application/json",
    // parameters to have Watson include certain extra data in the profile
    consumptionPreferences: false,
    rawScores: true
  };
  // Send get profile request to Watson
  personalityInsights
    .profile(profileParams)
    .then(profile => {
      // console.log(JSON.stringify(profile, null, 2));
      // Send the resulting profile back to the Angular App
      response.json(profile);

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


// START OF DATABASE ROUTES

// Retrieve all employee data from the database
routes.get("/employees", (req,res) => {
  pool.query("SELECT * FROM employees ORDER BY id").then(result => {
    res.json(result.rows);
  })
});

module.exports = routes;
