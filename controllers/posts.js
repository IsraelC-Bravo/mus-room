const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");

module.exports = {
  //For Teacher's Profile
  getTeacherProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      //Fetch students for the teacher if user is a "teacher"
      let students = [];
      if (user.role === "Teacher") {
        students = await User.find({
          classCode: user.classCode,
          role: "Student",
        });
      }

      res.render("teacherProfile.ejs", {
        title: "Teacher Profile",
        user: user,
        students: students,
        isTeacher: true,
      });
    } catch (err) {
      console.log(err);
    }
  },

  //For student's profile
  getStudentProfile: async (req, res) => {
    console.log("Reached getStudentProfile route");
    try {
      const userId = req.params.userId;
      console.log(userId);
      const user = await User.findById(userId);
      console.log(user);

      //Initialize teacherName variable
      let teacherName = "";

      //Fetch teacher's information if user is a student
      if (user.role === "Student" && user.classCode) {
        const teacher = await User.findOne({
          classCode: user.classCode,
          role: "Teacher",
        });
        if (teacher) {
          teacherName = `${teacher.lastName} ${teacher.firstName}`;
        }
      }

      //Fetch tasks assigned to the student
      const posts = await Post.find({ user: userId });
      console.log(posts);

      //Determine if the user is a teacher
      const isTeacher = user.role === "Teacher";

      //Fetch tasks asigned to the student by the teacher
      let assignedTasks = await Post.find({ assignedTo: userId });

      res.render("studentProfile.ejs", {
        title: "Student Profile",
        user: user,
        teacherName: teacherName,
        posts: posts,
        assignedTasks: assignedTasks, //pass this only for teacher profiles
      });
    } catch (err) {
      console.log(err);
    }
  },

  //Join a Class
  joinClass: async (req, res) => {
    try {
      const { joinClass } = req.body;
      const student = req.user; //for authenticated students

      //Find the teacher's class with enetered class code
      const teacher = await User.findOne({
        classCode: joinClass,
        role: "Teacher",
      });

      if (!teacher) {
        req.flash("error", "Invalid class code. Please try again.");
        return res.redirect("/profile");
      }

      //Add student to teacher's class
      student.classCode = joinClass;
      await student.save();

      req.flash("success", "You have successfully joined the class!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
      req.flash("error", "An error ocurred. Please try again later.");
      res.redirect("/profile");
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
      const post = await Post.findById(req.params.id).populate(
        "user",
        "userName"
      );
      const comments = await Comment.find({ post: req.params.id })
        .populate("user", "userName") // Populate the user property for comments
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

      //Assuming I have a "assignedTo" field in my post schema...
      const assignedTo = req.body.assign;

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
        assignedTo: assignedTo,
      });
      console.log("Task has been added!");
      res.redirect("/profile/teacher");
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
