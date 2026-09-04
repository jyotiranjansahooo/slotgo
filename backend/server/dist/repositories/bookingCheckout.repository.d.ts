import { IBookingCheckout } from "../models/BookingCheckout.js";
declare class BookingCheckoutRepository {
    create(data: Partial<IBookingCheckout>): Promise<any>;
    findById(id: string): Promise<any>;
    findByOrderId(orderId: string): Promise<any>;
    findByDriver(driverId: string): Promise<any[]>;
    delete(id: string): Promise<any>;
    deleteByOrderId(orderId: string): Promise<any>;
    findExpired(now: Date): Promise<any[]>;
}
declare const _default: BookingCheckoutRepository;
export default _default;
