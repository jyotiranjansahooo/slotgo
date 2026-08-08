import QRCode from "qrcode";

class QRService {
  async generate(
    bookingNumber: string,
  ): Promise<string> {
    return QRCode.toDataURL(
      bookingNumber,
    );
  }
}

export default new QRService();