const multer = require("multer");
const storage = multer.memoryStorage();
const uploadAvatar = multer({ storage }).single("avatar"); 
module.exports = uploadAvatar;
