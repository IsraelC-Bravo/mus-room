const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

//userSchema
const UserSchema = new mongoose.Schema({
  fisrtName: { type: String, unique: false },
  lastName: { type: String, unique: false },
  role: { type: String, unique: false },
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
UserSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model("User", UserSchema);
