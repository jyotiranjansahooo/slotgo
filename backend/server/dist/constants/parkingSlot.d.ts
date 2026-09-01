export declare const PARKING_SLOT_VEHICLE_TYPES: {
    readonly TWO_WHEELER: "two_wheeler";
    readonly FOUR_WHEELER: "four_wheeler";
    readonly VAN_MINIBUS: "van_minibus";
    readonly HEAVY_VEHICLE: "heavy_vehicle";
};
export declare const PARKING_SLOT_VEHICLE_TYPE_VALUES: ("four_wheeler" | "heavy_vehicle" | "two_wheeler" | "van_minibus")[];
export type ParkingSlotVehicleType = (typeof PARKING_SLOT_VEHICLE_TYPES)[keyof typeof PARKING_SLOT_VEHICLE_TYPES];
export declare const PARKING_SLOT_STATUS: {
    readonly AVAILABLE: "available";
    readonly MAINTENANCE: "maintenance";
    readonly INACTIVE: "inactive";
};
export declare const PARKING_SLOT_STATUS_VALUES: ("available" | "inactive" | "maintenance")[];
export type ParkingSlotStatus = (typeof PARKING_SLOT_STATUS)[keyof typeof PARKING_SLOT_STATUS];
