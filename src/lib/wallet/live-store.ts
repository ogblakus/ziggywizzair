import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  depositUsdcToHyperliquid,
  getEthereum,
  isAddress,
  mmError,
  requestMetaMaskAccounts,
} from "@/lib/wallet/ethereum";
import { loadPerpsAccount, type LivePerp, type LiveWalletTokens } from "@/lib/wallet/hyperliquid";
import type { ClosedTrade } from "@/lib/types";

type LiveStatus = "idle" | "connecting" | "live" | "error";

type LiveState = {
  address: string | null;
  source: "metamask" | "watch" | null;
  equity: number | null;
  withdrawable: number | null;
  hlSpotUsdc: number | null;
  depositGasEth: number | null;
  wallet: LiveWalletTokens | null;
  positions: LivePerp[];
  closed: ClosedTrade[];
  status: LiveStatus;
  depositing: boolean;
  lastTx: string | null;
  error: string | null;
  connectMetaMask: () => Promise<void>;
  watchAddress: (address: string) => Promise<void>;
  refresh: () => Promise<void>;
  deposit: (amount: number) => Promise<void>;
  disconnect: () => void;
};

async function pull(address: string) {
  const res = await loadPerpsAccount({ data: { address } });
  if (!res.ok) throw new Error(res.error);
  return res.account;
}

function applyAccount(
  account: Awaited<ReturnType<typeof pull>>,
  extra: Partial<LiveState> = {},
): Partial<LiveState> {
  return {
    address: account.address,
    equity: account.equity,
    withdrawable: account.withdrawable,
    hlSpotUsdc: account.hlSpotUsdc,
    depositGasEth: account.depositGasEth,
    wallet: account.wallet,
    positions: account.positions,
    closed: account.closed ?? [],
    status: "live",
    error: null,
    ...extra,
  };
}

export const useLiveWallet = create<LiveState>()(
  persist(
    (set, get) => ({
      address: null,
      source: null,
      equity: null,
      withdrawable: null,
      hlSpotUsdc: null,
      depositGasEth: null,
      wallet: null,
      positions: [],
      closed: [],
      status: "idle",
      depositing: false,
      lastTx: null,
      error: null,
      connectMetaMask: async () => {
        set({ status: "connecting", error: null });
        try {
          const address = await requestMetaMaskAccounts();
          const account = await pull(address);
          set(applyAccount(account, { source: "metamask" }));
        } catch (err) {
          set({
            status: "error",
            error: err instanceof Error ? err.message : "Could not connect MetaMask",
          });
        }
      },
      watchAddress: async (raw) => {
        const address = raw.trim();
        if (!isAddress(address)) {
          set({ status: "error", error: "Paste a 0x address." });
          return;
        }
        set({ status: "connecting", error: null });
        try {
          const account = await pull(address);
          set(applyAccount(account, { source: "watch" }));
        } catch (err) {
          set({
            status: "error",
            error: err instanceof Error ? err.message : "Hyperliquid quiet",
          });
        }
      },
      refresh: async () => {
        const address = get().address;
        if (!address) return;
        try {
          const account = await pull(address);
          set(applyAccount(account));
        } catch (err) {
          set({
            status: "error",
            error: err instanceof Error ? err.message : "Hyperliquid quiet",
          });
        }
      },
      deposit: async (amount) => {
        const address = get().address;
        if (!address) throw new Error("Connect MetaMask first.");
        set({ depositing: true, error: null });
        try {
          const hash = await depositUsdcToHyperliquid(address, amount);
          set({ lastTx: hash });
          const before = (get().hlSpotUsdc ?? 0) + (get().equity ?? 0);
          for (let i = 0; i < 12; i++) {
            await new Promise((r) => setTimeout(r, 4000));
            await get().refresh();
            const after = (get().hlSpotUsdc ?? 0) + (get().equity ?? 0);
            if (after > before + amount * 0.5) break;
          }
        } catch (err) {
          set({ error: mmError(err) });
        } finally {
          set({ depositing: false });
        }
      },
      disconnect: () =>
        set({
          address: null,
          source: null,
          equity: null,
          withdrawable: null,
          hlSpotUsdc: null,
          depositGasEth: null,
          wallet: null,
          positions: [],
          closed: [],
          status: "idle",
          depositing: false,
          lastTx: null,
          error: null,
        }),
    }),
    {
      name: "zw-live-wallet",
      partialize: (s) => ({ address: s.address, source: s.source }),
      onRehydrateStorage: () => (state) => {
        if (!state?.address) return;
        void state.refresh();
        const eth = getEthereum();
        if (!eth?.on) return;
        const onAccounts = (...args: unknown[]) => {
          const list = Array.isArray(args[0]) ? (args[0] as string[]) : [];
          const next = list[0];
          if (!next) {
            useLiveWallet.getState().disconnect();
            return;
          }
          void useLiveWallet.getState().watchAddress(next).then(() => {
            useLiveWallet.setState({ source: "metamask" });
          });
        };
        eth.on("accountsChanged", onAccounts);
      },
    },
  ),
);
