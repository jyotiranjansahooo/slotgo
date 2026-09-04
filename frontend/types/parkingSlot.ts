export interface ParkingSlot {
  _id: string;
  parkingId: string;
  slotNumber: string;
  floor: string;
  supportedVehicleTypes: string[];

  capacity: number;
  occupiedCount: number;
  reservedCount: number;

  status: string;
  displayOrder: number;
  isActive: boolean;
  reservedUntil?: string | null;
  lastOccupiedAt?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}