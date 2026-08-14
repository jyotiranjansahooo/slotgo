declare class ReviewService {
    createReview(driverId: string, data: {
        bookingId: string;
        rating: number;
        comment?: string;
    }): Promise<any>;
    getReviewById(reviewId: string): Promise<any>;
    getParkingReviews(parkingId: string): Promise<any[]>;
    getOwnerReviews(ownerId: string): Promise<any[]>;
    getDriverReviews(driverId: string): Promise<any[]>;
    updateReview(driverId: string, reviewId: string, data: {
        rating?: number;
        comment?: string;
    }): Promise<any>;
    deleteReview(driverId: string, reviewId: string): Promise<any>;
}
declare const _default: ReviewService;
export default _default;
