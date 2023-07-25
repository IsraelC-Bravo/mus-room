const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

//userSchema
const UserSchema = new mongoose.Schema({
  fisrtName: { type: String, unique: false },
  lastName: { type: String, unique: false },
  //role: { type: String, unique: false }, => to check if User is teacher/student
  userName: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
});

//Password hash midleware
UserSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

//Helper method for validatin user's password
UserSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  cb
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

module.exports = mongoose.model("User", UserSchema);