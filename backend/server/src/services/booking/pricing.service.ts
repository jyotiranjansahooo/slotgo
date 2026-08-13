import { VehicleType } from "../../constants/vehicle.js";
import { BookingMode } from "../../constants/booking.js";
import { IParking } from "../../models/Parking.js";

export interface PricingResult {
  parkingAmount: number;
  discountAmount: number;
  actualAmount: number;
  ownerCommission: number;
  driverServiceFee: number;
  ownerReceives: number;
  driverPays: number;
}

class PricingService {
  calculate(
    parking: IParking,
    vehicleType: VehicleType,
    bookingMode: BookingMode,
    startTime: Date,
    endTime: Date,
  ): PricingResult {
    const durationMs =
      endTime.getTime() - startTime.getTime();

    const durationHours =
      durationMs / (1000 * 60 * 60);

    let rate = 0;

    switch (vehicleType) {
      case "twoWheeler":
        rate =
          parking.pricing.twoWheeler[
            bookingMode
          ] ?? 0;
        break;

      case "fourWheeler":
        rate =
          parking.pricing.fourWheeler[
            bookingMode
          ] ?? 0;
        break;

      case "vanMinibus":
        rate =
          parking.pricing.vanMinibus[
            bookingMode
          ] ?? 0;
        break;

      case "heavyVehicle":
        rate =
          parking.pricing.heavyVehicle[
            bookingMode
          ] ?? 0;
        break;
    }

    if (rate <= 0) {
      throw new Error(
        "Parking price is not configured.",
      );
    }

    let parkingAmount = 0;

    
    // HOURLY
    

    if (bookingMode === "hourly") {
      const hours = Math.ceil(
        durationHours,
      );

      parkingAmount =
        rate * hours;
    }

    
    // DAILY
    

    if (bookingMode === "daily") {
      const days = Math.ceil(
        durationHours / 24,
      );

      parkingAmount =
        rate * days;
    }

    
    // MONTHLY
    

    if (bookingMode === "monthly") {
      const months = Math.ceil(
        durationHours /
          (24 * 30),
      );

      parkingAmount =
        rate * months;
    }

    
    // Discount
    

    const discountAmount = 0;

    
    // Actual parking amount
    

    const actualAmount =
      parkingAmount -
      discountAmount;

    
    // Owner commission
    

    const ownerCommission =
      Number(
        (
          actualAmount * 0.05
        ).toFixed(2),
      );

    
    // Driver service fee
    

    let driverServiceFee =
      Math.round(
        actualAmount * 0.05,
      );

    driverServiceFee = Math.max(
      5,
      Math.min(
        driverServiceFee,
        35,
      ),
    );

    
    // Owner receives
    

    const ownerReceives =
      Number(
        (
          actualAmount -
          ownerCommission
        ).toFixed(2),
      );

    
    // Driver pays
    

    const driverPays =
      Number(
        (
          actualAmount +
          driverServiceFee
        ).toFixed(2),
      );

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