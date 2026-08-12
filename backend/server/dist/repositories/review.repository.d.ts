import { IReview } from "../models/Review.js";
declare class ReviewRepository {
    create(data: Partial<IReview>): Promise<any>;
    findById(id: string): Promise<any>;
    findByBookingId(bookingId: string): Promise<any>;
    findByParking(parkingId: string): Promise<any[]>;
    update(id: string, data: Partial<IReview>): Promise<any>;
    delete(id: string): Promise<any>;
}
declare const _default: ReviewRepository;
export default _default;
