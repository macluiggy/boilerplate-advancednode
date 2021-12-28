"use strict";
require("dotenv").config();
const express = require("express");
// const { session } = require("passport");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
var session = require("express-session");
// const ObjectId = require("mongodb").ObjectID;
// const LocalStrategy = require("passport-local");
// const bcrypt = require("bcrypt");
const routes = require("./routes");
const auth = require("./auth");
const passportSocketIo = require("passport.socketio");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo")(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
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
    cookie: { secure: false }, // si se debe usar una cookie segura
    key: "express.sid", // nombre de la cookie
    store: store, // almacenamiento de la sesion
  })
);

app.use(passport.initialize()); // inicializa passport
app.use(passport.session()); // inicializa session

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser, // the same middleware you registrer in express
    key: "express.sid", // the name of the cookie where express/connect stores its session_id
    secret: process.env.SESSION_SECRET, // the session_secret to parse the cookie
    store: store, // we NEED to use a sessionstore. no memorystore please
    success: onAuthorizeSuccess, // *optional* callback on success - read more below
    fail: onAuthorizedFail, // *optional* callback on fail/error - read more below
  })
);
myDB(async (client) => {
  const myDataBase = await client.db("database").collection("users");

  routes(app, myDataBase);
  auth(app, myDataBase);

  let currentUsers = 0;
  io.on("connection", (socket) => {
    ++currentUsers;
    io.emit("user", {
      name: socket.request.user.name,
      currentUsers,
      connected: true,
    });
    socket.on("chat message", (message) => {
      io.emit("chat message", { name: socket.request.user.name, message });
    });
    console.log("A user has connected");

    socket.on("disconnect", () => {
      console.log("A user has disconnected");
      --currentUsers;
      io.emit("user", {
        name: socket.request.user.name,
        currentUsers,
        connected: false,
      });
    });
  });
}).catch((e) => {
  app.route("/").get((req, res) => {
    res.render("pug", { title: e, message: "Unable to login" });
  });
});
// app.listen out here...
function onAuthorizeSuccess(data, accept) {
  console.log("successful connection to socket.io");
  accept(null, true);
}
function onAuthorizedFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log("failed connection to socket.io:", message);
  accept(null, false);
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
