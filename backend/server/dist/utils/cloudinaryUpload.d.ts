import { UploadApiResponse } from "cloudinary";
export declare function uploadImageToCloudinary(buffer: Buffer, folder: string): Promise<UploadApiResponse>;
