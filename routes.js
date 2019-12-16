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

// EMPLOYEE ENDPOINTS

// GET /employees endpoint
// Retrieve all employee data from the database
routes.get("/employees", (req, res) => {
  // Make the SQL statement
  const sql = "SELECT * FROM employees ORDER BY id";
  // Send the SQL query
  pool.query(sql).then(result => {
    // Send the result back
    res.json(result.rows);
  });
});

// GET /employees/:name endpoint
// Retrieve employee data by name
routes.get("/employees/:name", (req, res) => {
  // Make the SQL statement
  const sql = "SELECT * FROM employees WHERE name=$1::TEXT";
  // Send the SQL query with the paramters
  pool.query(sql, [req.params.name]).then((result) => {
    // Send the result back
    res.json(result.rows);
  });
});

// POST /employees endpoint
// Add employee to database with the name of the employee in the body of the request
routes.post("/employees", (req, res) => {
  // Make the SQL statement
  const sql = "INSERT INTO employees (name, dominant_personality) VALUES ($1::TEXT, 'None') RETURNING *";
  // Send the SQL query with the paramters
  pool.query(sql, [req.body.name]).then((result) => {
    // Send the copied back resulting database entry with a status code of 201 
    res.status(201);
    res.json(result.rows[0]);
  });
});

// PUT /employees/:id/update-all endpoint
// Update an employees data with all changes
// routes.put("/employees/update-all/:id", (req, res) => {
//   pool.query("UPDATE employees SET name=$1::TEXT")
// });

// PUT /employees/:id/personality-profile
// Update the personality profile and dominant personality of an employee
routes.put("/employees/update-all/:id", (req, res) => {
  // Make the SQL statement
  const sql = "UPDATE employees SET personality_profile=$1::TEXT, dominant_personality=$2::TEXT WHERE id=$3::INT RETURNING *";
  // Setup the params to update the  new personality profile and dominant personality, with the targeted employee's id
  let params = [req.body.personalityProfile, req.body.dominantPersonality, req.params.id];
  // Send the SQL query with the paramters
  pool.query(sql, params).then((result) => {
    // Send the copied back resulting database entry
    res.json(result.rows[0]);
  });
});


// SURVEY ENTRIES ENDPOINTS

// GET /survey-entries/:employee-id
// Get all survey entries associated with an employee by id

// POST /survey-entries/:employee-id
// Add a survey entry for an employee
routes.post("/survey-entries/:employee-id", (req, res) => {
  // Make the SQL statement
  const sql = "INSERT INTO survey_entries (employee_id, content, created) VALUES ($1::TEXT, $2::TEXT, $::INT) RETURNING *";
  // Setup the params to add the new survey entry
  let params = [req.body.personalityProfile, req.body.dominantPersonality, req.params.id];
  // Send the SQL query with the paramters
  pool.query(sql, params).then((result) => {
    // Send the copied back resulting database entry with a status code of 201 
    res.status(201);
    res.json(result.rows[0]);
  });
})
module.exports = routes;
