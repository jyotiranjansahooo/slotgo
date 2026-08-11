export const USER_ROLES = {
  DRIVER: "driver",
  PARKING_OWNER: "parkingOwner",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES = Object.values(USER_ROLES);
