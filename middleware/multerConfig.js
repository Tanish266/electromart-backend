const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the upload directory exists
const uploadDir = "p_image/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter for image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (allowedTypes.test(extname) && allowedTypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed (JPEG, JPG, PNG)"), false);
  }
};

// Set upload limits and file filter
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
}).fields([
  { name: "MainImage", maxCount: 1 }, // Only one main image
  { name: "ExtraImages", maxCount: 100 }, // Can upload up to 100 extra images
]);

module.exports = upload;
