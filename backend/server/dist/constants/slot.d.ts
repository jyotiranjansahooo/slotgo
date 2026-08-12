export declare const SLOT_STATUS: {
    readonly AVAILABLE: "available";
    readonly RESERVED: "reserved";
    readonly OCCUPIED: "occupied";
    readonly MAINTENANCE: "maintenance";
};
export type SlotStatus = (typeof SLOT_STATUS)[keyof typeof SLOT_STATUS];
export declare const SLOT_STATUS_VALUES: ("available" | "maintenance" | "occupied" | "reserved")[];
