type GetParkingSlotsParams = {
    parkingId: string;
};
type DeleteSlotParams = {
    slotId: string;
};
export declare const createSlot: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getAvailableSlots: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getParkingSlots: import("express").RequestHandler<GetParkingSlotsParams, unknown, unknown, Record<string, unknown>, Record<string, any>>;
export declare const deleteSlot: import("express").RequestHandler<DeleteSlotParams, unknown, unknown, Record<string, unknown>, Record<string, any>>;
export {};
