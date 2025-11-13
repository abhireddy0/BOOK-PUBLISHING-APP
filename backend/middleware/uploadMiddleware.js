const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadCover = upload.single("cover"); // key: 'cover'
exports.uploadFile  = upload.single("file");  // key: 'file'
