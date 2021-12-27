const passport = require("passport");

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
};
