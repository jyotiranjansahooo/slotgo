import { IReview } from "../models/Review.js";
declare class ReviewRepository {
    create(data: Partial<IReview>): Promise<any>;
    findById(reviewId: string): Promise<any>;
    findByBookingId(bookingId: string): Promise<any>;
    findByDriver(driverId: string): Promise<any[]>;
    findByOwner(ownerId: string): Promise<any[]>;
    findByParking(parkingId: string): Promise<any[]>;
    update(reviewId: string, data: Partial<IReview>): Promise<any>;
    delete(reviewId: string): Promise<any>;
}
declare const _default: ReviewRepository;
export default _default;
