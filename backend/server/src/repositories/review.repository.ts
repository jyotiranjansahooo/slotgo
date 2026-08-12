import Review, {
  IReview,
} from "../models/Review.js";

class ReviewRepository {
  async create(
    data: Partial<IReview>,
  ) {
    return Review.create(data);
  }

  async findById(id: string) {
    return Review.findById(id);
  }

  async findByBookingId(
    bookingId: string,
  ) {
    return Review.findOne({
      bookingId,
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
    id: string,
    data: Partial<IReview>,
  ) {
    return Review.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async delete(id: string) {
    return Review.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
      },
    );
  }
}

export default new ReviewRepository();