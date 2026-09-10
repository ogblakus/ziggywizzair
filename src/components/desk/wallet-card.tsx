import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { compactPrice, money, qtyFmt, signedClass } from "@/lib/format";
import { DESK_TO_PERP } from "@/lib/wallet/hyperliquid";
import { ARB_ETH_KEEP, ARB_ETH_WARN, MIN_DEPOSIT_USDC, shortAddress } from "@/lib/wallet/ethereum";
import { useLiveWallet } from "@/lib/wallet/live-store";
import { useT } from "@/lib/i18n";

export function WalletCard() {
  const t = useT();
  const address = useLiveWallet((s) => s.address);
  const source = useLiveWallet((s) => s.source);
  const equity = useLiveWallet((s) => s.equity);
  const withdrawable = useLiveWallet((s) => s.withdrawable);
  const hlSpotUsdc = useLiveWallet((s) => s.hlSpotUsdc);
  const depositGasEth = useLiveWallet((s) => s.depositGasEth);
  const wallet = useLiveWallet((s) => s.wallet);
  const positions = useLiveWallet((s) => s.positions);
  const status = useLiveWallet((s) => s.status);
  const depositing = useLiveWallet((s) => s.depositing);
  const lastTx = useLiveWallet((s) => s.lastTx);
  const error = useLiveWallet((s) => s.error);
  const connectMetaMask = useLiveWallet((s) => s.connectMetaMask);
  const watchAddress = useLiveWallet((s) => s.watchAddress);
  const refresh = useLiveWallet((s) => s.refresh);
  const deposit = useLiveWallet((s) => s.deposit);
  const disconnect = useLiveWallet((s) => s.disconnect);
  const [draft, setDraft] = useState("");
  const [amount, setAmount] = useState("");
  const [confirm, setConfirm] = useState(false);

  const busy = status === "connecting" || depositing;
  const usdcWallet = (wallet?.usdcEth ?? 0) + (wallet?.usdcArb ?? 0) + (wallet?.usdcArbE ?? 0);
  const arbUsdc = wallet?.usdcArb ?? 0;
  const parsed = Number(amount);
  const canDeposit =
    source === "metamask" &&
    Number.isFinite(parsed) &&
    parsed >= MIN_DEPOSIT_USDC &&
    parsed <= arbUsdc + 1e-6;

  function onWatch(e: FormEvent) {
    e.preventDefault();
    void watchAddress(draft);
  }

  return (
    <section className="mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="text-sm font-medium">{t("wallet.title")}</div>
      <p className="mt-0.5 text-2xs leading-relaxed text-muted">{t("wallet.body")}</p>

      {address ? (
        <>
          <div className="mt-3 rounded-md bg-surface px-3 py-2">
            <div className="text-2xs font-medium tracking-wide text-subtle uppercase">
              {source === "watch" ? t("wallet.watching") : t("wallet.mm")}
            </div>
            <div className="mt-0.5 font-mono text-sm tabular-nums">{shortAddress(address)}</div>
          </div>

          <div className="mt-2 text-2xs font-medium tracking-wide text-subtle uppercase">
            {t("wallet.wallet")}
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <Stat label={t("wallet.usdc")} value={money(usdcWallet)} />
            <Stat label={t("wallet.eth")} value={wallet ? compactPrice(wallet.eth + wallet.arbEth) : "—"} />
          </div>
          <p className="mt-1 text-2xs leading-relaxed text-subtle">
            {wallet
              ? t("wallet.breakdown", {
                  arb: money(wallet.usdcArb),
                  eth: money(wallet.usdcEth),
                  e: wallet.usdcArbE ? t("wallet.usdcE", { amount: money(wallet.usdcArbE) }) : "",
                })
              : t("wallet.reading")}
          </p>

          <div className="mt-3 text-2xs font-medium tracking-wide text-subtle uppercase">
            {t("wallet.hyperliquid")}
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <Stat label={t("wallet.perpsEquity")} value={equity == null ? "—" : money(equity)} />
            <Stat label={t("wallet.hlSpot")} value={hlSpotUsdc == null ? "—" : money(hlSpotUsdc)} />
          </div>
          {withdrawable != null && withdrawable > 0 ? (
            <p className="mt-1 text-2xs text-subtle">
              {t("wallet.withdrawable", { amount: money(withdrawable) })}
            </p>
          ) : null}
          {positions.length ? (
            <ul className="mt-2 space-y-1">
              {positions.slice(0, 8).map((p) => (
                <li key={p.coin} className="flex items-baseline justify-between gap-2 font-mono text-2xs tabular-nums">
                  <span>
                    {p.qty >= 0 ? t("wallet.long") : t("wallet.short")} {qtyFmt(Math.abs(p.qty), true)} {p.desk ?? p.coin}
                  </span>
                  <span className={signedClass(p.pnl)}>{money(p.pnl)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-2xs text-muted">{t("wallet.noPerps", { min: MIN_DEPOSIT_USDC })}</p>
          )}

          {source === "metamask" ? (
            <div className="mt-3 rounded-md bg-surface p-2">
              <div className="text-2xs font-medium tracking-wide text-subtle uppercase">
                {t("wallet.deposit")}
              </div>
              <p className="mt-0.5 text-2xs leading-relaxed text-muted">
                {t("wallet.depositBody", {
                  min: MIN_DEPOSIT_USDC,
                  keep: ARB_ETH_KEEP,
                  gas: gasLabel(depositGasEth),
                  warn: ARB_ETH_WARN,
                })}
              </p>
              {arbUsdc < MIN_DEPOSIT_USDC ? (
                <p className="mt-2 text-2xs leading-relaxed text-down">
                  {t("wallet.needUsdc", { min: MIN_DEPOSIT_USDC })}
                </p>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t("wallet.maxPh", { amount: money(arbUsdc) })}
                    className="h-11 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 px-3"
                    onClick={() => setAmount(trimAmount(arbUsdc))}
                  >
                    {t("wallet.max")}
                  </Button>
                </div>
              )}
              {wallet && wallet.arbEth < ARB_ETH_WARN && arbUsdc >= MIN_DEPOSIT_USDC ? (
                <p className="mt-2 text-2xs leading-relaxed text-down">
                  {t("wallet.needEth", { eth: compactPrice(wallet.arbEth), keep: ARB_ETH_KEEP })}
                </p>
              ) : null}
              <Button
                className="mt-2 w-full"
                disabled={busy || !canDeposit}
                onClick={() => setConfirm(true)}
              >
                {depositing ? t("wallet.depositing") : t("wallet.deposit")}
              </Button>
              {lastTx ? (
                <a
                  className="mt-2 block text-2xs text-accent underline"
                  href={`https://arbiscan.io/tx/${lastTx}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("wallet.arbScan")}
                </a>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-2xs leading-relaxed text-muted">{t("wallet.watchOnly")}</p>
          )}

          <p className="mt-2 text-2xs leading-relaxed text-subtle">
            {t("wallet.mapped", { names: Object.keys(DESK_TO_PERP).join(", ") })}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" className="flex-1" disabled={busy} onClick={() => void refresh()}>
              {busy ? "…" : t("wallet.refresh")}
            </Button>
            <Button variant="ghost" className="flex-1" onClick={disconnect}>
              {t("wallet.disconnect")}
            </Button>
          </div>
        </>
      ) : (
        <>
          <Button className="mt-3 w-full" disabled={busy} onClick={() => void connectMetaMask()}>
            {busy ? t("wallet.connecting") : t("wallet.connect")}
          </Button>
          <p className="mt-1.5 text-2xs leading-relaxed text-subtle">{t("wallet.connectHint")}</p>
          <form onSubmit={onWatch} className="mt-2 flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("wallet.watchPh")}
              autoComplete="off"
              spellCheck={false}
              className="h-11 font-mono text-xs"
            />
            <Button type="submit" variant="secondary" disabled={busy || !draft.trim()} className="shrink-0 px-4">
              {t("wallet.watch")}
            </Button>
          </form>
        </>
      )}
      {error ? <p className="mt-2 text-2xs leading-relaxed text-down">{error}</p> : null}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("wallet.sendReal")}</DialogTitle>
            <DialogDescription>
              {t("wallet.sendRealBody", { amount: money(parsed || 0), min: MIN_DEPOSIT_USDC })}
            </DialogDescription>
          </DialogHeader>
          <Button
            className="mt-4 w-full"
            disabled={depositing}
            onClick={() => {
              setConfirm(false);
              void deposit(parsed);
            }}
          >
            {t("wallet.signMm")}
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function trimAmount(n: number) {
  return (Math.floor(n * 1e6) / 1e6).toString();
}

function gasLabel(eth: number | null) {
  if (!eth || !Number.isFinite(eth) || eth <= 0) return "0.00002";
  if (eth >= 0.0001) return eth.toFixed(5);
  return eth.toFixed(6);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface px-3 py-2">
      <div className="text-2xs font-medium tracking-wide text-subtle uppercase">{label}</div>
      <div className="mt-0.5 font-mono text-sm tabular-nums">{value}</div>
    </div>
  );
}
