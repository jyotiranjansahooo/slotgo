import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import bookingService from "../services/booking/booking.service.js";
// ============================================================
// CREATE BOOKING
// ============================================================
export const createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.user._id.toString(), req.body);
    res
        .status(201)
        .json(new ApiResponse(201, booking, "Booking created successfully."));
});
// ============================================================
// VERIFY PAYMENT
// ============================================================
export const verifyPayment = asyncHandler(async (req, res) => {
    const { orderId, paymentId, signature } = req.body;
    const result = await bookingService.verifyPayment(orderId, paymentId, signature);
    res
        .status(200)
        .json(new ApiResponse(200, result, "Payment verified successfully."));
});
// ============================================================
// GET DRIVER BOOKINGS
// ============================================================
export const getDriverBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getDriverBookings(req.user._id.toString());
    res
        .status(200)
        .json(new ApiResponse(200, bookings, "Bookings fetched successfully."));
});
// ============================================================
// GET OWNER BOOKINGS
// ============================================================
export const getOwnerBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getOwnerBookings(req.user._id.toString());
    res
        .status(200)
        .json(new ApiResponse(200, bookings, "Owner bookings fetched successfully."));
});
// ============================================================
// GET SINGLE BOOKING
// ============================================================
export const getBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.getBooking(req.user._id.toString(), req.params.bookingId);
    res
        .status(200)
        .json(new ApiResponse(200, booking, "Booking fetched successfully."));
});
// ============================================================
// CANCEL BOOKING
// ============================================================
export const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.cancelBooking(req.user._id.toString(), req.params.bookingId, req.body);
    res
        .status(200)
        .json(new ApiResponse(200, booking, "Booking cancelled successfully."));
});
// ============================================================
// CHECK-IN
// ============================================================
export const checkIn = asyncHandler(async (req, res) => {
    const booking = await bookingService.checkIn(req.user._id.toString(), req.params.bookingId, req.body);
    res
        .status(200)
        .json(new ApiResponse(200, booking, "Driver checked in successfully."));
});
// ============================================================
// CHECK-OUT
// ============================================================
export const checkOut = asyncHandler(async (req, res) => {
    const booking = await bookingService.checkOut(req.user._id.toString(), req.params.bookingId);
    res
        .status(200)
        .json(new ApiResponse(200, booking, "Driver checked out successfully."));
});
//# sourceMappingURL=booking.controller.js.map