import { PLATFORM } from "../constants/platform.js";

interface RefundInput {
  parkingAmount: number;

  bookingHours: number;

  bookedDays: number;

  hoursBeforeStart: number;
}

export interface RefundResult {
  refundAmount: number;

  penaltyAmount: number;

  refundPlatformFee: boolean;
}

export const calculateRefund = ({
  parkingAmount,
  bookingHours,
  bookedDays,
  hoursBeforeStart,
}: RefundInput): RefundResult => {
  if (
    hoursBeforeStart >= PLATFORM.FREE_CANCELLATION_HOURS
  ) {
    return {
      refundAmount: parkingAmount,
      penaltyAmount: 0,
      refundPlatformFee: false,
    };
  }

  if (bookingHours <= 3) {
    const penalty = Math.round(
      (parkingAmount *
        PLATFORM.HOURLY_BOOKING_PENALTY_PERCENT) /
        100,
    );

    return {
      refundAmount: parkingAmount - penalty,
      penaltyAmount: penalty,
      refundPlatformFee: false,
    };
  }

  const penalty =
    bookedDays *
    PLATFORM.DAILY_BOOKING_PENALTY_PER_DAY;

  const finalPenalty = Math.min(
    penalty,
    parkingAmount,
  );

  return {
    refundAmount:
      parkingAmount - finalPenalty,

    penaltyAmount: finalPenalty,

    refundPlatformFee: false,
  };
};