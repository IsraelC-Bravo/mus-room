const multer = require("multer");
const path = require("path");

module.exports = multer({
  sotrage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.origialname);
    //Types of files allowed
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});