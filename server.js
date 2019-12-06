// Import reuired modules from other files
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

// Server setup
const app = express();
app.use(cors());
app.use(express.json());

// Setup routes from the import
app.use(routes);

// define the port
const DEFAULT_PORT = 3000;
// Use Heroku's PORT or default to 3000.
const port = process.env.PORT || DEFAULT_PORT;
// run the server
app.listen(port, () => console.log(`Listening on port: ${port}.`));