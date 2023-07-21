const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth } = require("../middleware/auth");

//Comment Routes - Teacher & Student

router.post("/createComment/:id", commentsController.createComment);
router.post("/replyComment/:id", commentsController.replyComment);

module.exports = router;
