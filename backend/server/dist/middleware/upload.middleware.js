import multer from "multer";
const storage = multer.memoryStorage();
const fileFilter = (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
        callback(null, true);
        return;
    }
    callback(new Error("Only image files are allowed."));
};
const upload = multer({
    storage,
    limits: {
        files: 5,
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter,
});
export default upload;
//# sourceMappingURL=upload.middleware.js.map