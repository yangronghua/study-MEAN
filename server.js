const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

//server
const app = express();
const port = 5000;

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("hello");
});

//user routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.listen(port, () => {
  console.log(`${port}`);
});

//mongo
const db = require("./config/keys").mongoURI;

//contect mongoDB though mongoose
mongoose
  .connect(db)
  .then(() => {
    console.log("mongoDB connected");
  })
  .catch(err => {
    console.log(err);
  });
