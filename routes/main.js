const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes
//Login-Signup Page
router.get("/", homeController.getIndex);

//Route for teacher's profile
router.get("/profile/teacher", ensureAuth, postController.getTeacherProfile);
//Route for student's profile
router.get(
  "/profile/student/:userId",
  ensureAuth,
  postController.getStudentProfile
);

//Tasks Feed for teacher
router.get("/tasksFeed", ensureAuth, postController.getTasksFeed); //check name

//Login
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
//Logout
router.get("/logout", authController.logout);

//Sign up
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;
