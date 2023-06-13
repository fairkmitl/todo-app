const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();

// import routes
const todoRoutes = require("./routes/todo");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// index route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Todo Application." });
});

// use routes
app.use("/todos", todoRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// seeders uncomment below to use
// const seedData = require('./seeders/seeders');

// Call the seeding function
// seedData();

module.exports = app;
