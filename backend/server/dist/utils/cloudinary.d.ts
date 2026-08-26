import { UploadApiResponse } from "cloudinary";
export declare function uploadToCloudinary(buffer: Buffer, folder: string): Promise<UploadApiResponse>;
