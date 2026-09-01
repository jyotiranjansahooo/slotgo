export type ParkingAction = "temporary-close" | "delete";
export declare const requestParkingActionVerification: ({ ownerId, parkingId, action, }: {
    ownerId: string;
    parkingId: string;
    action: ParkingAction;
}) => Promise<{
    email: string;
    action: ParkingAction;
    expiresInMinutes: number;
    message: string;
}>;
export declare const verifyParkingActionVerification: ({ ownerId, action, otp, }: {
    ownerId: string;
    action: ParkingAction;
    otp: string;
}) => Promise<boolean>;
