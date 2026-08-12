class VerificationService {
    generatePin() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
export default new VerificationService();
//# sourceMappingURL=verification.service.js.map