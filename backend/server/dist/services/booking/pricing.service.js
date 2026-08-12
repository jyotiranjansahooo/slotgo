class PricingService {
    calculate(parking, vehicleType, bookingMode) {
        let parkingAmount = 0;
        switch (vehicleType) {
            case "twoWheeler":
                parkingAmount =
                    parking.pricing.twoWheeler[bookingMode] ?? 0;
                break;
            case "fourWheeler":
                parkingAmount =
                    parking.pricing.fourWheeler[bookingMode] ?? 0;
                break;
            case "vanMinibus":
                parkingAmount =
                    parking.pricing.vanMinibus[bookingMode] ?? 0;
                break;
            case "heavyVehicle":
                parkingAmount =
                    parking.pricing.heavyVehicle[bookingMode] ?? 0;
                break;
        }
        if (parkingAmount <= 0) {
            throw new Error("Parking price is not configured for this vehicle type and booking mode.");
        }
        const discountAmount = 0;
        const actualAmount = parkingAmount - discountAmount;
        const ownerCommission = Number((actualAmount * 0.05).toFixed(2));
        let driverServiceFee = Math.round(actualAmount * 0.05);
        driverServiceFee = Math.max(5, Math.min(driverServiceFee, 35));
        const ownerReceives = actualAmount - ownerCommission;
        const driverPays = actualAmount + driverServiceFee;
        return {
            parkingAmount,
            discountAmount,
            actualAmount,
            ownerCommission,
            driverServiceFee,
            ownerReceives,
            driverPays,
        };
    }
}
export default new PricingService();
//# sourceMappingURL=pricing.service.js.map