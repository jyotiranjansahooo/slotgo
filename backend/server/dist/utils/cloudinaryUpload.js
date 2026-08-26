import cloudinary from "../config/cloudinary.js";
export function uploadImageToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder,
            resource_type: "image",
        }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (!result) {
                reject(new Error("Cloudinary upload failed."));
                return;
            }
            resolve(result);
        });
        uploadStream.end(buffer);
    });
}
//# sourceMappingURL=cloudinaryUpload.js.map