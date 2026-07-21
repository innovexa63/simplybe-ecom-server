const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Chat er jonno alada storage — product upload.js theke independent,
// tai product image upload er sathe kono conflict hobe na
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "simplybe/chat",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // shudhu boro size ta limit kortesi, product er moto force-crop kortesi na
    transformation: [{ width: 1200, height: 1200, crop: "limit" }],
  },
});

const chatUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

module.exports = chatUpload;