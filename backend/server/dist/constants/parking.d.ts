export declare const PARKING_STATUS: {
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
};
export type ParkingStatus = (typeof PARKING_STATUS)[keyof typeof PARKING_STATUS];
export declare const PARKING_STATUS_VALUES: ParkingStatus[];
export declare const PARKING_TYPE: {
    readonly OPEN: "open";
    readonly COVERED: "covered";
    readonly BASEMENT: "basement";
    readonly MULTI_LEVEL: "multiLevel";
    readonly STREET: "street";
};
export declare const PARKING_TYPE_VALUES: ("basement" | "covered" | "multiLevel" | "open" | "street")[];
export declare const PARKING_FACILITY: {
    readonly CCTV: "cctv";
    readonly SECURITY_GUARD: "security_guard";
    readonly COVERED_PARKING: "covered_parking";
    readonly EV_CHARGING: "ev_charging";
    readonly LIGHTING: "lighting";
    readonly WASHROOM: "washroom";
    readonly DRINKING_WATER: "drinking_water";
    readonly VALET_PARKING: "valet_parking";
    readonly DISABLED_ACCESS: "disabled_access";
    readonly CAR_WASH: "car_wash";
};
export declare const PARKING_FACILITY_VALUES: ("car_wash" | "cctv" | "covered_parking" | "disabled_access" | "drinking_water" | "ev_charging" | "lighting" | "security_guard" | "valet_parking" | "washroom")[];
