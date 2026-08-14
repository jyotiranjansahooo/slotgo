declare class AdminService {
    getUsers(): Promise<(import("mongoose").Document<unknown, {}, import("../../models/User.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<import("../../models/User.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../../models/User.js").IUserMethods & {
        id: string;
    }>)[]>;
    getUserById(userId: string): Promise<import("mongoose").Document<unknown, {}, import("../../models/User.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<import("../../models/User.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../../models/User.js").IUserMethods & {
        id: string;
    }>>;
    updateUserStatus(userId: string, isActive: boolean): Promise<import("mongoose").Document<unknown, {}, import("../../models/User.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<import("../../models/User.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../../models/User.js").IUserMethods & {
        id: string;
    }>>;
    getParkings(): Promise<any[]>;
    approveParking(parkingId: string): Promise<any>;
    rejectParking(parkingId: string): Promise<any>;
    getBookings(): Promise<any[]>;
    getBookingById(bookingId: string): Promise<any>;
    getParkingBookings(parkingId: string): Promise<any[]>;
    getPaymentById(paymentId: string): Promise<any>;
    getPaymentByBooking(bookingId: string): Promise<any>;
    getDashboardStats(): Promise<{
        users: {
            total: number;
            active: number;
            inactive: number;
        };
        parkings: {
            total: number;
            approved: number;
            pending: number;
            rejected: number;
        };
        bookings: {
            total: number;
            pending: number;
            confirmed: number;
            active: number;
            completed: number;
            cancelled: number;
            expired: number;
        };
        payments: {
            total: number;
            successful: number;
            failed: number;
            totalRevenue: number;
            totalRefunded: number;
        };
    }>;
}
declare const _default: AdminService;
export default _default;
