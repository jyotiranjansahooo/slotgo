import api from "@/lib/api";

import type { ApiResponse } from "@/types/api";
import type {
  Wallet,
  WalletTransaction,
  WithdrawWalletData,
  WithdrawWalletResponse,
} from "@/types/wallet";

// GET OWNER WALLET

export const getWallet = async (): Promise<ApiResponse<Wallet>> => {
  const response = await api.get<ApiResponse<Wallet>>("/wallet");

  return response.data;
};

// GET WALLET TRANSACTIONS

export const getWalletTransactions = async (): Promise<
  ApiResponse<WalletTransaction[]>
> => {
  const response = await api.get<ApiResponse<WalletTransaction[]>>(
    "/wallet/transactions",
  );

  return response.data;
};

// GET SINGLE TRANSACTION

export const getWalletTransaction = async (
  transactionId: string,
): Promise<ApiResponse<WalletTransaction>> => {
  const response = await api.get<ApiResponse<WalletTransaction>>(
    `/wallet/transactions/${transactionId}`,
  );

  return response.data;
};

// WITHDRAW

export const withdrawWallet = async (
  data: WithdrawWalletData,
): Promise<ApiResponse<WithdrawWalletResponse>> => {
  const response = await api.post<ApiResponse<WithdrawWalletResponse>>(
    "/wallet/withdraw",
    data,
  );

  return response.data;
};