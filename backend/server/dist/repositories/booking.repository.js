import Booking from "../models/Booking.js";
class BookingRepository {
    async create(data, session) {
        if (session) {
            const booking = await Booking.create([data], { session });
            return booking[0];
        }
        return Booking.create(data);
    }
    async findById(id) {
        return Booking.findById(id);
    }
    async findByBookingNumber(bookingNumber) {
        return Booking.findOne({
            bookingNumber,
        });
    }
    async findByVerificationPin(pin) {
        return Booking.findOne({
            verificationPin: pin,
        });
    }
    // Driver bookings
    async findByDriver(driverId) {
        return Booking.find({
            driverId,
        }).sort({
            createdAt: -1,
        });
    }
    // Owner bookings
    async findByOwner(ownerId) {
        return Booking.find({
            ownerId,
        }).sort({
            createdAt: -1,
        });
    }
    async findOverlappingBooking(vehicleId, startTime, endTime) {
        return Booking.findOne({
            vehicleId,
            bookingStatus: {
                $in: [
                    "pending",
                    "confirmed",
                    "active",
                ],
            },
            startTime: {
                $lt: endTime,
            },
            endTime: {
                $gt: startTime,
            },
        });
    }
    // Parking bookings
    async findByParking(parkingId) {
        return Booking.find({
            parkingId,
        }).sort({
            createdAt: -1,
        });
    }
    // Expired pending bookings
    async findExpiredPendingBookings(now) {
        return Booking.find({
            bookingStatus: "pending",
            paymentStatus: "pending",
            endTime: {
                $lte: now,
            },
        });
    }
    // Expired confirmed/active bookings
    async findExpiredConfirmedBookings(now) {
        return Booking.find({
            bookingStatus: {
                $in: ["confirmed", "active"],
            },
            endTime: {
                $lte: now,
            },
        });
    }
    // Update
    async update(id, data) {
        return Booking.findByIdAndUpdate(id, data, {
            new: true,
        });
    }
    // Delete
    async delete(id) {
        return Booking.findByIdAndDelete(id);
    }
}
export default new BookingRepository();
//# sourceMappingURL=booking.repository.js.map