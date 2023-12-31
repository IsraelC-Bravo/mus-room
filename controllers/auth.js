const session = require("express-session");
const passport = require("passport");
const validator = require("validator");
const crypto = require("crypto");
const User = require("../models/User");

//Login Page
exports.getLogin = (req, res) => {
  if (req.user) {
    if (req.user.role === "Teacher") {
      return res.redirect("/profile/teacher");
    } else if (req.user.role === "Student") {
      return res.redirect(`/profile/student/${req.user._id}`);
    }
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
  //validate password
  if (validator.isEmpty(req.body.password)) {
    validationErrors.push({ msg: "Password cannot be blank." });
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
      req.flash("errors", info);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      let redirectPath;

      if (user.role === "Teacher") {
        redirectPath = "/profile/teacher";
      } else if (user.role === "Student") {
        redirectPath = `/profile/student/${user._id}`;
      } else {
        // Handle other roles as needed
        redirectPath = "/"; // Redirect to a default page if needed
      }

      return res.redirect(redirectPath);
    });
  })(req, res, next);
};

//logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log("Error: Failed to logout.", err);
    }
    console.log("User has logged out.");
    req.session.destroy((err) => {
      if (err) {
        console.log("Error: Failed to destroy the session during logout.", err);
      }
      req.user = null;
      res.redirect("/");
    });
  });
};

//Signup Page
exports.getSignup = (req, res) => {
  if (req.user) {
    if (req.user.role === "Teacher") {
      return res.redirect("/profile/teacher");
    } else if (req.user.role === "Student") {
      return res.redirect(`/profile/student/${req.user._id}`);
    }
  }
  res.render("signup", {
    title: "Create Account",
  });
};

//Post Signup info and validate params
exports.postSignup = async (req, res, next) => {
  const validationErrors = [];
  //validate email
  if (!validator.isEmail(req.body.email)) {
    validationErrors.push({ msg: "Please enter a valid email address." });
  }
  //validate password length to 8 chars. Should add At least 1 symbol and 1 cap
  if (!validator.isLength(req.body.password, { min: 8 })) {
    validationErrors.push({
      msg: "Password must be at least 8 characters long.",
    });
  }
  if (req.body.password !== req.body.confirmPassword) {
    validationErrors.push({ msg: "Passwords do not match." });
  }
  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("../signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  //Class code generator
  function generateClassCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const classCodeLength = 5; //Adjust later if nedded
    let classCode = "";

    for (let i = 0; i < classCodeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      classCode += characters.charAt(randomIndex);
    }

    return classCode;
  }

  //validate User
  try {
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { userName: req.body.userName }],
    });

    if (existingUser) {
      req.flash("errors", {
        msg: "Account with that email address or username already exists.",
      });
      return res.redirect("../signup");
    }

    //create new User... later should put more features such as: age.
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      role: req.body.role,
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      classCode: req.body.role === "Teacher" ? generateClassCode() : undefined, //Capture and save class code.
    });

    // Save the user to the database
    await user.save();

    // Log in the user
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      if (user.role === "Teacher") {
        return res.redirect("/profile/teacher");
      } else if (user.role === "Student") {
        return res.redirect(`/profile/student/${user._id}`);
      } else {
        // Handle other roles as needed
        return res.redirect("/"); // Redirect to a default page if needed
      }
    });
  } catch (err) {
    // Handle any errors that occurred during the process
    return next(err);
  }
};
