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
export declare const calculateBookingPrice: ({ parkingAmount, }: PricingInput) => PricingBreakdown;
