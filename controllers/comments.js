const Comment = require("../models/Comment");

module.exports = {
  createComment: async (req, res) => {
    try {
      console.log("Comment Body:", req.body.comment);
      console.log("User ID:", req.user.id);
      await Comment.create({
        comment: req.body.comment,
        likes: 0,
        user: req.user.id,
        post: req.params.id,
      });
      console.log("comment has been added!");
      res.redirect("/post/" + req.params.id);
    } catch (err) {
      console.log(err);
    }
  },
};
