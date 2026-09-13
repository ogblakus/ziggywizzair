import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { compactPrice, qtyFmt } from "@/lib/format";
import { isLot } from "@/lib/market/universe";
import { liveProposal, proposalMsLeft, PROPOSAL_TTL_MS } from "@/lib/desk/proposal";
import { useDesk } from "@/lib/desk-store";
import { useTradingMode } from "@/lib/trading-mode";
import { txError, useT } from "@/lib/i18n";
import { assetLabel } from "@/lib/i18n/labels";

function clock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function ProposalBanner() {
  const raw = useDesk((s) => s.proposal);
  const executeProposal = useDesk((s) => s.executeProposal);
  const dismissProposal = useDesk((s) => s.dismissProposal);
  const mode = useTradingMode((s) => s.mode);
  const t = useT();
  const [now, setNow] = useState(() => Date.now());

  const proposal = liveProposal(raw, now);
  const left = proposal ? proposalMsLeft(proposal, now) : 0;

  useEffect(() => {
    if (!raw) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [raw]);

  useEffect(() => {
    if (raw && !proposal) dismissProposal();
  }, [raw, proposal, dismissProposal]);

  if (!proposal) return null;

  function fill() {
    const res = executeProposal();
    if (!res.ok) toast.error(txError(res.error));
    else toast.success(t("floor.filled"));
  }

  const mins = Math.round(PROPOSAL_TTL_MS / 60_000);

  return (
    <div className="shrink-0 border-b border-up/30 bg-up/10 px-3 py-2.5 sm:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <p className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("floor.proposed")}</p>
          <p className="mt-0.5 font-mono text-sm tabular-nums text-fg">
            {proposal.side.toUpperCase()} {qtyFmt(proposal.qty, isLot(proposal.symbol))} {assetLabel(proposal.symbol)}
            {proposal.limitPx ? ` · ${t("floor.limitAt", { px: compactPrice(proposal.limitPx) })}` : ""}
          </p>
          <p className="mt-0.5 text-2xs leading-relaxed text-muted">{proposal.rationale}</p>
          <p className="mt-1 text-2xs tabular-nums text-subtle">
            {t("floor.ticketTtl", { m: mins, left: clock(left) })}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5 sm:flex-col">
          <Button className="h-11 flex-1 sm:h-9 sm:flex-none" size="sm" onClick={fill} disabled={mode === "live"}>
            {t("floor.place")}
          </Button>
          <Button className="h-11 flex-1 sm:h-9 sm:flex-none" size="sm" variant="ghost" onClick={dismissProposal}>
            {t("floor.dismiss")}
          </Button>
        </div>
      </div>
      {mode === "live" ? (
        <p className="mt-1.5 text-2xs leading-relaxed text-muted">{t("floor.ticketDemoOnly")}</p>
      ) : null}
    </div>
  );
}
