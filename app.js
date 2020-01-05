//jshint esversion:6
require("dotenv").config();
const express = require("express"),
  bodyParser = require("body-parser"),
  ejs = require("ejs"),
  app = express(),
  bcrypt = require("bcryptjs"),
  mongoose = require("mongoose"),
  encrypt = require("mongoose-encryption"),
  md5 = require("md5"),
  port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const salt = bcrypt.genSaltSync(10);


mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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

const User = new mongoose.model("User", userSchema);

app.route("/").get((req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    User.findOne({
        email: req.body.username
      },
      (err, user) => {
        if (err) console.log(err);
        else {
          if (user) {
            bcrypt.compare(req.body.password, user.password, (err, ok) => {
              if (ok === true) {
                console.log("successfuly to log-in");
                res.render("secrets");
              } else {
                console.log("Password not matched");
                res.redirect("login");
              }
            });
          }
        }
      }
    );
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      // Store hash in your password DB.
      const newUser = new User({
        email: req.body.username,
        password: hash
      });
      newUser.save(err => {
        if (!err) res.render("secrets");
        else console.log(err);
      });
    });
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