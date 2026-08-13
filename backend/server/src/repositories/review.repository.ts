import Review, { IReview } from "../models/Review.js";

class ReviewRepository {
  // ============================================================
  // CREATE REVIEW
  // ============================================================

  async create(data: Partial<IReview>) {
    return Review.create(data);
  }

  // ============================================================
  // FIND BY ID
  // ============================================================

  async findById(id: string) {
    return Review.findById(id);
  }

  // ============================================================
  // FIND BY BOOKING
  // ============================================================

  async findByBookingId(bookingId: string) {
    return Review.findOne({
      bookingId,
    });
  }

  // ============================================================
  // FIND BY DRIVER
  // ============================================================

  async findByDriver(driverId: string) {
    return Review.find({
      driverId,
      isActive: true,
    }).sort({
      createdAt: -1,
    });
  }

  // ============================================================
  // FIND BY PARKING
  // ============================================================

  async findByParking(parkingId: string) {
    return Review.find({
      parkingId,
      isActive: true,
    }).sort({
      createdAt: -1,
    });
  }

  // ============================================================
  // UPDATE REVIEW
  // ============================================================

  async update(id: string, data: Partial<IReview>) {
    return Review.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  // ============================================================
  // DELETE REVIEW
  // ============================================================

  async delete(id: string) {
    return Review.findByIdAndDelete(id);
  }
}

export default new ReviewRepository();
