import cloudinary from "../../config/cloudinary.js";
import ApiError from "../../utils/ApiError.js";

export interface UploadedImage {
  url: string;
  publicId: string;
}

class UploadService {
  async uploadParkingImage(
    file: Express.Multer.File,
  ): Promise<UploadedImage> {
    if (!file) {
      throw new ApiError(400, "Parking image is required.");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new ApiError(400, "Only image files are allowed.");
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "parking-app/parkings",
          resource_type: "image",
        },
        (
          error,
          result,
        ) => {
          if (error) {
            reject(
              new ApiError(
                500,
                error.message || "Cloudinary image upload failed.",
              ),
            );

            return;
          }

          if (!result) {
            reject(
              new ApiError(
                500,
                "Cloudinary did not return an upload result.",
              ),
            );

            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      return;
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      throw new ApiError(
        500,
        "Unable to delete image from Cloudinary.",
      );
    }
  }
}

export default new UploadService();