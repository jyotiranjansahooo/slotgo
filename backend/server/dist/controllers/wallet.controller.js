import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { withdrawWalletSchema } from "../validations/wallet/withdraw.validation.js";
import walletService from "../services/wallet/wallet.service.js";
// ============================================================
// GET OWNER WALLET
// ============================================================
export const getWallet = asyncHandler(async (req, res) => {
    const ownerId = req.user._id.toString();
    const wallet = await walletService.getWallet(ownerId);
    return res
        .status(200)
        .json(new ApiResponse(200, wallet, "Wallet fetched successfully."));
});
// ============================================================
// GET WALLET TRANSACTIONS
// ============================================================
export const getWalletTransactions = asyncHandler(async (req, res) => {
    const ownerId = req.user._id.toString();
    const transactions = await walletService.getTransactions(ownerId);
    return res
        .status(200)
        .json(new ApiResponse(200, transactions, "Wallet transactions fetched successfully."));
});
// ============================================================
// GET SINGLE TRANSACTION
// ============================================================
export const getWalletTransaction = asyncHandler(async (req, res) => {
    const ownerId = req.user._id.toString();
    const transactionId = req.params.transactionId;
    const transaction = await walletService.getTransaction(ownerId, transactionId);
    return res
        .status(200)
        .json(new ApiResponse(200, transaction, "Transaction fetched successfully."));
});
// ============================================================
// WITHDRAW WALLET BALANCE
// ============================================================
export const withdrawWallet = asyncHandler(async (req, res) => {
    const ownerId = req.user._id.toString();
    const data = withdrawWalletSchema.parse(req.body);
    const result = await walletService.withdraw(ownerId, data.amount, data.referenceId, data.description ??
        "Wallet withdrawal");
    return res
        .status(200)
        .json(new ApiResponse(200, result, "Withdrawal processed successfully."));
});
//# sourceMappingURL=wallet.controller.js.map