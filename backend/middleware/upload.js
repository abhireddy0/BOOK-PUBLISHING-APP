const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
  uploadCover: upload.single("cover"), // field name 'cover'
  uploadFile: upload.single("file")    // field name 'file'
};
