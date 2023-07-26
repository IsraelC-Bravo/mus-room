const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes
router.get("/:id", ensureAuth, postsController.getTask);
//tasks, not posts

router.post("/createTask", upload.single("file"), postsController.createTask);

// router.post(
//   "/submitTask/:id",
//   upload.single("file"),
//   postsController.submitTask
// );
//for submitting work

router.put("/likeTask/:id", postsController.likeTask); //later, change this to complete task

//router.put("/completedTask/:id", postController.completedTask) //mark them completed after work has been sumbitted

router.delete("/deleteTask/:id", postsController.deleteTask); //store them after completed? or put in history of completed?

module.exports = router;
