import { IBooking } from "../models/Booking.js";
import { ClientSession } from "mongoose";
declare class BookingRepository {
    create(data: Partial<IBooking>, session?: ClientSession): Promise<any>;
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByBookingNumber(bookingNumber: string): Promise<any>;
    findByOvertimeOrderId(orderId: string): Promise<any>;
    findByVerificationPin(pin: string): Promise<any>;
    findOneByOvertimeOrderId(orderId: string): Promise<any>;
    findByDriver(driverId: string): Promise<any[]>;
    findByOwner(ownerId: string): Promise<any[]>;
    findOverlappingBooking(vehicleId: string, startTime: Date, endTime: Date): Promise<any>;
    findByParking(parkingId: string): Promise<any[]>;
    findExpiredPendingBookings(now: Date): Promise<any[]>;
    findExpiredConfirmedBookings(now: Date): Promise<any[]>;
    update(id: string, data: Partial<IBooking>): Promise<any>;
    delete(id: string): Promise<any>;
}
declare const _default: BookingRepository;
export default _default;
