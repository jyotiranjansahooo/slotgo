declare class Logger {
    info(message: string): void;
    success(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    divider(): void;
}
declare const logger: Logger;
export default logger;
