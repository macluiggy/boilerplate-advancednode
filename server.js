"use strict";
require("dotenv").config();
const express = require("express");
// const { session } = require("passport");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
var session = require("express-session");
const ObjectId = require("mongodb").ObjectID;
const LocalStrategy = require("passport-local");
// const bcrypt = require("bcrypt");
const routes = require("./routes");
const auth = require("./auth");

const app = express();
app.set("view engine", "pug"); //establece que motor de vista se va a usar, osea el que va a renderizar la pagina hmtl

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET, //secreto para encriptar la sesion
    resave: true, // si se debe volver a guardar la sesion
    saveUninitialized: true, // si se debe guardar la sesion sin inicializar
    cookie: { secura: false }, // si se debe usar una cookie segura
  })
);

app.use(passport.initialize()); // inicializa passport
app.use(passport.session()); // inicializa session
// app.route("/").get((req, res) => {
//   res.render(process.cwd() + "/views/pug", {
//     title: "Hello",
//     message: "Please login",
//   }); //uitiliza render usango el motor (engine) establecido (app.set)
// });

myDB(async (client) => {
  const myDataBase = await client.db("database").collection("users");

  routes(app, myDataBase);
  auth(app, myDataBase);

  app.use((req, res, next) => {
    res.status(404).type("text").send("Not Found");
  });
}).catch((e) => {
  app.route("/").get((req, res) => {
    res.render("pug", { title: e, message: "Unable to login" });
  });
});
// app.listen out here...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
