export declare const VEHICLE_TYPES: {
    readonly TWO_WHEELER: "twoWheeler";
    readonly FOUR_WHEELER: "fourWheeler";
    readonly VAN_MINIBUS: "vanMinibus";
    readonly HEAVY_VEHICLE: "heavyVehicle";
};
export type VehicleType = (typeof VEHICLE_TYPES)[keyof typeof VEHICLE_TYPES];
export declare const VEHICLE_TYPE_VALUES: readonly ["twoWheeler", "fourWheeler", "vanMinibus", "heavyVehicle"];
export declare const VEHICLE_STATUS: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
    readonly BLOCKED: "blocked";
};
export type VehicleStatus = (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];
export declare const VEHICLE_STATUS_VALUES: readonly ["active", "inactive", "blocked"];
