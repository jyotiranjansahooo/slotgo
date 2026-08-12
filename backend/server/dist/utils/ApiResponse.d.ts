declare class ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T | null;
    constructor(statusCode: number, data?: T | null, message?: string);
}
export default ApiResponse;
