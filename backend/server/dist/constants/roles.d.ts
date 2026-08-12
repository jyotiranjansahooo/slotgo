export declare const USER_ROLES: {
    readonly DRIVER: "driver";
    readonly PARKING_OWNER: "parkingOwner";
    readonly ADMIN: "admin";
};
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export declare const USER_ROLE_VALUES: ("admin" | "driver" | "parkingOwner")[];
