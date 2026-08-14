import { Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import walletService from "../services/wallet/wallet.service.js";

// ============================================================
// GET OWNER WALLET
// ============================================================

export const getWallet = asyncHandler(
  async (req: Request, res: Response) => {
    const ownerId = req.user!._id.toString();

    const wallet =
      await walletService.getWallet(ownerId);

    return res.status(200).json(
      new ApiResponse(
        200,
        wallet,
        "Wallet fetched successfully.",
      ),
    );
  },
);

// ============================================================
// GET WALLET TRANSACTIONS
// ============================================================

export const getWalletTransactions =
  asyncHandler(
    async (req: Request, res: Response) => {
      const ownerId =
        req.user!._id.toString();

      const transactions =
        await walletService.getTransactions(
          ownerId,
        );

      return res.status(200).json(
        new ApiResponse(
          200,
          transactions,
          "Wallet transactions fetched successfully.",
        ),
      );
    },
  );

// ============================================================
// GET SINGLE TRANSACTION
// ============================================================

export const getWalletTransaction =
  asyncHandler(
    async (req: Request, res: Response) => {
      const ownerId =
        req.user!._id.toString();

      const transactionId =
        req.params.transactionId as string;

      const transaction =
        await walletService.getTransaction(
          ownerId,
          transactionId,
        );

      return res.status(200).json(
        new ApiResponse(
          200,
          transaction,
          "Transaction fetched successfully.",
        ),
      );
    },
  );

// ============================================================
// WITHDRAW WALLET BALANCE
// ============================================================

export const withdrawWallet =
  asyncHandler(
    async (req: Request, res: Response) => {
      const ownerId =
        req.user!._id.toString();

      const amount = Number(
        req.body.amount,
      );

      const referenceId =
        typeof req.body.referenceId ===
        "string"
          ? req.body.referenceId
          : undefined;

      const description =
        typeof req.body.description ===
        "string"
          ? req.body.description
          : "Wallet withdrawal";

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return res.status(400).json(
          new ApiResponse(
            400,
            null,
            "Valid withdrawal amount is required.",
          ),
        );
      }

      const result =
        await walletService.withdraw(
          ownerId,
          amount,
          referenceId,
          description,
        );

      return res.status(200).json(
        new ApiResponse(
          200,
          result,
          "Withdrawal processed successfully.",
        ),
      );
    },
  );