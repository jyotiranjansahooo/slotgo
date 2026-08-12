import { CreateReviewInput } from "../../validations/review/create.validation.js";
declare class ReviewService {
    createReview(driverId: string, data: CreateReviewInput): Promise<any>;
    getParkingReviews(parkingId: string): Promise<any[]>;
}
declare const _default: ReviewService;
export default _default;
