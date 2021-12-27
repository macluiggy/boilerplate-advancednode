"use strict";
require("dotenv").config();
const express = require("express");
// const { session } = require("passport");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
var session = require("express-session");

const app = express();
app.set("view engine", "pug"); //establece que motor de vista se va a usar, osea el que va a renderizar la pagina hmtl

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.route("/").get((req, res) => {
  res.render(process.cwd() + "/views/pug", {
    title: "Hello",
    message: "Please login",
  }); //uitiliza render usango el motor (engine) establecido (app.set)
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secura: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
