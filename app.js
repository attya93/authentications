//jshint esversion:6
require("dotenv").config();
const express = require("express"),
  bodyParser = require("body-parser"),
  ejs = require("ejs"),
  app = express(),
  session = require("express-session"),
  passport = require("passport"),
  passportLocalMongoose = require("passport-local-mongoose"),
  mongoose = require("mongoose"),
  port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(
  session({
    secret: "Our little secret Mezoo.",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  }
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route("/").get((req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
      if (err) console.log(err);
      else {
        req.login(user, err => {
          if (err) console.log("err " + err);
          else {
            passport.authenticate("local")(req, res, () => {
              console.log("Successfully to login :)");
              res.redirect("/secrets");
            });
          }
        });
      }
    });
  });

app.route("/secrets").get((req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    User.register(
      {
        username: req.body.username
      },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, () => {
            // successfully only
            console.log("successfully to Login");
            res.redirect("/secrets");
          });
        }
      }
    );
  });

app.route("/logout").get((req, res) => {
  console.log("Good BYE :(");
  req.logout();
  res.redirect("/");
});

app.listen(port, () => {
  console.log("localhost:3000");
});

/**  this is leve 2 of scurity*/
/*
const secret = process.env.SECRET;
userSchema.plugin(encrypt, {
  secret: secret,
  encryptedFields: ["password"]
});
*/
/**
 * login check to save
   if (user.password === md5(req.body.password)) {
              console.log("successfuly to log-in");
              res.render("secrets");
            } else {
              console.log("Password not matched");
              res.redirect("login");
            }
 */
