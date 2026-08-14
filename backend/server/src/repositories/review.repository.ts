import Review, {
  IReview,
} from "../models/Review.js";

class ReviewRepository {
  async create(
    data: Partial<IReview>,
  ) {
    return Review.create(data);
  }

  async findById(
    reviewId: string,
  ) {
    return Review.findById(
      reviewId,
    );
  }

  async findByBookingId(
    bookingId: string,
  ) {
    return Review.findOne({
      bookingId,
    });
  }

  async findByDriver(
    driverId: string,
  ) {
    return Review.find({
      driverId,
      isActive: true,
    }).sort({
      createdAt: -1,
    });
  }

  async findByOwner(
    ownerId: string,
  ) {
    return Review.find({
      ownerId,
      isActive: true,
    }).sort({
      createdAt: -1,
    });
  }

  async findByParking(
    parkingId: string,
  ) {
    return Review.find({
      parkingId,
      isActive: true,
    }).sort({
      createdAt: -1,
    });
  }

  async update(
    reviewId: string,
    data: Partial<IReview>,
  ) {
    return Review.findByIdAndUpdate(
      reviewId,
      data,
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async delete(
    reviewId: string,
  ) {
    return Review.findByIdAndDelete(
      reviewId,
    );
  }
}

export default new ReviewRepository();