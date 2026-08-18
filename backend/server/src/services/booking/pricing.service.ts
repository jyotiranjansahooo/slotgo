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

export interface OvertimePricingResult {
  overtimeMinutes: number;
  overtimeHours: number;
  overtimeParkingAmount: number;
  overtimeFine: number;
  overtimeTotal: number;
  ownerCommission: number;
  ownerReceives: number;
}

class PricingService {
    // GET VEHICLE HOURLY RATE
  
  getHourlyRate(parking: IParking, vehicleType: VehicleType): number {
    let rate = 0;

    switch (vehicleType) {
      case "twoWheeler":
        rate = parking.pricing.twoWheeler.hourly ?? 0;
        break;

      case "fourWheeler":
        rate = parking.pricing.fourWheeler.hourly ?? 0;
        break;

      case "vanMinibus":
        rate = parking.pricing.vanMinibus.hourly ?? 0;
        break;

      case "heavyVehicle":
        rate = parking.pricing.heavyVehicle.hourly ?? 0;
        break;
    }

    if (rate <= 0) {
      throw new Error("Hourly parking price is not configured.");
    }

    return rate;
  }

    // NORMAL BOOKING PRICING
  
  calculate(
    parking: IParking,
    vehicleType: VehicleType,
    bookingMode: BookingMode,
    startTime: Date,
    endTime: Date,
  ): PricingResult {
    const durationMs = endTime.getTime() - startTime.getTime();

    const durationHours = durationMs / (1000 * 60 * 60);

    let rate = 0;

    switch (vehicleType) {
      case "twoWheeler":
        rate = parking.pricing.twoWheeler[bookingMode] ?? 0;
        break;

      case "fourWheeler":
        rate = parking.pricing.fourWheeler[bookingMode] ?? 0;
        break;

      case "vanMinibus":
        rate = parking.pricing.vanMinibus[bookingMode] ?? 0;
        break;

      case "heavyVehicle":
        rate = parking.pricing.heavyVehicle[bookingMode] ?? 0;
        break;
    }

    if (rate <= 0) {
      throw new Error("Parking price is not configured.");
    }

    let parkingAmount = 0;

    // ==========================================================
    // HOURLY
    // ==========================================================

    if (bookingMode === "hourly") {
      const hours = Math.ceil(durationHours);

      parkingAmount = rate * hours;
    }

    // ==========================================================
    // DAILY
    // ==========================================================

    if (bookingMode === "daily") {
      const days = Math.ceil(durationHours / 24);

      parkingAmount = rate * days;
    }

    // ==========================================================
    // MONTHLY
    // ==========================================================

    if (bookingMode === "monthly") {
      const months = Math.ceil(durationHours / (24 * 30));

      parkingAmount = rate * months;
    }

    // ==========================================================
    // DISCOUNT
    // ==========================================================

    const discountAmount = 0;

    // ==========================================================
    // ACTUAL PARKING AMOUNT
    // ==========================================================

    const actualAmount = parkingAmount - discountAmount;

    // ==========================================================
    // OWNER COMMISSION
    // ==========================================================

    const ownerCommission = Number((actualAmount * 0.05).toFixed(2));

    // ==========================================================
    // DRIVER SERVICE FEE
    // ==========================================================

    let driverServiceFee = Math.round(actualAmount * 0.05);

    driverServiceFee = Math.max(5, Math.min(driverServiceFee, 35));

    // ==========================================================
    // OWNER RECEIVES
    // ==========================================================

    const ownerReceives = Number((actualAmount - ownerCommission).toFixed(2));

    // ==========================================================
    // DRIVER PAYS
    // ==========================================================

    const driverPays = Number((actualAmount + driverServiceFee).toFixed(2));

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

    // OVERTIME PRICING
  
  calculateOvertime(
    parking: IParking,
    vehicleType: VehicleType,
    bookedEndTime: Date,
    checkoutTime: Date,
  ): OvertimePricingResult {
    if (checkoutTime.getTime() <= bookedEndTime.getTime()) {
      return {
        overtimeMinutes: 0,
        overtimeHours: 0,
        overtimeParkingAmount: 0,
        overtimeFine: 0,
        overtimeTotal: 0,
        ownerCommission: 0,
        ownerReceives: 0,
      };
    }

    // ==========================================================
    // OVERTIME MINUTES
    // ==========================================================

    const overtimeMs = checkoutTime.getTime() - bookedEndTime.getTime();

    const overtimeMinutes = Math.ceil(overtimeMs / (1000 * 60));

    // ==========================================================
    // OVERTIME HOURS
    //
    // Any extra minute counts as another hour.
    //
    // Example:
    // 10 minutes  -> 1 hour
    // 60 minutes  -> 1 hour
    // 61 minutes  -> 2 hours
    // ==========================================================

    const overtimeHours = Math.ceil(overtimeMinutes / 60);

    // ==========================================================
    // HOURLY PARKING RATE
    // ==========================================================

    const hourlyRate = this.getHourlyRate(parking, vehicleType);

    // ==========================================================
    // EXTRA PARKING CHARGE
    // ==========================================================

    const overtimeParkingAmount = Number(
      (hourlyRate * overtimeHours).toFixed(2),
    );

    // ==========================================================
    // OVERTIME FINE
    //
    // Small fixed fine per overtime incident.
    // ==========================================================

    const overtimeFine = 10;

    // ==========================================================
    // TOTAL DRIVER PAYMENT
    // ==========================================================

    const overtimeTotal = Number(
      (overtimeParkingAmount + overtimeFine).toFixed(2),
    );

    // ==========================================================
    // OWNER COMMISSION
    //
    // Commission applies only to additional parking revenue,
    // not to the platform fine.
    // ==========================================================

    const ownerCommission = Number((overtimeParkingAmount * 0.05).toFixed(2));

    // ==========================================================
    // OWNER RECEIVES
    // ==========================================================

    const ownerReceives = Number(
      (overtimeParkingAmount - ownerCommission).toFixed(2),
    );

    return {
      overtimeMinutes,
      overtimeHours,
      overtimeParkingAmount,
      overtimeFine,
      overtimeTotal,
      ownerCommission,
      ownerReceives,
    };
  }
}

export default new PricingService();
