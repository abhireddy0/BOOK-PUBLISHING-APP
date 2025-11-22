const { v2: cloudinary } = require("cloudinary");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const uploadStream = (options, buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// GET /users/me
exports.getMe = async (req, res) => {
  const me = await User.findById(req.user.id).select("-password");
  if (!me) return res.status(404).json({ message: "User not found" });
  res.json(me);
};

// PATCH /users/me (name, bio)
exports.updateMe = async (req, res) => {
  const { name, bio } = req.body || {};
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  if (typeof name === "string") user.name = name.trim();
  if (typeof bio === "string") user.bio = bio.trim();

  await user.save();
  res.json({ message: "Profile updated", user });
};

// PATCH /users/me/password
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both passwords required" });
  }
  const user = await User.findById(req.user.id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found" });

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) return res.status(400).json({ message: "Current password is wrong" });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ message: "Password changed" });
};

// PATCH /users/me/avatar  (form-data: avatar)
exports.updateAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No avatar file" });

  const upload = await uploadStream(
    {
      folder: "users/avatars",
      resource_type: "image",
      transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face" }],
    },
    req.file.buffer
  );

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: upload.secure_url },
    { new: true }
  ).select("-password");

  res.json({ message: "Avatar updated", user });
};
