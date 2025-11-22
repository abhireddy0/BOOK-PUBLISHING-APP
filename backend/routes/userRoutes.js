const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const uploadAvatar = require("../middleware/uploadAvatar");
const {
  getMe,
  updateMe,
  updatePassword,
  updateAvatar,
} = require("../controllers/userController");

router.get("/me", auth, getMe);
router.patch("/me", auth, updateMe);
router.patch("/me/password", auth, updatePassword);
router.patch("/me/avatar", auth, uploadAvatar, updateAvatar);

module.exports = router;
