import { IPayment } from "../models/Payment.js";
declare class PaymentRepository {
    create(data: Partial<IPayment>): Promise<any>;
    findById(id: string): Promise<any>;
    findByBookingId(bookingId: string): Promise<any>;
    findByOrderId(orderId: string): Promise<any>;
    findByPaymentId(paymentId: string): Promise<any>;
    update(id: string, data: Partial<IPayment>): Promise<any>;
    updateStatus(id: string, status: IPayment["status"]): Promise<any>;
}
declare const _default: PaymentRepository;
export default _default;
