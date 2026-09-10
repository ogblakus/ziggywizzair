export type EthereumProvider = {
  isMetaMask?: boolean;
  providers?: EthereumProvider[];
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

export const ARBITRUM = {
  chainId: "0xa4b1",
  chainName: "Arbitrum One",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://arb1.arbitrum.io/rpc"],
  blockExplorerUrls: ["https://arbiscan.io"],
} as const;

/** Hyperliquid Bridge2 on Arbitrum. Native USDC transfer credits the sender. Min 5 USDC. */
export const HL_BRIDGE = "0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7";
export const USDC_ARB = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
export const MIN_DEPOSIT_USDC = 5;
/** Comfortable pad so gas never blocks a second try. ≈ $2–3 at ~$2.5k ETH. */
export const ARB_ETH_KEEP = 0.001;
/** Below this, MetaMask often fails even though a single transfer is cheaper. */
export const ARB_ETH_WARN = 0.00005;

export function getEthereum(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const raw = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  if (!raw) return null;
  const nested = raw.providers?.find((p) => p.isMetaMask);
  return nested ?? raw;
}

export function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export function shortAddress(value: string): string {
  const a = value.trim();
  if (a.length < 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function mmError(err: unknown): string {
  const e = err as { code?: number; message?: string };
  if (e?.code === 4001) return "Rejected in MetaMask.";
  const msg = e?.message ?? "";
  if (/user rejected/i.test(msg)) return "Rejected in MetaMask.";
  return msg || "Transaction failed";
}

let sdkProvider: EthereumProvider | null | undefined;

async function metamaskSdkProvider(): Promise<EthereumProvider | null> {
  if (typeof window === "undefined") return null;
  if (sdkProvider !== undefined) return sdkProvider;
  try {
    const { MetaMaskSDK } = await import("@metamask/sdk");
    const sdk = new MetaMaskSDK({
      dappMetadata: {
        name: "ZiggyWizzAir",
        url: window.location.origin,
        iconUrl: `${window.location.origin}/favicon.svg`,
      },
      checkInstallationImmediately: false,
      enableAnalytics: false,
      headless: true,
      useDeeplink: true,
      preferDesktop: false,
    });
    await sdk.init();
    const provider = sdk.getProvider() as EthereumProvider | null;
    sdkProvider = provider ?? null;
    return sdkProvider;
  } catch {
    sdkProvider = null;
    return null;
  }
}

export async function requestMetaMaskAccounts(): Promise<string> {
  let eth = getEthereum();
  if (!eth) eth = await metamaskSdkProvider();
  if (!eth) {
    throw new Error("Install MetaMask and return here. Do not open this desk inside MetaMask’s browser.");
  }
  const accounts = (await eth.request({ method: "eth_requestAccounts" })) as unknown;
  const list = Array.isArray(accounts) ? accounts.filter((a): a is string => typeof a === "string") : [];
  const first = list[0];
  if (!first || !isAddress(first)) throw new Error("MetaMask did not return an account.");
  return first;
}

export async function ensureArbitrum(eth: EthereumProvider): Promise<void> {
  const id = await eth.request({ method: "eth_chainId" });
  if (typeof id === "string" && id.toLowerCase() === ARBITRUM.chainId) return;
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARBITRUM.chainId }],
    });
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 4902) {
      await eth.request({ method: "wallet_addEthereumChain", params: [ARBITRUM] });
      return;
    }
    throw err;
  }
}

function pad32(hex: string): string {
  return hex.replace(/^0x/, "").toLowerCase().padStart(64, "0");
}

export function usdcUnits(amount: number): bigint {
  if (!Number.isFinite(amount) || amount <= 0) return 0n;
  return BigInt(Math.round(amount * 1e6));
}

function encodeUsdcTransfer(to: string, units: bigint): string {
  return `0xa9059cbb${pad32(to)}${pad32(units.toString(16))}`;
}

export async function waitForTx(eth: EthereumProvider, hash: string, timeoutMs = 90_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const receipt = await eth.request({
      method: "eth_getTransactionReceipt",
      params: [hash],
    });
    if (receipt && typeof receipt === "object") {
      const status = (receipt as { status?: string }).status;
      if (status === "0x0") throw new Error("Deposit reverted on Arbitrum.");
      if (status === "0x1" || status === "1") return;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Timed out waiting for the deposit.");
}

export async function depositUsdcToHyperliquid(from: string, amount: number): Promise<string> {
  if (amount + 1e-9 < MIN_DEPOSIT_USDC) {
    throw new Error(`Hyperliquid min is $${MIN_DEPOSIT_USDC}. Under that is lost.`);
  }
  const units = usdcUnits(amount);
  if (units <= 0n) throw new Error("Enter an amount.");
  const eth = getEthereum();
  if (!eth) throw new Error("Open this desk inside MetaMask.");
  const accounts = (await eth.request({ method: "eth_requestAccounts" })) as unknown;
  const list = Array.isArray(accounts) ? accounts.filter((a): a is string => typeof a === "string") : [];
  const signer = list[0]?.toLowerCase();
  if (!signer) throw new Error("MetaMask did not return an account.");
  if (signer !== from.trim().toLowerCase()) {
    throw new Error("Connected MetaMask is a different address. Switch account.");
  }
  await ensureArbitrum(eth);
  const hash = await eth.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: signer,
        to: USDC_ARB,
        data: encodeUsdcTransfer(HL_BRIDGE, units),
        chainId: ARBITRUM.chainId,
      },
    ],
  });
  if (typeof hash !== "string" || !hash.startsWith("0x")) {
    throw new Error("MetaMask did not return a transaction.");
  }
  await waitForTx(eth, hash);
  return hash;
}
