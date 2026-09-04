export default function parseParkingFormData(req, res, next) {
    try {
        /*
         * ============================================================
         * JSON FIELDS
         * ============================================================
         */
        const jsonFields = [
            "location",
            "supportedVehicleTypes",
            "facilities",
            "rules",
            "bookingModes",
            "pricing",
            "operatingHours",
            "removeImagePublicIds",
        ];
        for (const field of jsonFields) {
            const value = req.body[field];
            if (typeof value === "string") {
                try {
                    req.body[field] = JSON.parse(value);
                }
                catch {
                    res.status(400).json({
                        success: false,
                        statusCode: 400,
                        message: `Invalid JSON in field: ${field}`,
                        data: [],
                    });
                    return;
                }
            }
        }
        /*
         * ============================================================
         * NUMBER FIELDS
         * ============================================================
         *
         * FormData always sends these as strings.
         *
         * Example:
         *
         * parkingArea = "846545"
         *
         * Convert it to:
         *
         * parkingArea = 846545
         */
        const numberFields = [
            "parkingArea",
        ];
        for (const field of numberFields) {
            const value = req.body[field];
            if (typeof value === "string" && value.trim() !== "") {
                const numberValue = Number(value);
                if (!Number.isFinite(numberValue)) {
                    res.status(400).json({
                        success: false,
                        statusCode: 400,
                        message: `${field} must be a valid number.`,
                        data: [],
                    });
                    return;
                }
                req.body[field] = numberValue;
            }
        }
        console.log("\n========== PARKING FORM DATA ==========");
        console.dir(req.body, {
            depth: null,
        });
        console.log("parkingArea:", req.body.parkingArea, "type:", typeof req.body.parkingArea);
        console.log("supportedVehicleTypes:", req.body.supportedVehicleTypes, "isArray:", Array.isArray(req.body.supportedVehicleTypes));
        console.log("=======================================\n");
        next();
    }
    catch (error) {
        console.error("parseParkingFormData ERROR:", error);
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Unable to parse parking form data.",
            data: [],
        });
    }
}
//# sourceMappingURL=parseParkingFormData.middleware.js.map