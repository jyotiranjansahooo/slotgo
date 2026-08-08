class BookingNumberService {
  generate(): string {
    const now = new Date();

    const date =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    const random = Math.floor(
      100000 + Math.random() * 900000,
    );

    return `SLTG-${date}-${random}`;
  }
}

export default new BookingNumberService();