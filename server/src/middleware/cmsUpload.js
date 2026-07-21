const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// CMS/banner er chhobi alada folder e jabe (product/chat er sathe mishbe na)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "simplybe/cms",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // Banner boro hoy, tai force-crop na kore just size limit kortesi
    transformation: [{ width: 2000, height: 2000, crop: "limit" }],
  },
});

const cmsUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max (banner boro hote pare)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

module.exports = cmsUpload;