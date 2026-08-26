import multer from "multer";

const storage = multer.memoryStorage();

const uploadParkingImages = multer({
  storage,

  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image files are allowed."));
      return;
    }

    callback(null, true);
  },
});

export default uploadParkingImages;
