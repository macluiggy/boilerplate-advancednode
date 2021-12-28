const passport = require("passport");
const LocalStrategy = require("passport-local");
const GitHubStrategy = require("passport-github").Strategy;
const bcrypt = require("bcrypt");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

module.exports = function (app, myDataBase) {
  // Serialization and deserialization here...

  passport.serializeUser((user, done) => {
    // serializa el usuario
    done(null, user._id); // guarda el id del usuario
  });
  passport.deserializeUser((id, done) => {
    // deserializa el usuario
    myDataBase.findOne({ _id: new ObjectId(id) }, (err, doc) => {
      // busca el usuario en la base de datos
      done(null, doc); // guarda el usuario
    });
  });
  passport.use(
    // usa la estrategia local
    new LocalStrategy(function (username, password, done) {
      // estrategia local
      myDataBase.findOne({ username: username }, function (err, user) {
        // busca el usuario en la base de datos
        console.log("User " + username + " attempted to log in."); // imprime en consola que el usuario intento loguearse
        if (err) {
          // si hay un error
          return done(err); // retorna el error
        }
        if (!user) {
          // si no encuentra el usuario
          return done(null, false); // retorna null y false
        }
        if (!bcrypt.compareSync(password, user.password)) {
          // si la contraseña no es correcta
          // si la contraseña no es igual a la contraseña del usuario
          return done(null, false); // retorna null y false
        }
        // si todo sale bien retorna el usuario
        return done(null, user);
      });
    })
  );
  // Be sure to add this...

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback",
      },
      function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        //Database logic here with callback containing our user object
        myDataBase.findOneAndUpdate(
          { id: profile.id },
          {
            $setOnInsert: {
              id: profile.id,
              name: profile.displayName || "John Doe",
              photo: profile.photos[0].value || "",
              email: Array.isArray(profile.emails)
                ? profile.emails[0].value
                : "No public email",
              created_on: new Date(),
              provider: profile.provider || "",
            },
            $set: {
              last_login: new Date(),
            },
            $inc: {
              login_count: 1,
            },
          },
          { upsert: true, new: true },
          (err, doc) => {
            return cb(null, doc.value);
          }
        );
      }
    )
  );
};
