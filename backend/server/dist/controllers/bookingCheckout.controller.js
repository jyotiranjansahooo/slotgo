import bookingCheckoutService from "../services/booking/bookingCheckout.service.js";
export const createBookingCheckout = async (req, res) => {
    const driverId = req.user._id.toString();
    const result = await bookingCheckoutService.createCheckout(driverId, req.body);
    res.status(201).json({
        success: true,
        message: "Booking checkout created successfully.",
        data: result,
    });
};
export const getBookingCheckout = async (req, res) => {
    const driverId = req.user._id.toString();
    const checkoutId = req.params.checkoutId;
    const checkout = await bookingCheckoutService.getCheckout(driverId, checkoutId);
    res.status(200).json({
        success: true,
        message: "Booking checkout retrieved successfully.",
        data: checkout,
    });
};
//# sourceMappingURL=bookingCheckout.controller.js.map