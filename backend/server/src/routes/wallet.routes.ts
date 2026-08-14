import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import requireRole from "../middleware/role.middleware.js";
import { USER_ROLES } from "../constants/roles.js";

import {
  getWallet,
  getWalletTransactions,
  getWalletTransaction,
  withdrawWallet,
} from "../controllers/wallet.controller.js";

const router = Router();

// ============================================================
// OWNER WALLET
// ============================================================

router.get(
  "/",
  authMiddleware,
  requireRole(USER_ROLES.PARKING_OWNER),
  getWallet,
);

// ============================================================
// TRANSACTIONS
// ============================================================

router.get(
  "/transactions",
  authMiddleware,
  requireRole(USER_ROLES.PARKING_OWNER),
  getWalletTransactions,
);

router.get(
  "/transactions/:transactionId",
  authMiddleware,
  requireRole(USER_ROLES.PARKING_OWNER),
  getWalletTransaction,
);

// ============================================================
// WITHDRAW
// ============================================================

router.post(
  "/withdraw",
  authMiddleware,
  requireRole(USER_ROLES.PARKING_OWNER),
  withdrawWallet,
);

export default router;