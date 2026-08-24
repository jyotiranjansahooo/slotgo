"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  IndianRupee,
  RefreshCw,
  Wallet as WalletIcon,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import OwnerNavbar from "@/components/owner/OwnerNavbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getWallet,
  getWalletTransactions,
  withdrawWallet,
} from "@/services/wallet.service";
import { getApiErrorMessage } from "@/lib/api-error";

export default function OwnerWalletPage() {
  return (
    <ProtectedRoute allowedRoles={["parkingOwner"]}>
      <OwnerWallet />
    </ProtectedRoute>
  );
}

function OwnerWallet() {
  const queryClient = useQueryClient();

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawReference, setWithdrawReference] = useState("");

  const walletQuery = useQuery({
    queryKey: ["owner", "wallet"],
    queryFn: getWallet,
    staleTime: 30 * 1000,
  });

  const transactionsQuery = useQuery({
    queryKey: ["owner", "wallet", "transactions"],
    queryFn: getWalletTransactions,
    staleTime: 30 * 1000,
  });

  const withdrawMutation = useMutation({
    mutationFn: withdrawWallet,

    onSuccess: () => {
      setWithdrawAmount("");
      setWithdrawReference("");

      queryClient.invalidateQueries({
        queryKey: ["owner", "wallet"],
      });

      queryClient.invalidateQueries({
        queryKey: ["owner", "wallet", "transactions"],
      });
    },
  });

  const wallet = walletQuery.data?.data;
  const transactions = transactionsQuery.data?.data ?? [];

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) {
      return;
    }

    withdrawMutation.mutate({
      amount,
      referenceId: withdrawReference.trim() || undefined,
      description: "Owner wallet withdrawal",
    });
  };

  const isLoading =
    walletQuery.isLoading || transactionsQuery.isLoading;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06544E] text-white">

      <div className="pointer-events-none fixed inset-0">
        {/* Vertical stripe pattern */}
        <div
          className="
            absolute inset-0
            bg-[linear-gradient(
              90deg,
              rgba(255,255,255,0.025)_1px,
              transparent_1px
            )]
            bg-[length:72px_72px]
          "
        />

        <div className="absolute left-1/2 top-[-180px] h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-emerald-200/[0.07] blur-[140px]" />

        <div className="absolute bottom-[-250px] right-[-150px] h-[500px] w-[500px] rounded-full bg-teal-300/[0.06] blur-[140px]" />
      </div>

  <OwnerNavbar/>
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100/15 bg-emerald-100/10 px-3 py-1.5 text-xs font-medium text-emerald-50">
              <WalletIcon className="h-3.5 w-3.5" />
              Owner wallet
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Wallet & earnings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/60 sm:text-base">
              Track your parking earnings, available balance and wallet
              transactions in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              walletQuery.refetch();
              transactionsQuery.refetch();
            }}
            disabled={
              walletQuery.isFetching || transactionsQuery.isFetching
            }
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl
              border border-white/10
              bg-white/10
              px-4 py-2.5
              text-sm font-medium
              transition
              hover:bg-white/15
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                walletQuery.isFetching || transactionsQuery.isFetching
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {(walletQuery.isError || transactionsQuery.isError) && (
          <div className="mt-8 rounded-3xl border border-red-200/10 bg-red-950/20 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-300" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Unable to load wallet
                </h2>

                <p className="mt-1 text-sm text-white/50">
                  {getApiErrorMessage(
                    walletQuery.error ?? transactionsQuery.error,
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            WALLET SUMMARY
        ====================================================== */}

        {wallet && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <WalletStat
                label="Available balance"
                value={wallet.availableBalance}
                icon={WalletIcon}
                highlight
              />

              <WalletStat
                label="Pending balance"
                value={wallet.pendingBalance}
                icon={Clock3}
              />

              <WalletStat
                label="Total earnings"
                value={wallet.totalEarnings}
                icon={ArrowUpRight}
              />

              <WalletStat
                label="Total withdrawn"
                value={wallet.totalWithdrawn}
                icon={ArrowDownToLine}
              />
            </div>

            {/* =================================================
                WITHDRAW
            ================================================== */}

            <section className="mt-6 rounded-3xl border border-white/10 bg-black/[0.10] p-5 backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100/10 bg-emerald-100/10">
                      <ArrowDownToLine className="h-5 w-5 text-emerald-100" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold">
                        Withdraw earnings
                      </h2>

                      <p className="text-sm text-white/40">
                        Available: ₹
                        {wallet.availableBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
                  <div>
                    <label className="mb-1.5 block text-xs text-white/40">
                      Amount
                    </label>

                    <div className="relative">
                      <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                      <input
                        type="number"
                        min="1"
                        max={wallet.availableBalance}
                        value={withdrawAmount}
                        onChange={(event) =>
                          setWithdrawAmount(event.target.value)
                        }
                        placeholder="Enter amount"
                        className="
                          h-11 w-full rounded-xl
                          border border-white/10
                          bg-white/[0.05]
                          pl-9 pr-3
                          text-sm text-white
                          outline-none
                          placeholder:text-white/25
                          focus:border-emerald-200/30
                          focus:bg-white/[0.07]
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs text-white/40">
                      Reference ID
                    </label>

                    <input
                      type="text"
                      value={withdrawReference}
                      onChange={(event) =>
                        setWithdrawReference(event.target.value)
                      }
                      placeholder="Optional reference"
                      className="
                        h-11 w-full rounded-xl
                        border border-white/10
                        bg-white/[0.05]
                        px-3
                        text-sm text-white
                        outline-none
                        placeholder:text-white/25
                        focus:border-emerald-200/30
                        focus:bg-white/[0.07]
                      "
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={
                      withdrawMutation.isPending ||
                      !withdrawAmount ||
                      Number(withdrawAmount) <= 0 ||
                      Number(withdrawAmount) > wallet.availableBalance
                    }
                    className="
                      sm:col-span-2
                      inline-flex h-11 items-center justify-center gap-2
                      rounded-xl
                      bg-emerald-100
                      px-5
                      text-sm font-semibold
                      text-[#06544E]
                      transition
                      hover:bg-white
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    {withdrawMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowDownToLine className="h-4 w-4" />
                        Withdraw money
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Withdrawal error */}
              {withdrawMutation.isError && (
                <div className="mt-4 rounded-xl border border-red-200/10 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {getApiErrorMessage(withdrawMutation.error)}
                </div>
              )}

              {/* Withdrawal success */}
              {withdrawMutation.isSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200/10 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
                  <CheckCircle2 className="h-4 w-4" />
                  Withdrawal processed successfully.
                </div>
              )}
            </section>
          </>
        )}

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Recent transactions
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Your latest wallet activity.
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/40">
              {transactions.length} transactions
            </span>
          </div>

          {transactionsQuery.isLoading || isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <TransactionSkeleton key={index} />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/[0.10] p-12 text-center backdrop-blur-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                <WalletIcon className="h-6 w-6 text-emerald-100/60" />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No transactions yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-white/40">
                Your booking earnings and withdrawals will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/[0.10] backdrop-blur-xl">
              <div className="divide-y divide-white/10">
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction._id}
                    transaction={transaction}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function WalletStat({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: typeof WalletIcon;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl border p-5 backdrop-blur-xl
        transition duration-300
        ${
          highlight
            ? "border-emerald-200/20 bg-emerald-100/[0.08] hover:bg-emerald-100/[0.12]"
            : "border-white/10 bg-black/[0.10] hover:bg-white/[0.06]"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div
          className={`
            flex h-10 w-10 items-center justify-center rounded-xl
            ${
              highlight
                ? "bg-emerald-100/15"
                : "bg-white/[0.05]"
            }
          `}
        >
          <Icon className="h-5 w-5 text-emerald-100" />
        </div>

        <span className="text-2xl font-bold">
          ₹{value.toFixed(2)}
        </span>
      </div>

      <p className="mt-4 text-sm text-white/45">
        {label}
      </p>
    </div>
  );
}


function TransactionRow({
  transaction,
}: {
  transaction: {
    _id: string;
    amount: number;
    type: string;
    status: string;
    description: string;
    referenceId?: string;
    balanceAfter: number;
    createdAt: string;
  };
}) {
  const isWithdrawal =
    transaction.type.toLowerCase().includes("withdraw");

  const isRefund =
    transaction.type.toLowerCase().includes("refund");

  const isPositive = !isWithdrawal && !isRefund;

  return (
    <div className="group flex flex-col gap-4 p-5 transition hover:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={`
            flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
            ${
              isPositive
                ? "bg-emerald-300/10 text-emerald-100"
                : isRefund
                  ? "bg-amber-300/10 text-amber-100"
                  : "bg-red-300/10 text-red-100"
            }
          `}
        >
          {isPositive ? (
            <ArrowUpRight className="h-5 w-5" />
          ) : (
            <ArrowDownToLine className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white/90">
            {transaction.description || transaction.type}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/35">
            <span>{transaction.type}</span>

            <span>•</span>

            <span>{formatDate(transaction.createdAt)}</span>

            {transaction.referenceId && (
              <>
                <span>•</span>
                <span>{transaction.referenceId}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 sm:justify-end">
        <div className="text-right">
          <p
            className={`
              text-sm font-bold
              ${
                isPositive
                  ? "text-emerald-100"
                  : "text-red-100"
              }
            `}
          >
            {isPositive ? "+" : "-"}₹
            {transaction.amount.toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-white/30">
            Balance ₹{transaction.balanceAfter.toFixed(2)}
          </p>
        </div>

        <TransactionStatus status={transaction.status} />
      </div>
    </div>
  );
}


function TransactionStatus({
  status,
}: {
  status: string;
}) {
  const normalized = status.toLowerCase();

  const completed =
    normalized === "completed" ||
    normalized === "success" ||
    normalized === "successful";

  return (
    <span
      className={`
        rounded-full border px-2.5 py-1
        text-xs font-medium capitalize
        ${
          completed
            ? "border-emerald-200/15 bg-emerald-300/10 text-emerald-100"
            : "border-amber-200/10 bg-amber-300/10 text-amber-100"
        }
      `}
    >
      {status}
    </span>
  );
}

function TransactionSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-black/[0.10] p-5">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-white/10" />

        <div className="flex-1">
          <div className="h-4 w-48 rounded bg-white/10" />

          <div className="mt-2 h-3 w-64 rounded bg-white/5" />
        </div>

        <div className="h-5 w-24 rounded bg-white/10" />
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}