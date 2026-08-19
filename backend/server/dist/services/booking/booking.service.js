import ApiError from "../../utils/ApiError.js";
import bookingRepository from "../../repositories/booking.repository.js";
import paymentRepository from "../../repositories/payment.repository.js";
import parkingRepository from "../../repositories/parking.repository.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
import userRepository from "../../repositories/user.repository.js";
import slotAllocatorService from "../parkingSlot/slotAllocator.service.js";
import paymentService from "../payment/payment.service.js";
import pricingService from "./pricing.service.js";
import bookingNumberService from "./bookingNumber.service.js";
import verificationService from "./verification.service.js";
import qrService from "./qr.service.js";
import { BOOKING_STATUS, PAYMENT_STATUS as BOOKING_PAYMENT_STATUS, CANCELLED_BY, } from "../../constants/booking.js";
import { PAYMENT_STATUS } from "../../constants/payment.js";
import { PARKING_STATUS } from "../../constants/parking.js";
class BookingService {
    // ============================================================
    // VALIDATE BOOKING DURATION
    // ============================================================
    validateBookingDuration(startTime, endTime, bookingMode) {
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        if (bookingMode === "hourly") {
            if (durationHours < 1) {
                throw new ApiError(400, "Hourly booking must be at least 1 hour.");
            }
            if (!Number.isInteger(durationHours)) {
                throw new ApiError(400, "Hourly booking must use whole hours.");
            }
            if (durationHours > 24) {
                throw new ApiError(400, "Hourly booking cannot exceed 24 hours.");
            }
        }
        if (bookingMode === "daily") {
            if (durationHours < 24) {
                throw new ApiError(400, "Daily booking must be at least 1 day.");
            }
            if (durationHours % 24 !== 0) {
                throw new ApiError(400, "Daily booking must use complete days.");
            }
            if (durationHours / 24 > 30) {
                throw new ApiError(400, "Daily booking cannot exceed 30 days.");
            }
        }
        if (bookingMode === "monthly") {
            if (durationHours < 24 * 28) {
                throw new ApiError(400, "Monthly booking must be at least 28 days.");
            }
            if (durationHours / (24 * 28) > 12) {
                throw new ApiError(400, "Monthly booking cannot exceed 12 months.");
            }
        }
    }
    // ============================================================
    // CALCULATE CANCELLATION REFUND
    // ============================================================
    calculateCancellationRefund(booking) {
        const now = new Date();
        const remainingMs = booking.startTime.getTime() - now.getTime();
        const remainingHours = remainingMs / (1000 * 60 * 60);
        let refundPercentage = 0;
        if (remainingHours > 24) {
            refundPercentage = 100;
        }
        else if (remainingHours > 2) {
            refundPercentage = 75;
        }
        else if (remainingHours > 1) {
            refundPercentage = 50;
        }
        else {
            refundPercentage = 0;
        }
        const refundAmount = Number((booking.driverPays * (refundPercentage / 100)).toFixed(2));
        const penaltyAmount = Number((booking.driverPays - refundAmount).toFixed(2));
        return {
            refundAmount,
            penaltyAmount,
            refundPercentage,
        };
    }
    // ============================================================
    // CREATE BOOKING
    // ============================================================
    async createBooking(driverId, data) {
        const driver = await userRepository.findById(driverId);
        if (!driver) {
            throw new ApiError(404, "Driver not found.");
        }
        if (!driver.isActive) {
            throw new ApiError(400, "Driver account is inactive.");
        }
        // VEHICLE
        const vehicle = await vehicleRepository.findById(data.vehicleId);
        if (!vehicle) {
            throw new ApiError(404, "Vehicle not found.");
        }
        if (vehicle.ownerId.toString() !== driverId) {
            throw new ApiError(403, "Vehicle does not belong to you.");
        }
        if (!vehicle.isActive) {
            throw new ApiError(400, "Vehicle is inactive.");
        }
        // TIME
        if (data.startTime >= data.endTime) {
            throw new ApiError(400, "End time must be after start time.");
        }
        if (data.startTime < new Date()) {
            throw new ApiError(400, "Booking start time cannot be in the past.");
        }
        this.validateBookingDuration(data.startTime, data.endTime, data.bookingMode);
        // VEHICLE OVERLAP
        const overlappingBooking = await bookingRepository.findOverlappingBooking(vehicle._id.toString(), data.startTime, data.endTime);
        if (overlappingBooking) {
            throw new ApiError(409, "This vehicle already has an overlapping booking.");
        }
        // PARKING
        const parking = await parkingRepository.findById(data.parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        if (parking.status !== PARKING_STATUS.APPROVED) {
            throw new ApiError(400, "Parking is not approved.");
        }
        if (!parking.isActive) {
            throw new ApiError(400, "Parking is inactive.");
        }
        // BOOKING MODE
        const bookingEnabled = parking.bookingModes[data.bookingMode];
        if (!bookingEnabled) {
            throw new ApiError(400, `${data.bookingMode} booking is unavailable.`);
        }
        // RESERVE SLOT
        const slot = await slotAllocatorService.reserveAvailableSlot(parking._id.toString(), vehicle.vehicleType);
        if (!slot) {
            throw new ApiError(409, "No parking slot available.");
        }
        // PRICING
        let pricing;
        try {
            pricing = pricingService.calculate(parking, vehicle.vehicleType, data.bookingMode, data.startTime, data.endTime);
        }
        catch (error) {
            await slotAllocatorService.releaseSlot(slot._id.toString());
            throw error;
        }
        if (pricing.parkingAmount <= 0) {
            await slotAllocatorService.releaseSlot(slot._id.toString());
            throw new ApiError(400, "Pricing is not configured for this vehicle type and booking mode.");
        }
        // BOOKING DATA
        const bookingNumber = bookingNumberService.generate();
        const verificationPin = verificationService.generatePin();
        const qrCode = await qrService.generate(bookingNumber);
        // CREATE BOOKING
        let booking;
        try {
            booking = await bookingRepository.create({
                bookingNumber,
                driverId: driver._id,
                ownerId: parking.ownerId,
                parkingId: parking._id,
                slotId: slot._id,
                vehicleId: vehicle._id,
                vehicleType: vehicle.vehicleType,
                bookingMode: data.bookingMode,
                startTime: data.startTime,
                endTime: data.endTime,
                parkingAmount: pricing.parkingAmount,
                discountAmount: pricing.discountAmount,
                actualAmount: pricing.actualAmount,
                ownerCommission: pricing.ownerCommission,
                driverServiceFee: pricing.driverServiceFee,
                ownerReceives: pricing.ownerReceives,
                driverPays: pricing.driverPays,
                paymentStatus: BOOKING_PAYMENT_STATUS.PENDING,
                bookingStatus: BOOKING_STATUS.PENDING,
                overtimeMinutes: 0,
                overtimeParkingAmount: 0,
                overtimeFine: 0,
                overtimeTotal: 0,
                overtimePaymentStatus: BOOKING_PAYMENT_STATUS.PENDING,
                verificationPin,
                qrCode,
                driverSnapshot: {
                    name: `${driver.name.first} ${driver.name.last}`,
                    phoneNumber: driver.phoneNumber ??
                        (() => {
                            throw new ApiError(400, "Phone number is required before creating a booking.");
                        })(),
                },
                parkingSnapshot: {
                    parkingName: parking.parkingName,
                    address: parking.address,
                },
                vehicleSnapshot: {
                    registrationNumber: vehicle.registrationNumber,
                    brand: vehicle.brand,
                    vehicleModel: vehicle.vehicleModel,
                    vehicleType: vehicle.vehicleType,
                },
            });
        }
        catch (error) {
            await slotAllocatorService.releaseSlot(slot._id.toString());
            throw error;
        }
        // CREATE RAZORPAY PAYMENT
        try {
            const paymentResult = await paymentService.createPayment(booking._id.toString());
            return {
                booking: paymentResult.booking,
                payment: paymentResult.payment,
                razorpayOrder: paymentResult.razorpayOrder,
            };
        }
        catch (error) {
            await slotAllocatorService.releaseSlot(slot._id.toString());
            await bookingRepository.delete(booking._id.toString());
            throw error;
        }
    }
    // ============================================================
    // VERIFY NORMAL PAYMENT
    // ============================================================
    async verifyPayment(orderId, paymentId, signature) {
        return paymentService.verifyPayment(orderId, paymentId, signature);
    }
    // ============================================================
    // CREATE OVERTIME PAYMENT
    // ============================================================
    async createOvertimePayment(bookingId) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) {
            throw new ApiError(404, "Booking not found.");
        }
        if (booking.bookingStatus !== BOOKING_STATUS.ACTIVE) {
            throw new ApiError(400, "Only active bookings can have overtime payment.");
        }
        if (booking.overtimeTotal <= 0) {
            throw new ApiError(400, "No overtime payment is required.");
        }
        if (booking.overtimePaymentStatus === PAYMENT_STATUS.SUCCESS) {
            throw new ApiError(400, "Overtime payment has already been completed.");
        }
        return paymentService.createOvertimePayment(bookingId);
    }
    // ============================================================
    // VERIFY OVERTIME PAYMENT
    // ============================================================
    async verifyOvertimePayment(orderId, paymentId, signature) {
        return paymentService.verifyOvertimePayment(orderId, paymentId, signature);
    }
    // ============================================================
    // GET SINGLE BOOKING
    // ============================================================
    async getBooking(userId, bookingId) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) {
            throw new ApiError(404, "Booking not found.");
        }
        const isDriver = booking.driverId.toString() === userId;
        const isOwner = booking.ownerId.toString() === userId;
        if (!isDriver && !isOwner) {
            throw new ApiError(403, "You are not authorized to view this booking.");
        }
        return booking;
    }
    // ============================================================
    // GET DRIVER BOOKINGS
    // ============================================================
    async getDriverBookings(driverId) {
        return bookingRepository.findByDriver(driverId);
    }
    // ============================================================
    // GET OWNER BOOKINGS
    // ============================================================
    async getOwnerBookings(ownerId) {
        return bookingRepository.findByOwner(ownerId);
    }
    // ============================================================
    // CANCEL BOOKING
    // ============================================================
    async cancelBooking(driverId, bookingId, data) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) {
            throw new ApiError(404, "Booking not found.");
        }
        if (booking.driverId.toString() !== driverId) {
            throw new ApiError(403, "You are not authorized to cancel this booking.");
        }
        if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
            throw new ApiError(400, "Booking is already cancelled.");
        }
        if (booking.bookingStatus === BOOKING_STATUS.COMPLETED) {
            throw new ApiError(400, "Completed bookings cannot be cancelled.");
        }
        if (booking.bookingStatus === BOOKING_STATUS.ACTIVE) {
            throw new ApiError(400, "Active bookings cannot be cancelled.");
        }
        if (booking.bookingStatus === BOOKING_STATUS.EXPIRED) {
            throw new ApiError(400, "Expired bookings cannot be cancelled.");
        }
        const refundCalculation = this.calculateCancellationRefund(booking);
        const { refundAmount, penaltyAmount, refundPercentage } = refundCalculation;
        let refundedPayment = null;
        if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.PAID) {
            const payment = await paymentRepository.findByBookingId(booking._id.toString());
            if (!payment) {
                throw new ApiError(404, "Payment record not found.");
            }
            if (payment.status === PAYMENT_STATUS.SUCCESS) {
                if (refundAmount > 0) {
                    refundedPayment = await paymentService.refundPayment(payment._id.toString(), refundAmount);
                }
            }
        }
        await slotAllocatorService.releaseSlot(booking.slotId.toString());
        const updatedBooking = await bookingRepository.update(booking._id.toString(), {
            bookingStatus: BOOKING_STATUS.CANCELLED,
            cancellation: {
                cancelledBy: CANCELLED_BY.DRIVER,
                reason: data.reason,
                cancelledAt: new Date(),
                refundAmount,
                penaltyAmount,
            },
        });
        if (!updatedBooking) {
            throw new ApiError(500, "Unable to cancel booking.");
        }
        return {
            booking: updatedBooking,
            refund: {
                refundAmount,
                penaltyAmount,
                refundPercentage,
            },
            payment: refundedPayment,
            wallet: refundedPayment?.wallet ?? null,
            transaction: refundedPayment?.transaction ?? null,
        };
    }
    // ============================================================
    // CHECK IN
    // ============================================================
    async checkIn(ownerId, bookingId, data) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) {
            throw new ApiError(404, "Booking not found.");
        }
        if (booking.ownerId.toString() !== ownerId) {
            throw new ApiError(403, "You are not authorized to check in this booking.");
        }
        if (booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
            throw new ApiError(400, `Booking cannot be checked in because its status is "${booking.bookingStatus}".`);
        }
        if (booking.paymentStatus !== BOOKING_PAYMENT_STATUS.PAID) {
            throw new ApiError(400, "Booking payment has not been completed.");
        }
        if (booking.verificationPin !== data.verificationPin) {
            throw new ApiError(400, "Invalid verification PIN.");
        }
        const now = new Date();
        if (now < booking.startTime) {
            throw new ApiError(400, "Check-in time has not started yet.");
        }
        if (now >= booking.endTime) {
            throw new ApiError(400, "Booking has already expired.");
        }
        await slotAllocatorService.occupySlot(booking.slotId.toString());
        const updatedBooking = await bookingRepository.update(booking._id.toString(), {
            bookingStatus: BOOKING_STATUS.ACTIVE,
            checkedInAt: now,
        });
        if (!updatedBooking) {
            await slotAllocatorService.releaseSlot(booking.slotId.toString());
            throw new ApiError(500, "Unable to complete check-in.");
        }
        return updatedBooking;
    }
    // ============================================================
    // CALCULATE OVERTIME
    // ============================================================
    async calculateOvertime(ownerId, bookingId) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) {
            throw new ApiError(404, "Booking not found.");
        }
        if (booking.ownerId.toString() !== ownerId) {
            throw new ApiError(403, "You are not authorized to process this booking.");
        }
        if (booking.bookingStatus !== BOOKING_STATUS.ACTIVE) {
            throw new ApiError(400, `Booking cannot be checked out because its status is "${booking.bookingStatus}".`);
        }
        const now = new Date();
        // NO OVERTIME
        if (now.getTime() <= booking.endTime.getTime()) {
            return {
                requiresAdditionalPayment: false,
                booking,
                overtime: {
                    overtimeMinutes: 0,
                    overtimeHours: 0,
                    overtimeParkingAmount: 0,
                    overtimeFine: 0,
                    overtimeTotal: 0,
                },
            };
        }
        // GET PARKING
        const parking = await parkingRepository.findById(booking.parkingId.toString());
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        // CALCULATE OVERTIME
        const overtime = pricingService.calculateOvertime(parking, booking.vehicleType, booking.endTime, now);
        if (overtime.overtimeTotal <= 0) {
            throw new ApiError(400, "Invalid overtime payment amount.");
        }
        // SAVE OVERTIME
        const updatedBooking = await bookingRepository.update(booking._id.toString(), {
            overtimeMinutes: overtime.overtimeMinutes,
            overtimeParkingAmount: overtime.overtimeParkingAmount,
            overtimeFine: overtime.overtimeFine,
            overtimeTotal: overtime.overtimeTotal,
            overtimePaymentStatus: BOOKING_PAYMENT_STATUS.PENDING,
        });
        if (!updatedBooking) {
            throw new ApiError(500, "Unable to calculate overtime.");
        }
        return {
            requiresAdditionalPayment: true,
            booking: updatedBooking,
            overtime,
        };
    }
    // ============================================================
    // CHECK OUT
    // ============================================================
    async checkOut(ownerId, bookingId) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) {
            throw new ApiError(404, "Booking not found.");
        }
        // OWNER AUTHORIZATION
        if (booking.ownerId.toString() !== ownerId) {
            throw new ApiError(403, "You are not authorized to check out this booking.");
        }
        // STATUS
        if (booking.bookingStatus !== BOOKING_STATUS.ACTIVE) {
            throw new ApiError(400, `Booking cannot be checked out because its status is "${booking.bookingStatus}".`);
        }
        const now = new Date();
        // OVERTIME
        if (now.getTime() > booking.endTime.getTime()) {
            const overtimeResult = await this.calculateOvertime(ownerId, bookingId);
            return {
                requiresAdditionalPayment: true,
                booking: overtimeResult.booking,
                overtime: overtimeResult.overtime,
            };
        }
        // NORMAL CHECKOUT
        const released = await slotAllocatorService.releaseSlot(booking.slotId.toString());
        if (!released) {
            throw new ApiError(500, "Unable to release parking slot.");
        }
        const updatedBooking = await bookingRepository.update(booking._id.toString(), {
            bookingStatus: BOOKING_STATUS.COMPLETED,
            checkedOutAt: now,
        });
        if (!updatedBooking) {
            await slotAllocatorService.occupySlot(booking.slotId.toString());
            throw new ApiError(500, "Unable to complete check-out.");
        }
        return {
            requiresAdditionalPayment: false,
            booking: updatedBooking,
            overtime: {
                overtimeMinutes: 0,
                overtimeHours: 0,
                overtimeParkingAmount: 0,
                overtimeFine: 0,
                overtimeTotal: 0,
            },
        };
    }
    // ============================================================
    // EXPIRE BOOKINGS
    // ============================================================
    async expireBooking() {
        const now = new Date();
        let pendingExpired = 0;
        let confirmedExpired = 0;
        // EXPIRE UNPAID BOOKINGS
        const pendingBookings = await bookingRepository.findExpiredPendingBookings(now);
        for (const booking of pendingBookings) {
            await slotAllocatorService.releaseSlot(booking.slotId.toString());
            await bookingRepository.update(booking._id.toString(), {
                bookingStatus: BOOKING_STATUS.EXPIRED,
            });
            pendingExpired++;
        }
        // EXPIRE CONFIRMED / ACTIVE BOOKINGS
        const confirmedBookings = await bookingRepository.findExpiredConfirmedBookings(now);
        for (const booking of confirmedBookings) {
            await slotAllocatorService.releaseSlot(booking.slotId.toString());
            await bookingRepository.update(booking._id.toString(), {
                bookingStatus: BOOKING_STATUS.EXPIRED,
                checkedOutAt: booking.checkedOutAt ?? now,
            });
            confirmedExpired++;
        }
        return {
            pendingExpired,
            confirmedExpired,
            totalExpired: pendingExpired + confirmedExpired,
        };
    }
}
export default new BookingService();
//# sourceMappingURL=booking.service.js.map