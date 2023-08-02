const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

module.exports = {
  //Teacher's Profile
  getTeacherProfile: async (req, res) => {
    try {
      //now...here I want to display students... not posts
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  //Student's Profile
  getStudentProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  //TasksFeed
  getTasksFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("tasksFeed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  //Get Individual Task
  getTask: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({ post: req.params.id })
        .sort({ createdAt: "desc" })
        .lean();
      res.render("task.ejs", {
        post: post,
        user: req.user,
        comments: comments,
      });
    } catch (err) {
      console.log(err);
    }
  },
  //Create a new Task (Teacher Only)
  createTask: async (req, res) => {
    try {
      //Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Task has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  //Like Task
  likeTask: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  //Delete Task
  deleteTask: async (req, res) => {
    try {
      //Find post by ID
      let post = await Post.findById({ _id: req.params.id });
      //Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      //Delete post from database
      await Post.deleteOne({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
};
