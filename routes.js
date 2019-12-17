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
  // DEBUG
  console.log("GET /employees endpoint");
  console.log("Request URL Parameters: ", req.params, "Request Body Data: ", req.body);
  // Make the SQL statement
  const sql = "SELECT * FROM employees ORDER BY id;";
  // Send the SQL query
  pool.query(sql).then(result => {
    // DEBUG
    console.log("Database Response: ");
    console.log(result.rows);
    // Send the result back
    res.json(result.rows);
  });
});

// GET /employees/:name endpoint
// Retrieve employee data by name
routes.get("/employees/:name", (req, res) => {
  // DEBUG
  console.log("GET /employees/:name endpoint");
  console.log("Request URL Parameters: ", req.params, "Request Body Data: ", req.body);
  // Make the SQL statement
  const sql = "SELECT * FROM employees WHERE name=$1::TEXT;";
  // Send the SQL query with the paramters
  pool.query(sql, [req.params.name]).then((result) => {
    // DEBUG
    console.log("Database Response: ");
    console.log(result.rows);
    // Send the result back
    res.json(result.rows);
  });
});

// POST /employees endpoint
// Add employee to database with the name of the employee in the body of the request
routes.post("/employees", (req, res) => {
  // DEBUG
  console.log("POST /employees endpoint");
  console.log("Request URL Parameters: ", req.params, "Request Body Data: ", req.body);
  // Make the SQL statement
  const sql = "INSERT INTO employees (name, dominant_personality) VALUES ($1::TEXT, 'None') RETURNING *;";
  // Send the SQL query with the paramters
  pool.query(sql, [req.body.name]).then((result) => {
    // DEBUG
    console.log("Database Response: ");
    console.log(result.rows);
    // Send the copied back resulting database entry with a status code of 201 
    res.status(201);
    res.json(result.rows[0]);
  });
});

// PUT /employees/:id/personality-profile endpoint
// Update the personality profile and dominant personality of an employee
routes.put("/employees/:id/personality-profile", (req, res) => {
  // DEBUG
  console.log("PUT /employees/:id/personality-profile endpoint");
  console.log("Request URL Parameters: ", req.params, "Request Body Data: ", req.body);
  // Make the SQL statement
  const sql = "UPDATE employees SET personality_profile=$1::TEXT, dominant_personality=$2::TEXT WHERE id=$3::INT RETURNING *;";
  // Setup the params to update the  new personality profile and dominant personality, with the targeted employee's id
  let params = [req.body.personalityProfile, req.body.dominantPersonality, req.params.id];
  // Send the SQL query with the paramters
  pool.query(sql, params).then((result) => {
    // DEBUG
    console.log("Database Response: ");
    console.log(result.rows);
    // Send the copied back resulting database entry
    res.json(result.rows[0]);
  });
});

// DELETE /employees/:id
// Delete an employee from the database, includes deleting survey entries from the other table

// SURVEY ENTRIES ENDPOINTS

// GET /employees/:id/survey-entries endpoint
// Get all survey entries associated with an employee by id
routes.get("/employees/:id/survey-entries", (req, res) => {
  // DEBUG
  console.log("GET /employees/:id/survey-entries endpoint");
  console.log("Request URL Parameters: ", req.params, "Request Body Data: ", req.body);
  // Make the SQL statement
  const sql = "SELECT * FROM survey_entries WHERE employee_id=$1 ORDER BY id;";
  // Setup the params to find the entries by the employee id
  let params = [req.params.id];
  // Send the SQL query
  pool.query(sql, params).then(result => {
    // DEBUG
    console.log("Database Response: ");
    console.log(result.rows);
    // Send the result back
    res.json(result.rows);
  });
});

// POST /employees/:id/survey-entries endpoint
// Add a survey entry for an employee
routes.post("/employees/:id/survey-entries", (req, res) => {
  // DEBUG
  console.log("POST /employees/:id/survey-entries endpoint");
  console.log("Request URL Parameters: ", req.params, "Request Body Data: ", req.body);
  // Make the SQL statement
  const sql = "INSERT INTO survey_entries (employee_id, content, created) VALUES ($1::INT, $2::TEXT, $3::BIGINT) RETURNING *;";
  // Setup the params to add the new survey entry
  let params = [req.params.id, req.body.content, req.body.created];
  // DEBUG
  console.log("SQL Statement Parameters: ", params);
  // Send the SQL query with the paramters
  pool.query(sql, params).then((result) => {
    // DEBUG
    console.log("Database Response: ");
    console.log(result.rows);
    // Send the copied back resulting database entry with a status code of 201 
    res.status(201);
    res.json(result.rows[0]);
  }, (err) => {
    console.log("Database Query Error: ");
    console.log(err);
  });
});

// DELETE /employees/:id/survey-entries endpoint
// Delete all survey entries associated with an employee

// TEAM TABLE ENDPOINTS

// GET /teams Endpoint
// Get all saved teams' info

// GET /teams/:name Endpoint
// Get a team's info by name

// POST /teams Endpoint
// Save a team to the database

// PUT /teams/:id Endpoint
// Edit a team's info/notes

// DELETE /teams/:id Enpoint
// Delete a team from the database
module.exports = routes;
