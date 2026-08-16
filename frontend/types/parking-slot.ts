export const SLOT_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
  INACTIVE: "inactive",
} as const;

export type SlotStatus =
  (typeof SLOT_STATUS)[keyof typeof SLOT_STATUS];

export interface ParkingSlot {
  _id: string;
  parkingId: string;
  slotNumber: string;
  floor: string;
  supportedVehicleTypes: string[];
  displayOrder: number;
  status: SlotStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}