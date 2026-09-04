import Booking from "../models/Booking.js";
// import { Types } from "mongoose";
// import Parking from "../models/Parking.js";
class BookingRepository {
    async create(data, session) {
        if (session) {
            const booking = await Booking.create([data], { session });
            return booking[0];
        }
        return Booking.create(data);
    }
    async findAll() {
        return Booking.find().sort({
            createdAt: -1,
        });
    }
    // FIND BY ID
    async findById(id) {
        return Booking.findById(id);
    }
    // FIND BY BOOKING NUMBER
    async findByBookingNumber(bookingNumber) {
        return Booking.findOne({
            bookingNumber,
        });
    }
    async findByOvertimeOrderId(orderId) {
        return Booking.findOne({
            overtimePaymentOrderId: orderId,
        });
    }
    // FIND BY VERIFICATION PIN
    async findByVerificationPin(pin) {
        return Booking.findOne({
            verificationPin: pin,
        });
    }
    // FIND BY OVERTIME RAZORPAY ORDER ID
    async findOneByOvertimeOrderId(orderId) {
        return Booking.findOne({
            overtimePaymentOrderId: orderId,
        });
    }
    // DRIVER BOOKINGS
    async findByDriver(driverId) {
        return Booking.find({
            driverId,
        }).sort({
            createdAt: -1,
        });
    }
    async findByOwner(ownerId) {
        return Booking.find({
            ownerId,
            isActive: true,
        }).sort({ createdAt: -1 });
    }
    async findOverlappingBooking(vehicleId, startTime, endTime) {
        const now = new Date();
        return Booking.findOne({
            vehicleId,
            startTime: {
                $lt: endTime,
            },
            endTime: {
                $gt: startTime,
            },
            $or: [
                {
                    bookingStatus: {
                        $in: ["confirmed", "active"],
                    },
                },
                {
                    bookingStatus: "pending",
                    paymentStatus: "pending",
                    endTime: {
                        $gt: now,
                    },
                },
            ],
        });
    }
    // PARKING BOOKINGS
    async findByParking(parkingId) {
        return Booking.find({
            parkingId,
        }).sort({
            createdAt: -1,
        });
    }
    // EXPIRED PENDING BOOKINGS
    async findExpiredPendingBookings(now) {
        return Booking.find({
            bookingStatus: "pending",
            paymentStatus: "pending",
            endTime: {
                $lte: now,
            },
        });
    }
    // EXPIRED CONFIRMED / ACTIVE BOOKINGS
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
    // UPDATE
    async update(id, data) {
        return Booking.findByIdAndUpdate(id, data, {
            new: true,
        });
    }
    // DELETE
    async delete(id) {
        return Booking.findByIdAndDelete(id);
    }
}
export default new BookingRepository();
//# sourceMappingURL=booking.repository.js.map