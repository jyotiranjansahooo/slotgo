import User from "../models/User.js";
import Parking from "../models/Parking.js";
import Vehicle from "../models/Vehicle.js";
export const getPlatformStats = async (_req, res) => {
    try {
        const [parkingSpots, drivers, parkingOwners, vehicles] = await Promise.all([
            Parking.countDocuments({
                isActive: true,
            }),
            User.countDocuments({
                role: "driver",
            }),
            User.countDocuments({
                role: "parkingOwner",
            }),
            Vehicle.countDocuments({
                isActive: true,
            }),
        ]);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Platform statistics fetched successfully",
            data: {
                parkingSpots,
                drivers,
                parkingOwners,
                vehicles,
            },
        });
    }
    catch (error) {
        console.error("Get platform stats error:", error);
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Failed to fetch platform statistics",
            data: null,
        });
    }
};
//# sourceMappingURL=stats.controller.js.map