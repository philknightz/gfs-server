import multer from "multer";
import path from "path";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // Max size 5MB  each image
  fileFilter: (req, file, cb) => {
    // Validate file type
    const ext = path.extname(file.originalname).toLowerCase();
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
      console.log("Invalid file: ", file);
      return cb(new Error("Only JPG, JPEG and PNG files are allowed. " + file.originalname + " received!"));
    }
    cb(null, true);
  },
});

export default upload;
