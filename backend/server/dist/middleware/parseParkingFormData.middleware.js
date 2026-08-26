const parseParkingFormData = (req, _res, next) => {
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
            const value = req.body[field];
            if (typeof value === "string") {
                try {
                    req.body[field] = JSON.parse(value);
                }
                catch {
                    // Leave invalid JSON unchanged.
                    // Zod will report the validation error.
                }
            }
        }
        // FormData sends numeric values as strings.
        if (typeof req.body.parkingArea === "string" &&
            req.body.parkingArea.trim() !== "") {
            const value = Number(req.body.parkingArea);
            if (Number.isFinite(value)) {
                req.body.parkingArea = value;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
export default parseParkingFormData;
//# sourceMappingURL=parseParkingFormData.middleware.js.map