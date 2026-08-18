import { Router } from "express";

import {
  getWallet,
  getWalletTransactions,
  getWalletTransaction,
  withdrawWallet,
} from "../controllers/wallet.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// GET OWNER WALLET

router.get(
  "/",
  authMiddleware,
  getWallet,
);

// GET WALLET TRANSACTIONS

router.get(
  "/transactions",
  authMiddleware,
  getWalletTransactions,
);

// GET SINGLE TRANSACTION

router.get(
  "/transactions/:transactionId",
  authMiddleware,
  getWalletTransaction,
);

// WITHDRAW WALLET BALANCE

router.post(
  "/withdraw",
  authMiddleware,
  withdrawWallet,
);

export default router;