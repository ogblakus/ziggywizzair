import { toast } from "sonner";
import { HARD } from "@/lib/agents/core/scoring";
import { compactPrice } from "@/lib/format";
import { assetLabel } from "@/lib/i18n/labels";
import { useT, txError, type MsgKey } from "@/lib/i18n";
import { liveProposal } from "@/lib/desk/proposal";
import { useDesk } from "@/lib/desk-store";
import { useTradingMode } from "@/lib/trading-mode";
import { cn } from "@/lib/utils";

function Gate({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-0.5 text-xs">
      <span className={cn("font-mono text-2xs", ok ? "text-up" : "text-down")}>{ok ? "✓" : "✕"}</span>
      <span className="min-w-0 flex-1 text-muted">{label}</span>
      {detail ? <span className="font-mono text-2xs tabular-nums text-fg">{detail}</span> : null}
    </li>
  );
}

export function DecisionEngineCard({ compact }: { compact?: boolean }) {
  const t = useT();
  const last = useDesk((s) => s.lastCouncil);
  const view = last?.view;
  const band = view?.band ?? last?.band ?? null;
  const score = view?.score ?? last?.finalScore ?? null;
  const agree = view?.agreement ?? last?.agreement ?? null;
  const side = view?.candidate.side ?? last?.order?.side ?? null;
  const symbol = view?.candidate.symbol ?? last?.order?.symbol ?? null;
  const geo = view?.geometry;

  return (
    <section className={cn("rounded-xl bg-elevated p-3.5 shadow-[var(--shadow-border)]", compact && "p-3")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-2xs font-medium tracking-[0.16em] text-subtle uppercase">{t("desk.engine")}</p>
          <p className="mt-1 font-mono text-sm tabular-nums">
            {symbol ? `${assetLabel(symbol)}${side ? ` · ${side.toUpperCase()}` : ""}` : t("desk.noCouncil")}
          </p>
        </div>
        {band ? (
          <span className="rounded-md bg-surface px-2 py-1 font-mono text-2xs tracking-wide text-fg uppercase">
            {t(`floor.band.${band}` as MsgKey)}
          </span>
        ) : null}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-surface px-2.5 py-2">
          <dt className="text-2xs tracking-wide text-subtle uppercase">{t("desk.finalScore")}</dt>
          <dd className="mt-0.5 font-mono text-lg tabular-nums">{score != null ? score.toFixed(1) : "—"}</dd>
        </div>
        <div className="rounded-md bg-surface px-2.5 py-2">
          <dt className="text-2xs tracking-wide text-subtle uppercase">{t("desk.agreement")}</dt>
          <dd className="mt-0.5 font-mono text-lg tabular-nums">
            {agree ? t(`desk.agree.${agree.level}` as MsgKey) : "—"}
          </dd>
        </div>
      </dl>

      {view ? (
        <>
          <p className="mt-3 text-2xs font-medium tracking-[0.16em] text-subtle uppercase">{t("desk.gates")}</p>
          <ul className="mt-1">
            <Gate
              ok={view.gates.scoutScore}
              label={t("desk.gateScout")}
              detail={
                view.vesper.score != null
                  ? `${view.vesper.score.toFixed(0)} ≥ ${HARD.MIN_SCOUT_SCORE}`
                  : undefined
              }
            />
            <Gate ok={view.gates.kai} label={t("desk.gateKai")} detail={view.kai.status === "ready" ? t("desk.ready") : t("desk.wait")} />
            <Gate
              ok={view.gates.direction}
              label={t("desk.gateDir")}
              detail={view.candidate.side ? view.candidate.side.toUpperCase() : t("desk.hold")}
            />
            <Gate
              ok={view.gates.rr}
              label={t("desk.gateRr")}
              detail={geo?.valid && geo.rr != null ? `${geo.rr.toFixed(2)} ≥ ${HARD.MIN_RR.toFixed(2)}` : undefined}
            />
            <Gate ok={view.gates.portfolio} label={t("desk.gatePort")} />
          </ul>
        </>
      ) : null}

      <p className="mt-3 text-2xs font-medium tracking-[0.16em] text-subtle uppercase">{t("desk.geometry")}</p>
      {geo?.valid ? (
        <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-subtle">{t("desk.entry")}</dt>
            <dd className="font-mono tabular-nums">{compactPrice(geo.entry!)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-subtle">{t("desk.stop")}</dt>
            <dd className="font-mono tabular-nums">{compactPrice(geo.stop!)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-subtle">{t("desk.target")}</dt>
            <dd className="font-mono tabular-nums">{compactPrice(geo.target!)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-subtle">{t("desk.rr")}</dt>
            <dd className="font-mono tabular-nums">{geo.rr!.toFixed(2)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-1 text-xs text-muted">{t("desk.noGeometry")}</p>
      )}
    </section>
  );
}

export function PaperTicketCard() {
  const t = useT();
  const last = useDesk((s) => s.lastCouncil);
  const proposal = liveProposal(useDesk((s) => s.proposal));
  const working = useDesk((s) => s.working);
  const executeProposal = useDesk((s) => s.executeProposal);
  const dismissProposal = useDesk((s) => s.dismissProposal);
  const mode = useTradingMode((s) => s.mode);
  const view = last?.view;
  const order = proposal ?? last?.order ?? null;
  const geo = view?.geometry;

  function fill() {
    const res = executeProposal();
    if (!res.ok) toast.error(txError(res.error));
    else toast.success(t("floor.filled"));
  }

  return (
    <section className="rounded-xl bg-surface p-3.5 shadow-[var(--shadow-border)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-2xs font-medium tracking-[0.16em] text-subtle uppercase">{t("desk.ticket")}</p>
        <span className="rounded-md bg-elevated px-2 py-0.5 font-mono text-3xs tracking-[0.14em] text-muted uppercase">
          {t("desk.paper")}
        </span>
      </div>
      {order ? (
        <>
          <p className="mt-2 font-mono text-sm tabular-nums">
            {assetLabel(order.symbol)} · {order.side.toUpperCase()}
          </p>
          <dl className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <dt className="text-subtle">{t("desk.entry")}</dt>
              <dd className="font-mono tabular-nums">
                {order.limitPx ? compactPrice(order.limitPx) : geo?.valid && geo.entry ? compactPrice(geo.entry) : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-subtle">{t("desk.stop")}</dt>
              <dd className="font-mono tabular-nums">{geo?.valid && geo.stop ? compactPrice(geo.stop) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-subtle">{t("desk.target")}</dt>
              <dd className="font-mono tabular-nums">{geo?.valid && geo.target ? compactPrice(geo.target) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-subtle">{t("desk.rr")}</dt>
              <dd className="font-mono tabular-nums">{geo?.valid && geo.rr != null ? geo.rr.toFixed(2) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-subtle">{t("desk.size")}</dt>
              <dd className="font-mono tabular-nums">{view?.sizePct ? `${view.sizePct.toFixed(1)}%` : "—"}</dd>
            </div>
          </dl>
          {view ? (
            <p className="mt-2 font-mono text-2xs text-muted">
              VESPER {view.vesper.score != null ? view.vesper.score.toFixed(0) : "—"} · KAI{" "}
              {view.kai.status === "ready" ? t("desk.ready") : t("desk.wait")} · {t("desk.agreement")}{" "}
              {t(`desk.agree.${view.agreement.level}` as MsgKey)}
            </p>
          ) : null}
          {proposal ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-md bg-accent px-3 py-2 text-xs font-medium text-accent-fg disabled:opacity-50"
                onClick={fill}
                disabled={mode === "live"}
              >
                {t("floor.place")}
              </button>
              <button
                type="button"
                className="flex-1 rounded-md bg-elevated px-3 py-2 text-xs text-muted"
                onClick={() => dismissProposal()}
              >
                {t("floor.dismiss")}
              </button>
            </div>
          ) : null}
          {mode === "live" && proposal ? (
            <p className="mt-2 text-2xs leading-relaxed text-muted">{t("floor.liveNoPlace")}</p>
          ) : null}
        </>
      ) : (
        <p className="mt-2 text-xs text-muted">{working ? t("floor.working") : t("desk.noTicket")}</p>
      )}
      <p className="mt-2 text-2xs leading-relaxed text-subtle">{t("desk.paperNote")}</p>
    </section>
  );
}
