export interface Wallet {
  _id: string;
  ownerId: string;

  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;

  isActive: boolean;

  lastWithdrawalAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  _id: string;

  walletId: string;
  ownerId: string;

  bookingId?: string;

  amount: number;

  type: string;
  status: string;

  description: string;
  referenceId?: string;

  balanceBefore: number;
  balanceAfter: number;

  createdAt: string;
  updatedAt: string;
}

export interface WithdrawWalletData {
  amount: number;
  referenceId?: string;
  description?: string;
}

export interface WithdrawWalletResponse {
  wallet: Wallet;
  transaction: WalletTransaction;
}

export interface WalletTransaction {
  _id: string;

  walletId: string;

  ownerId: string;

  bookingId?: string;

  amount: number;

  type: string;

  status: string;

  description: string;

  referenceId?: string;

  balanceBefore: number;

  balanceAfter: number;

  createdAt: string;

  updatedAt: string;
}

export interface WithdrawWalletData {
  amount: number;

  referenceId?: string;

  description?: string;
}

export interface WithdrawWalletResponse {
  wallet: Wallet;

  transaction: WalletTransaction;
}
