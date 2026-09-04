import ApiError from "../../utils/ApiError.js";
import walletService from "../wallet/wallet.service.js";
import slotAllocatorService from "../parkingSlot/slotAllocator.service.js";
import razorpayService from "./razorpay.service.js";
import bookingCheckoutRepository from "../../repositories/bookingCheckout.repository.js";
import userRepository from "../../repositories/user.repository.js";
import parkingRepository from "../../repositories/parking.repository.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
import bookingRepository from "../../repositories/booking.repository.js";
import paymentRepository from "../../repositories/payment.repository.js";
import bookingNumberService from "../booking/bookingNumber.service.js";
import verificationService from "../booking/verification.service.js";
import qrService from "../booking/qr.service.js";
import { PAYMENT_STATUS, PAYMENT_GATEWAY, REFUND_STATUS, } from "../../constants/payment.js";
import { BOOKING_STATUS, PAYMENT_STATUS as BOOKING_PAYMENT_STATUS, } from "../../constants/booking.js";
class PaymentService {
    async createPayment(userId, bookingId) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) {
            throw new ApiError(404, "Booking not found.");
        }
        if (booking.driverId.toString() !== userId) {
            throw new ApiError(403, "You are not authorized to pay for this booking.");
        }
        const existingPayment = await paymentRepository.findByBookingId(bookingId);
        if (existingPayment) {
            return {
                booking,
                payment: existingPayment,
                razorpayOrder: {
                    id: existingPayment.orderId,
                    amount: Math.round(existingPayment.amount * 100),
                    currency: existingPayment.currency,
                },
            };
        }
        if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.PAID) {
            throw new ApiError(400, "Booking has already been paid.");
        }
        if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
            throw new ApiError(400, "Cancelled booking cannot be paid.");
        }
        if (booking.bookingStatus === BOOKING_STATUS.COMPLETED) {
            throw new ApiError(400, "Completed booking cannot be paid.");
        }
        const amountInPaise = Math.round(booking.driverPays * 100);
        if (amountInPaise <= 0) {
            throw new ApiError(400, "Invalid payment amount.");
        }
        const razorpayOrder = await razorpayService.createOrder(amountInPaise, booking.bookingNumber);
        const payment = await paymentRepository.create({
            bookingId: booking._id,
            driverId: booking.driverId,
            ownerId: booking.ownerId,
            gateway: PAYMENT_GATEWAY.RAZORPAY,
            orderId: razorpayOrder.id,
            amount: booking.driverPays,
            currency: "INR",
            status: PAYMENT_STATUS.CREATED,
            refundAmount: 0,
            refundStatus: REFUND_STATUS.NONE,
        });
        return {
            booking,
            payment,
            razorpayOrder,
        };
    }
    async verifyPayment(userId, orderId, paymentId, signature) {
        const existingPayment = await paymentRepository.findByOrderId(orderId);
        if (existingPayment) {
            const booking = await bookingRepository.findById(existingPayment.bookingId.toString());
            if (!booking) {
                throw new ApiError(404, "Booking not found.");
            }
            if (booking.driverId.toString() !== userId) {
                throw new ApiError(403, "You are not authorized to verify this payment.");
            }
            if (existingPayment.status === PAYMENT_STATUS.SUCCESS) {
                return {
                    payment: existingPayment,
                    booking,
                    wallet: null,
                    transaction: null,
                };
            }
            if (existingPayment.orderId !== orderId) {
                throw new ApiError(400, "Invalid payment order.");
            }
            const isValid = razorpayService.verifySignature(orderId, paymentId, signature);
            if (!isValid) {
                await paymentRepository.update(existingPayment._id.toString(), {
                    status: PAYMENT_STATUS.FAILED,
                });
                throw new ApiError(400, "Invalid payment signature.");
            }
            const updatedPayment = await paymentRepository.update(existingPayment._id.toString(), {
                paymentId,
                signature,
                status: PAYMENT_STATUS.SUCCESS,
                paidAt: new Date(),
            });
            if (!updatedPayment) {
                throw new ApiError(500, "Unable to update payment.");
            }
            const confirmedSlot = await slotAllocatorService.confirmReservation(booking.slotId.toString());
            if (!confirmedSlot) {
                throw new ApiError(500, "Unable to confirm parking slot reservation.");
            }
            const updatedBooking = await bookingRepository.update(booking._id.toString(), {
                paymentStatus: BOOKING_PAYMENT_STATUS.PAID,
                bookingStatus: BOOKING_STATUS.CONFIRMED,
            });
            if (!updatedBooking) {
                throw new ApiError(500, "Payment succeeded but booking could not be confirmed.");
            }
            const walletResult = await walletService.creditOwnerEarnings(updatedBooking.ownerId.toString(), updatedBooking.ownerReceives, updatedBooking._id.toString(), `booking:${updatedBooking._id.toString()}`, `Earnings from booking ${updatedBooking.bookingNumber}`);
            return {
                payment: updatedPayment,
                booking: updatedBooking,
                wallet: walletResult.wallet,
                transaction: walletResult.transaction,
            };
        }
        const checkout = await bookingCheckoutRepository.findByOrderId(orderId);
        if (!checkout) {
            throw new ApiError(404, "Booking checkout not found or has expired.");
        }
        if (checkout.driverId.toString() !== userId) {
            throw new ApiError(403, "You are not authorized to verify this payment.");
        }
        if (checkout.orderId !== orderId) {
            throw new ApiError(400, "Invalid payment order.");
        }
        if (checkout.expiresAt <= new Date()) {
            await slotAllocatorService.releaseSlot(checkout.slotId.toString());
            await bookingCheckoutRepository.delete(checkout._id.toString());
            throw new ApiError(410, "This payment checkout has expired. Please start the booking again.");
        }
        const isValid = razorpayService.verifySignature(orderId, paymentId, signature);
        if (!isValid) {
            await slotAllocatorService.releaseSlot(checkout.slotId.toString());
            await bookingCheckoutRepository.delete(checkout._id.toString());
            throw new ApiError(400, "Invalid payment signature.");
        }
        const driver = await userRepository.findById(userId);
        if (!driver) {
            await slotAllocatorService.releaseSlot(checkout.slotId.toString());
            await bookingCheckoutRepository.delete(checkout._id.toString());
            throw new ApiError(404, "Driver not found.");
        }
        if (!driver.isActive) {
            await slotAllocatorService.releaseSlot(checkout.slotId.toString());
            await bookingCheckoutRepository.delete(checkout._id.toString());
            throw new ApiError(400, "Driver account is inactive.");
        }
        if (!driver.phoneNumber) {
            await slotAllocatorService.releaseSlot(checkout.slotId.toString());
            await bookingCheckoutRepository.delete(checkout._id.toString());
            throw new ApiError(400, "Phone number is required before creating a booking.");
        }
        const parking = await parkingRepository.findById(checkout.parkingId.toString());
        if (!parking) {
            await slotAllocatorService.releaseSlot(checkout.slotId.toString());
            await bookingCheckoutRepository.delete(checkout._id.toString());
            throw new ApiError(404, "Parking not found.");
        }
        const vehicle = await vehicleRepository.findById(checkout.vehicleId.toString());
        if (!vehicle) {
            await slotAllocatorService.releaseSlot(checkout.slotId.toString());
            await bookingCheckoutRepository.delete(checkout._id.toString());
            throw new ApiError(404, "Vehicle not found.");
        }
        const bookingNumber = bookingNumberService.generate();
        const verificationPin = verificationService.generatePin();
        const qrCode = await qrService.generate(bookingNumber);
        let booking;
        try {
            booking = await bookingRepository.create({
                bookingNumber,
                driverId: checkout.driverId,
                ownerId: checkout.ownerId,
                parkingId: checkout.parkingId,
                slotId: checkout.slotId,
                vehicleId: checkout.vehicleId,
                vehicleType: checkout.vehicleType,
                bookingMode: checkout.bookingMode,
                startTime: checkout.startTime,
                endTime: checkout.endTime,
                parkingAmount: checkout.parkingAmount,
                discountAmount: checkout.discountAmount,
                actualAmount: checkout.actualAmount,
                ownerCommission: checkout.ownerCommission,
                driverServiceFee: checkout.driverServiceFee,
                ownerReceives: checkout.ownerReceives,
                driverPays: checkout.driverPays,
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
                    phoneNumber: driver.phoneNumber,
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
            await slotAllocatorService.releaseSlot(checkout.slotId.toString());
            await bookingCheckoutRepository.delete(checkout._id.toString());
            throw error;
        }
        let payment;
        try {
            payment = await paymentRepository.create({
                bookingId: booking._id,
                driverId: checkout.driverId,
                ownerId: checkout.ownerId,
                gateway: PAYMENT_GATEWAY.RAZORPAY,
                orderId,
                paymentId,
                signature,
                amount: checkout.driverPays,
                currency: "INR",
                status: PAYMENT_STATUS.SUCCESS,
                paidAt: new Date(),
                refundAmount: 0,
                refundStatus: REFUND_STATUS.NONE,
            });
        }
        catch (error) {
            await bookingRepository.delete(booking._id.toString());
            await slotAllocatorService.releaseSlot(checkout.slotId.toString());
            throw error;
        }
        const confirmedSlot = await slotAllocatorService.confirmReservation(checkout.slotId.toString());
        if (!confirmedSlot) {
            await bookingRepository.delete(booking._id.toString());
            await slotAllocatorService.releaseSlot(checkout.slotId.toString());
            throw new ApiError(500, "Payment succeeded but parking capacity could not be confirmed.");
        }
        const confirmedBooking = await bookingRepository.update(booking._id.toString(), {
            paymentStatus: BOOKING_PAYMENT_STATUS.PAID,
            bookingStatus: BOOKING_STATUS.CONFIRMED,
        });
        if (!confirmedBooking) {
            throw new ApiError(500, "Payment succeeded but booking could not be confirmed.");
        }
        const walletResult = await walletService.creditOwnerEarnings(confirmedBooking.ownerId.toString(), confirmedBooking.ownerReceives, confirmedBooking._id.toString(), `booking:${confirmedBooking._id.toString()}`, `Earnings from booking ${confirmedBooking.bookingNumber}`);
        await bookingCheckoutRepository.delete(checkout._id.toString());
        return {
            payment,
            booking: confirmedBooking,
            wallet: walletResult.wallet,
            transaction: walletResult.transaction,
        };
    }
    async createOvertimePayment(userId, bookingId) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) {
            throw new ApiError(404, "Booking not found.");
        }
        if (booking.driverId.toString() !== userId) {
            throw new ApiError(403, "You are not authorized to pay overtime for this booking.");
        }
        if (booking.bookingStatus !== BOOKING_STATUS.ACTIVE) {
            throw new ApiError(400, "Only active bookings can have overtime payment.");
        }
        if (!booking.overtimeTotal || booking.overtimeTotal <= 0) {
            throw new ApiError(400, "No overtime payment is required.");
        }
        if (booking.overtimePaymentStatus === PAYMENT_STATUS.SUCCESS) {
            throw new ApiError(400, "Overtime payment has already been completed.");
        }
        if (booking.overtimePaymentOrderId) {
            return {
                booking,
                razorpayOrder: {
                    id: booking.overtimePaymentOrderId,
                    amount: Math.round(booking.overtimeTotal * 100),
                    currency: "INR",
                },
            };
        }
        const razorpayOrder = await razorpayService.createOrder(Math.round(booking.overtimeTotal * 100), `${booking.bookingNumber}-OT`);
        const updatedBooking = await bookingRepository.update(booking._id.toString(), {
            overtimePaymentOrderId: razorpayOrder.id,
            overtimePaymentStatus: PAYMENT_STATUS.CREATED,
        });
        if (!updatedBooking) {
            throw new ApiError(500, "Unable to create overtime payment.");
        }
        return {
            booking: updatedBooking,
            razorpayOrder,
        };
    }
    async verifyOvertimePayment(userId, orderId, paymentId, signature) {
        const booking = await bookingRepository.findOneByOvertimeOrderId(orderId);
        if (!booking) {
            throw new ApiError(404, "Overtime booking payment not found.");
        }
        if (booking.driverId.toString() !== userId) {
            throw new ApiError(403, "You are not authorized to verify this overtime payment.");
        }
        if (booking.overtimePaymentOrderId !== orderId) {
            throw new ApiError(400, "Invalid overtime payment order.");
        }
        if (booking.overtimePaymentStatus === PAYMENT_STATUS.SUCCESS) {
            return {
                booking,
                payment: {
                    orderId,
                    paymentId: booking.overtimePaymentId,
                },
                overtime: {
                    overtimeMinutes: booking.overtimeMinutes,
                    overtimeParkingAmount: booking.overtimeParkingAmount,
                    overtimeFine: booking.overtimeFine,
                    overtimeTotal: booking.overtimeTotal,
                },
                wallet: null,
                transaction: null,
            };
        }
        const isValid = razorpayService.verifySignature(orderId, paymentId, signature);
        if (!isValid) {
            throw new ApiError(400, "Invalid overtime payment signature.");
        }
        const updatedBooking = await bookingRepository.update(booking._id.toString(), {
            overtimePaymentStatus: PAYMENT_STATUS.SUCCESS,
            overtimePaymentId: paymentId,
            overtimePaidAt: new Date(),
        });
        if (!updatedBooking) {
            throw new ApiError(500, "Overtime payment succeeded but booking could not be updated.");
        }
        let walletResult = null;
        if (updatedBooking.overtimeParkingAmount > 0) {
            walletResult = await walletService.creditOwnerEarnings(updatedBooking.ownerId.toString(), updatedBooking.overtimeParkingAmount, updatedBooking._id.toString(), `overtime:${updatedBooking._id.toString()}`, `Overtime parking earnings from booking ${updatedBooking.bookingNumber}`);
        }
        const released = await slotAllocatorService.releaseSlot(updatedBooking.slotId.toString());
        if (!released) {
            throw new ApiError(500, "Overtime payment succeeded but parking slot could not be released.");
        }
        const completedBooking = await bookingRepository.update(updatedBooking._id.toString(), {
            bookingStatus: BOOKING_STATUS.COMPLETED,
            checkedOutAt: updatedBooking.checkedOutAt ?? new Date(),
        });
        if (!completedBooking) {
            throw new ApiError(500, "Overtime payment succeeded but booking could not be completed.");
        }
        return {
            booking: completedBooking,
            payment: {
                orderId,
                paymentId,
                signature,
            },
            overtime: {
                overtimeMinutes: completedBooking.overtimeMinutes,
                overtimeParkingAmount: completedBooking.overtimeParkingAmount,
                overtimeFine: completedBooking.overtimeFine,
                overtimeTotal: completedBooking.overtimeTotal,
            },
            wallet: walletResult?.wallet ?? null,
            transaction: walletResult?.transaction ?? null,
        };
    }
    async refundPayment(userId, paymentId, amount) {
        const payment = await paymentRepository.findById(paymentId);
        if (!payment) {
            throw new ApiError(404, "Payment not found.");
        }
        if (payment.status !== PAYMENT_STATUS.SUCCESS) {
            throw new ApiError(400, "Only successful payments can be refunded.");
        }
        const booking = await bookingRepository.findById(payment.bookingId.toString());
        if (!booking) {
            throw new ApiError(404, "Booking not found.");
        }
        if (booking.driverId.toString() !== userId) {
            throw new ApiError(403, "You are not authorized to refund this payment.");
        }
        const refundableAmount = payment.amount - payment.refundAmount;
        const refundAmount = amount ?? refundableAmount;
        if (refundAmount <= 0) {
            throw new ApiError(400, "Refund amount must be greater than zero.");
        }
        if (refundAmount > refundableAmount) {
            throw new ApiError(400, "Refund amount exceeds the refundable amount.");
        }
        if (!payment.paymentId) {
            throw new ApiError(400, "Payment transaction ID is missing.");
        }
        const refund = await razorpayService.refundPayment(payment.paymentId, Math.round(refundAmount * 100));
        const totalRefunded = payment.refundAmount + refundAmount;
        const fullyRefunded = totalRefunded >= payment.amount;
        const updatedPayment = await paymentRepository.update(payment._id.toString(), {
            refundId: refund.id,
            refundAmount: totalRefunded,
            refundStatus: REFUND_STATUS.SUCCESS,
            status: fullyRefunded
                ? PAYMENT_STATUS.REFUNDED
                : PAYMENT_STATUS.PARTIALLY_REFUNDED,
            refundedAt: fullyRefunded ? new Date() : undefined,
        });
        if (!updatedPayment) {
            throw new ApiError(500, "Unable to update refund information.");
        }
        const ownerRefundAmount = Number((booking.ownerReceives * (refundAmount / payment.amount)).toFixed(2));
        let walletResult = null;
        if (ownerRefundAmount > 0) {
            walletResult = await walletService.reverseOwnerEarnings(booking.ownerId.toString(), ownerRefundAmount, booking._id.toString(), `refund:${refund.id}`, `Owner earning reversal for booking ${booking.bookingNumber}`);
        }
        return {
            payment: updatedPayment,
            refund,
            wallet: walletResult?.wallet ?? null,
            transaction: walletResult?.transaction ?? null,
        };
    }
}
export default new PaymentService();
//# sourceMappingURL=payment.service.js.map