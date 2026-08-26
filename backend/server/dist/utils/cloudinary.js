import cloudinary from "../config/cloudinary.js";
export function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder,
            resource_type: "image",
        }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (!result) {
                reject(new Error("Cloudinary upload returned no result."));
                return;
            }
            resolve(result);
        });
        stream.end(buffer);
    });
}
//# sourceMappingURL=cloudinary.js.map