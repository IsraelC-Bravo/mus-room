const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes
//Login-Signup Page
router.get("/", homeController.getIndex);

//Profile & Feed("Tasks") - simplified for Teacher now
router.get("/teacherProfile", ensureAuth, postController.getTeacherProfile);
router.get("/myClasses", ensureAuth, postController.getMyClasses);
router.get("/tasksFeed", ensureAuth, postController.getTasksFeed); //check name everywhere matches "tasks"
//need to add students in teacher's profile

//Profile and Feed("Tasks") - for Students
router.get("/studentProfile", ensureAuth, postController.getStudentProfile);
router.get("/myTasks", ensureAuth, postController.getMyTasks);

//Login
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
//Logout
router.get("/logout", authController.logout);

//Sign up
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;
