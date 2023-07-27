const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");

//Login Page
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Login",
  });
};

//Post login info and validate params
exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  //validate email
  if (!validator.isEmail(req.body.email)) {
    validationErrors.push({ msg: "Please enter a valid email address." });
  }
  //if errors => redirect
  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error", info);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/profile");
    });
  });
};

//logout
exports.logout = (req, res) => {
  req.logout(() => {
    console.log("User has logged out.");
  });
  req.session.destroy((err) => {
    if (err) {
      console.log("Error : Failed to destroy the session during logout.", err);
    }
    req.user = null;
    req.redirect("/");
  });
};

//Signup Page
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("signup", {
    title: "Create Account",
  });
};

//Post Signup info and validate params
exports.postSignup = (req, res, next) => {
  const validationError = [];
  //validate email
  if (!validator.isEmail(req.body.email)) {
    validationError.push({ msg: "Please enter a valid email address." });
  }
  //validate password length to 8 chars. Should add At least 1 symbol and 1 cap
  if (!validator.isLength(req.body.password, { min: 8 })) {
    validationErrors.push({
      msg: "Passwordmust be at least 8 characters long",
    });
  }
  if (req.body.password !== req.body.confirmPassword) {
    validationError.push({ msg: "Passwords do not match." });
  }
  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("../signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remve_dots: false,
  });

  //create new User... later should put more features such as: age.
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
  });

  //validate User
  User.findOne(
    { $or: [{ email: req.body.email }, { userName: req.body.userName }] },
    (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address or username already exists.",
        });
        return res.redirect("../signup");
      }
      //save user after validation
      user.save((err) => {
        if (err) {
          return next(err);
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/profile");
        });
      });
    }
  );
};
