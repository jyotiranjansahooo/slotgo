import ApiError from "../utils/ApiError.js";
export default function parseParkingForm(req, _res, next) {
    try {
        const jsonFields = [
            "location",
            "facilities",
            "rules",
            "bookingModes",
            "pricing",
            "operatingHours",
        ];
        for (const field of jsonFields) {
            if (typeof req.body[field] === "string" &&
                req.body[field].trim()) {
                req.body[field] = JSON.parse(req.body[field]);
            }
        }
        if (req.body.parkingArea !== undefined) {
            req.body.parkingArea = Number(req.body.parkingArea);
        }
        next();
    }
    catch {
        next(new ApiError(400, "Invalid parking form data."));
    }
}
//# sourceMappingURL=parkingForm.middleware.js.map