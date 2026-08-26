import multer from "multer";
const storage = multer.memoryStorage();
const fileFilter = (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
        callback(null, true);
    }
    else {
        callback(new Error("Only image files are allowed."));
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 5,
    },
});
export default upload;
//# sourceMappingURL=upload.js.map