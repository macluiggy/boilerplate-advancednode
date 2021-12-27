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
  // // Be sure to change the title
  // app.route("/").get((req, res) => {
  //   //Change the response to render the Pug template
  //   res.render(process.cwd() + "/views/pug", {
  //     title: "Connected to Database",
  //     message: "Please login",
  //     showLogin: true,
  //     showRegistration: true,
  //   });
  // });

  // app.route("/login").post(
  //   passport.authenticate("local", { failureRedirect: "/" }), // la autenticacion es local, y si falla redirige a /
  //   (req, res) => {
  //     res.redirect("/profile"); //si la autenticacion es exitosa redirige a /profile
  //   }
  // );
  // function ensureAuthenticated(req, res, next) {
  //   if (req.isAuthenticated()) {
  //     return next();
  //   }
  //   res.redirect("/");
  // }
  // app.route("/profile").get(ensureAuthenticated, (req, res) => {
  //   // si la autenticacion es exitosa redirige a /profile usando next() dentro de la funcion ensureAuthenticated, si no redirige a /
  //   // res.render(process.cwd() + "/views/pug/index.pug", { showLogin: false });
  //   res.render(process.cwd() + "/views/pug/profile.pug", {
  //     username: req.user.username,
  //   }); // renderiza el template profile.pug
  // });
  // app.route("/logout").get((req, res) => {
  //   req.logout();
  //   res.redirect("/");
  // });
  // app.route("/register").post(
  //   (req, res, next) => {
  //     const hash = bcrypt.hashSync(req.body.password, 12); // encripta la contraseña
  //     myDataBase.findOne({ username: req.body.username }, function (err, user) {
  //       if (err) {
  //         next(err);
  //       } else if (user) {
  //         res.redirect("/");
  //       } else {
  //         myDataBase.insertOne(
  //           { username: req.body.username, password: hash },
  //           (err, doc) => {
  //             if (err) {
  //               res.redirect("/");
  //             } else {
  //               next(null, doc.ops[0]);
  //             }
  //           }
  //         );
  //       }
  //     });
  //   },
  //   passport.authenticate("local", { failureRedirect: "/" }),
  //   (req, res, next) => {
  //     res.redirect("/profile");
  //   }
  // );
  // app.use((req, res, next) => {
  //   res.status(404).type("text").send("Not Found");
  // });
  // // Serialization and deserialization here...

  // passport.serializeUser((user, done) => {
  //   // serializa el usuario
  //   done(null, user._id); // guarda el id del usuario
  // });
  // passport.deserializeUser((id, done) => {
  //   // deserializa el usuario
  //   myDataBase.findOne({ _id: new ObjectId(id) }, (err, doc) => {
  //     // busca el usuario en la base de datos
  //     done(null, doc); // guarda el usuario
  //   });
  // });
  // passport.use(
  //   // usa la estrategia local
  //   new LocalStrategy(function (username, password, done) {
  //     // estrategia local
  //     myDataBase.findOne({ username: username }, function (err, user) {
  //       // busca el usuario en la base de datos
  //       console.log("User " + username + " attempted to log in."); // imprime en consola que el usuario intento loguearse
  //       if (err) {
  //         // si hay un error
  //         return done(err); // retorna el error
  //       }
  //       if (!user) {
  //         // si no encuentra el usuario
  //         return done(null, false); // retorna null y false
  //       }
  //       if (!bcrypt.compareSync(password, user.password)) {
  //         // si la contraseña no es correcta
  //         // si la contraseña no es igual a la contraseña del usuario
  //         return done(null, false); // retorna null y false
  //       }
  //       // si todo sale bien retorna el usuario
  //       return done(null, user);
  //     });
  //   })
  // );
  // // Be sure to add this...
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
