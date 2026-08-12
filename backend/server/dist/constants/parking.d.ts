export declare const PARKING_STATUS: {
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
};
export declare const PARKING_FACILITIES: {
    readonly CCTV: "cctv";
    readonly SECURITY_GUARD: "securityGuard";
    readonly COVERED: "covered";
    readonly OPEN: "open";
    readonly LIGHTING: "lighting";
    readonly WASHROOM: "washroom";
    readonly CAR_WASH: "carWash";
    readonly DISABLED_ACCESS: "disabledAccess";
};
export declare const PARKING_TYPES: {
    readonly OPEN: "open";
    readonly COVERED: "covered";
    readonly BASEMENT: "basement";
    readonly MULTI_LEVEL: "multiLevel";
    readonly STREET: "street";
};
export declare const PARKING_TYPE_VALUES: ("basement" | "covered" | "multiLevel" | "open" | "street")[];
export declare const PARKING_FACILITY_VALUES: ("carWash" | "cctv" | "covered" | "disabledAccess" | "lighting" | "open" | "securityGuard" | "washroom")[];
export type ParkingStatus = (typeof PARKING_STATUS)[keyof typeof PARKING_STATUS];
export declare const PARKING_STATUS_VALUES: ("approved" | "pending" | "rejected")[];
