const passport = require("passport");
const bcrypt = require("bcrypt");

module.exports = function (app, myDataBase) {
  // Be sure to change the title
  app.route("/").get((req, res) => {
    //Change the response to render the Pug template
    res.render(process.cwd() + "/views/pug", {
      title: "Connected to Database",
      message: "Please login",
      showLogin: true,
      showRegistration: true,
    });
  });

  app.route("/login").post(
    passport.authenticate("local", { failureRedirect: "/" }), // la autenticacion es local, y si falla redirige a /
    (req, res) => {
      res.redirect("/profile"); //si la autenticacion es exitosa redirige a /profile
    }
  );
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  }
  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    // si la autenticacion es exitosa redirige a /profile usando next() dentro de la funcion ensureAuthenticated, si no redirige a /
    // res.render(process.cwd() + "/views/pug/index.pug", { showLogin: false });
    res.render(process.cwd() + "/views/pug/profile.pug", {
      username: req.user.username,
    }); // renderiza el template profile.pug
  });
  app.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/");
  });
  app.route("/register").post(
    (req, res, next) => {
      const hash = bcrypt.hashSync(req.body.password, 12); // encripta la contraseña
      myDataBase.findOne({ username: req.body.username }, function (err, user) {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect("/");
        } else {
          myDataBase.insertOne(
            { username: req.body.username, password: hash },
            (err, doc) => {
              if (err) {
                res.redirect("/");
              } else {
                next(null, doc.ops[0]);
              }
            }
          );
        }
      });
    },
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res, next) => {
      res.redirect("/profile");
    }
  );
};
