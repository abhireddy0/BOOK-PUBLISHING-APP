const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});


const cfg = cloudinary.config();
console.log("Cloudinary:", { cloud: cfg.cloud_name, key: cfg.api_key, hasSecret: !!process.env.CLOUDINARY_API_SECRET });

module.exports = cloudinary;
