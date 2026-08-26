export interface UploadedImage {
    url: string;
    publicId: string;
}
declare class UploadService {
    uploadParkingImage(file: Express.Multer.File): Promise<UploadedImage>;
    deleteImage(publicId: string): Promise<void>;
}
declare const _default: UploadService;
export default _default;
