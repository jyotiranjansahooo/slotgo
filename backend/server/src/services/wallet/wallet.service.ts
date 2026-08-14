import mongoose from "mongoose";

import ApiError from "../../utils/ApiError.js";

import walletRepository from "../../repositories/wallet.repository.js";
import transactionRepository from "../../repositories/transaction.repository.js";

import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from "../../constants/wallet.js";

class WalletService {
  // ============================================================
  // GET OR CREATE OWNER WALLET
  // ============================================================

  async getOrCreateWallet(ownerId: string) {
    let wallet =
      await walletRepository.findByOwnerId(
        ownerId,
      );

    if (wallet) {
      return wallet;
    }

    wallet =
      await walletRepository.create({
        ownerId:
          new mongoose.Types.ObjectId(
            ownerId,
          ),

        availableBalance: 0,

        pendingBalance: 0,

        totalEarnings: 0,

        totalWithdrawn: 0,

        isActive: true,
      });

    return wallet;
  }

  // ============================================================
  // GET OWNER WALLET
  // ============================================================

  async getWallet(ownerId: string) {
    return this.getOrCreateWallet(
      ownerId,
    );
  }

  // ============================================================
  // CREDIT OWNER EARNINGS
  // ============================================================

  async creditOwnerEarnings(
    ownerId: string,
    amount: number,
    bookingId?: string,
    referenceId?: string,
    description =
      "Parking booking earnings",
  ) {
    if (amount <= 0) {
      throw new ApiError(
        400,
        "Credit amount must be greater than zero.",
      );
    }

    const wallet =
      await this.getOrCreateWallet(
        ownerId,
      );

    if (!wallet.isActive) {
      throw new ApiError(
        400,
        "Wallet is inactive.",
      );
    }

    // ----------------------------------------------------------
    // PREVENT DUPLICATE TRANSACTION
    // ----------------------------------------------------------

    if (referenceId) {
      const existingTransaction =
        await transactionRepository.findByReferenceId(
          referenceId,
        );

      if (existingTransaction) {
        return {
          wallet,
          transaction:
            existingTransaction,
        };
      }
    }

    // ----------------------------------------------------------
    // CALCULATE BALANCE
    // ----------------------------------------------------------

    const balanceBefore =
      wallet.availableBalance;

    const balanceAfter =
      balanceBefore + amount;

    // ----------------------------------------------------------
    // UPDATE WALLET
    // ----------------------------------------------------------

    const updatedWallet =
      await walletRepository.updateBalance(
        wallet._id.toString(),
        {
          availableBalance:
            balanceAfter,

          totalEarnings:
            wallet.totalEarnings +
            amount,
        },
      );

    if (!updatedWallet) {
      throw new ApiError(
        500,
        "Unable to update wallet balance.",
      );
    }

    // ----------------------------------------------------------
    // CREATE TRANSACTION
    // ----------------------------------------------------------

    const transaction =
      await transactionRepository.create({
        walletId:
          updatedWallet._id,

        ownerId:
          updatedWallet.ownerId,

        bookingId: bookingId
          ? new mongoose.Types.ObjectId(
              bookingId,
            )
          : undefined,

        amount,

        type:
          WALLET_TRANSACTION_TYPE.BOOKING_CREDIT,

        status:
          WALLET_TRANSACTION_STATUS.COMPLETED,

        description,

        referenceId:
          referenceId ?? "",

        balanceBefore,

        balanceAfter,
      });

    return {
      wallet: updatedWallet,
      transaction,
    };
  }

// ============================================================
// REVERSE OWNER EARNINGS
// ============================================================

async reverseOwnerEarnings(
  ownerId: string,
  amount: number,
  bookingId: string,
  referenceId: string,
  description = "Booking refund",
) {
  if (amount <= 0) {
    throw new ApiError(
      400,
      "Refund reversal amount must be greater than zero.",
    );
  }

  const wallet =
    await this.getOrCreateWallet(ownerId);

  if (!wallet.isActive) {
    throw new ApiError(
      400,
      "Wallet is inactive.",
    );
  }

  // ----------------------------------------------------------
  // PREVENT DUPLICATE REFUND REVERSAL
  // ----------------------------------------------------------

  const existingTransaction =
    await transactionRepository.findByReferenceId(
      referenceId,
    );

  if (existingTransaction) {
    return {
      wallet,
      transaction: existingTransaction,
    };
  }

  // ----------------------------------------------------------
  // CHECK OWNER BALANCE
  // ----------------------------------------------------------

  if (
    wallet.availableBalance < amount
  ) {
    throw new ApiError(
      400,
      "Owner wallet balance is insufficient for refund reversal.",
    );
  }

  // ----------------------------------------------------------
  // CALCULATE BALANCE
  // ----------------------------------------------------------

  const balanceBefore =
    wallet.availableBalance;

  const balanceAfter =
    balanceBefore - amount;

  const updatedWallet =
    await walletRepository.updateBalance(
      wallet._id.toString(),
      {
        availableBalance:
          balanceAfter,

        totalEarnings:
          Math.max(
            0,
            wallet.totalEarnings - amount,
          ),
      },
    );

  if (!updatedWallet) {
    throw new ApiError(
      500,
      "Unable to update wallet balance.",
    );
  }

  // ----------------------------------------------------------
  // CREATE REFUND TRANSACTION
  // ----------------------------------------------------------

  const transaction =
    await transactionRepository.create({
      walletId:
        updatedWallet._id,

      ownerId:
        updatedWallet.ownerId,

      bookingId:
        new mongoose.Types.ObjectId(
          bookingId,
        ),

      amount,

      type:
        WALLET_TRANSACTION_TYPE.REFUND,

      status:
        WALLET_TRANSACTION_STATUS.COMPLETED,

      description,

      referenceId,

      balanceBefore,

      balanceAfter,
    });

  return {
    wallet: updatedWallet,
    transaction,
  };
}
  async withdraw(
    ownerId: string,
    amount: number,
    referenceId?: string,
    description =
      "Wallet withdrawal",
  ) {
    if (amount <= 0) {
      throw new ApiError(
        400,
        "Withdrawal amount must be greater than zero.",
      );
    }

    const wallet =
      await this.getOrCreateWallet(
        ownerId,
      );

    if (!wallet.isActive) {
      throw new ApiError(
        400,
        "Wallet is inactive.",
      );
    }

    // ----------------------------------------------------------
    // PREVENT DUPLICATE WITHDRAWAL
    // ----------------------------------------------------------

    if (referenceId) {
      const existingTransaction =
        await transactionRepository.findByReferenceId(
          referenceId,
        );

      if (existingTransaction) {
        return {
          wallet,
          transaction:
            existingTransaction,
        };
      }
    }

    // ----------------------------------------------------------
    // BALANCE CHECK
    // ----------------------------------------------------------

    if (
      wallet.availableBalance <
      amount
    ) {
      throw new ApiError(
        400,
        "Insufficient wallet balance.",
      );
    }

    // ----------------------------------------------------------
    // CALCULATE BALANCE
    // ----------------------------------------------------------

    const balanceBefore =
      wallet.availableBalance;

    const balanceAfter =
      balanceBefore - amount;

    // ----------------------------------------------------------
    // UPDATE WALLET
    // ----------------------------------------------------------

    const updatedWallet =
      await walletRepository.updateBalance(
        wallet._id.toString(),
        {
          availableBalance:
            balanceAfter,

          totalWithdrawn:
            wallet.totalWithdrawn +
            amount,

          lastWithdrawalAt:
            new Date(),
        },
      );

    if (!updatedWallet) {
      throw new ApiError(
        500,
        "Unable to update wallet balance.",
      );
    }

    // ----------------------------------------------------------
    // CREATE TRANSACTION
    // ----------------------------------------------------------

    const transaction =
      await transactionRepository.create({
        walletId:
          updatedWallet._id,

        ownerId:
          updatedWallet.ownerId,

        amount,

        type:
          WALLET_TRANSACTION_TYPE.WITHDRAWAL,

        status:
          WALLET_TRANSACTION_STATUS.COMPLETED,

        description,

        referenceId:
          referenceId ?? "",

        balanceBefore,

        balanceAfter,
      });

    return {
      wallet: updatedWallet,
      transaction,
    };
  }

  // ============================================================
  // GET WALLET TRANSACTIONS
  // ============================================================

  async getTransactions(
    ownerId: string,
  ) {
    const wallet =
      await walletRepository.findByOwnerId(
        ownerId,
      );

    if (!wallet) {
      return [];
    }

    return transactionRepository.findByWalletId(
      wallet._id.toString(),
    );
  }

  // ============================================================
  // GET SINGLE TRANSACTION
  // ============================================================

  async getTransaction(
    ownerId: string,
    transactionId: string,
  ) {
    const transaction =
      await transactionRepository.findById(
        transactionId,
      );

    if (!transaction) {
      throw new ApiError(
        404,
        "Transaction not found.",
      );
    }

    if (
      transaction.ownerId?.toString() !==
      ownerId
    ) {
      throw new ApiError(
        403,
        "You are not authorized to view this transaction.",
      );
    }

    return transaction;
  }
}

export default new WalletService();