import { PLATFORM } from "../constants/platform.js";

export interface PricingInput {
  parkingAmount: number;
}

export interface PricingBreakdown {
  parkingAmount: number;

  ownerCommission: number;

  driverServiceFee: number;

  ownerReceives: number;

  driverPays: number;

  platformRevenue: number;
}

export const calculateBookingPrice = ({
  parkingAmount,
}: PricingInput): PricingBreakdown => {
  const ownerCommission =
    Math.round(
      (parkingAmount * PLATFORM.OWNER_COMMISSION_PERCENT) / 100,
    );

  const calculatedServiceFee =
    (parkingAmount * PLATFORM.DRIVER_SERVICE_FEE_PERCENT) / 100;

  const driverServiceFee = Math.min(
    PLATFORM.DRIVER_SERVICE_FEE_MAX,
    Math.max(
      PLATFORM.DRIVER_SERVICE_FEE_MIN,
      Math.round(calculatedServiceFee),
    ),
  );

  const ownerReceives =
    parkingAmount - ownerCommission;

  const driverPays =
    parkingAmount + driverServiceFee;

  const platformRevenue =
    ownerCommission + driverServiceFee;

  return {
    parkingAmount,

    ownerCommission,

    driverServiceFee,

    ownerReceives,

    driverPays,

    platformRevenue,
  };
};