import { BOOKING_MODE } from "../../constants/booking.js";
import { VehicleType } from "../../constants/vehicle.js";
import { IParking } from "../../models/Parking.js";

export interface PricingResult {
  parkingAmount: number;

  ownerCommission: number;

  driverServiceFee: number;

  ownerReceives: number;

  driverPays: number;
}

class PricingService {
  calculate(
    parking: IParking,
    vehicleType: VehicleType,
    bookingMode: string,
  ): PricingResult {
    let parkingAmount = 0;

    switch (vehicleType) {
      case "twoWheeler":
        parkingAmount =
          parking.pricing.twoWheeler[
            bookingMode as keyof typeof parking.pricing.twoWheeler
          ] ?? 0;
        break;

      case "fourWheeler":
        parkingAmount =
          parking.pricing.fourWheeler[
            bookingMode as keyof typeof parking.pricing.fourWheeler
          ] ?? 0;
        break;

      case "vanMinibus":
        parkingAmount =
          parking.pricing.vanMinibus[
            bookingMode as keyof typeof parking.pricing.vanMinibus
          ] ?? 0;
        break;

      case "heavyVehicle":
        parkingAmount =
          parking.pricing.heavyVehicle[
            bookingMode as keyof typeof parking.pricing.heavyVehicle
          ] ?? 0;
        break;
    }

    const ownerCommission =
      Number((parkingAmount * 0.05).toFixed(2));

    let driverServiceFee = Math.round(
      parkingAmount * 0.05,
    );

    driverServiceFee = Math.max(
      5,
      Math.min(driverServiceFee, 35),
    );

    return {
      parkingAmount,

      ownerCommission,

      driverServiceFee,

      ownerReceives:
        parkingAmount - ownerCommission,

      driverPays:
        parkingAmount + driverServiceFee,
    };
  }
}

export default new PricingService();