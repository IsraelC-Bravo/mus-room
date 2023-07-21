const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes
router.get("/:id", ensureAuth, postsController.getTask);
//tasks, not posts

router.post("/createTask", upload.single("file"), postController.createTask);

router.post(
  "/submitTask/:id",
  upload.single("file"),
  postController.submitTask
);
//for submitting work

router.put("/likeTask/:id", postController.likeTask); //later, change this to complete task

//router.put("/completedTask/:id", postController.completedTask) //mark them completed after work has been sumbitted

router.delete("/deleteTask/:id", postController.deleteTask); //store them after completed? or put in history of completed?

module.exports = router;
