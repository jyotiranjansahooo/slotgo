import QRCode from "qrcode";
class QRService {
    async generate(bookingNumber) {
        return QRCode.toDataURL(bookingNumber);
    }
}
export default new QRService();
//# sourceMappingURL=qr.service.js.map