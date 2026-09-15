import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { kaiFace, type DeskView } from "@/lib/agents/desk-view";
import { AGENTS, type AgentId } from "@/lib/agents/personas";
import { recordsFrom } from "@/lib/agents/scorecard";
import { compactPrice } from "@/lib/format";
import { useT, type MsgKey } from "@/lib/i18n";
import { useDesk } from "@/lib/desk-store";
import { cn } from "@/lib/utils";

function SourceChip({ id }: { id: AgentId }) {
  const lastCouncil = useDesk((s) => s.lastCouncil);
  const t = useT();
  const src = lastCouncil?.status?.sources?.[id];
  if (!src || src === "llm") return null;
  return (
    <span className="ml-1.5 font-mono text-2xs uppercase tracking-wide text-subtle">
      {src === "rules" ? t("floor.sourceRules") : t("floor.sourceLocal")}
    </span>
  );
}

function Face({
  tone,
  children,
}: {
  tone: "up" | "down" | "mute" | "wait";
  children: string;
}) {
  const cls =
    tone === "up" ? "text-up" : tone === "down" ? "text-down" : tone === "wait" ? "text-fg" : "text-subtle";
  return <span className={cn("font-mono text-2xs font-medium tracking-wide uppercase", cls)}>{children}</span>;
}

function Mark({ id }: { id: AgentId }) {
  const persona = AGENTS.find((p) => p.id === id)!;
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-sm font-medium text-accent">
      {persona.mark}
    </div>
  );
}

function metricLabel(metric: string) {
  if (metric === "changePct") return "Momentum";
  if (metric === "vsSma") return "vs SMA";
  if (metric === "rvol") return "RVOL";
  if (metric === "rsi") return "RSI";
  return metric;
}

export function AgentDesk() {
  const t = useT();
  const last = useDesk((s) => s.lastCouncil);
  const agents = useDesk((s) => s.agents);
  const agentCalls = useDesk((s) => s.agentCalls);
  const recs = recordsFrom(agentCalls ?? []);
  const view = last?.view;
  const convening = useDesk((s) => s.convening);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2 px-0.5">
        <h2 className="text-2xs font-medium tracking-[0.16em] text-subtle uppercase">{t("desk.agents")}</h2>
        {last?.status?.mode === "online" ? (
          <span className="text-2xs text-up">{t("floor.aiOnline")}</span>
        ) : last?.status?.mode === "degraded" ? (
          <span className="text-2xs text-muted">{t("floor.aiDegraded")}</span>
        ) : (
          <span className="text-2xs text-subtle">{convening ? t("floor.reading") : t("floor.idle")}</span>
        )}
      </div>
      <VesperCard view={view} reading={agents.find((a) => a.id === "vesper")?.status === "reading"} rec={recs.find((r) => r.id === "vesper")} />
      <AshCard view={view} reading={agents.find((a) => a.id === "ash")?.status === "reading"} rec={recs.find((r) => r.id === "ash")} />
      <KaiCard view={view} reading={agents.find((a) => a.id === "kai")?.status === "reading"} />
      <DamianCard view={view} reading={agents.find((a) => a.id === "damian")?.status === "reading"} />
      <IrisCard view={view} reading={agents.find((a) => a.id === "iris")?.status === "reading"} />
    </div>
  );
}

function VesperCard({
  view,
  reading,
  rec,
}: {
  view?: DeskView;
  reading: boolean;
  rec?: { closed: number; wins: number; trusted: boolean };
}) {
  const t = useT();
  const v = view?.vesper;
  const dir = v?.direction ?? "hold";
  return (
    <article className="rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="flex items-start gap-2.5">
        <Mark id="vesper" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Vesper</p>
              <p className="text-2xs text-subtle">
                {t("desk.momentum")}
                <SourceChip id="vesper" />
              </p>
            </div>
            <Face tone={dir === "buy" ? "up" : dir === "sell" ? "down" : "mute"}>
              {dir === "hold" ? t("desk.hold") : `${dir.toUpperCase()}${v?.score != null ? ` · ${v.score.toFixed(0)}` : ""}`}
            </Face>
          </div>
          {v?.confidence != null ? (
            <p className="mt-1 text-2xs text-subtle">{t("desk.conf", { n: Math.round(v.confidence * 100) })}</p>
          ) : null}
          <p className={cn("mt-1.5 text-xs leading-relaxed text-muted", reading && "shimmer-text")}>
            {reading ? t("floor.reading") : v?.thesis || t("mandate.vesper")}
          </p>
          {v?.evidence.length ? (
            <ul className="mt-2 grid grid-cols-2 gap-1">
              {v.evidence.slice(0, 4).map((e) => (
                <li key={e.metric} className="rounded-md bg-surface px-2 py-1">
                  <p className="text-2xs text-subtle">{metricLabel(e.metric)}</p>
                  <p className="font-mono text-xs tabular-nums">{String(e.value)}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {rec && rec.closed >= 2 ? (
            <p className="mt-1.5 text-2xs text-subtle">{t("floor.hits", { wins: rec.wins, closed: rec.closed })}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function AshCard({
  view,
  reading,
  rec,
}: {
  view?: DeskView;
  reading: boolean;
  rec?: { closed: number; wins: number; trusted: boolean };
}) {
  const t = useT();
  const a = view?.ash;
  const dir = a?.direction ?? "hold";
  const hold = dir === "hold";
  return (
    <article className="rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="flex items-start gap-2.5">
        <Mark id="ash" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Ash</p>
              <p className="text-2xs text-subtle">
                {t("desk.reversion")}
                <SourceChip id="ash" />
              </p>
            </div>
            <Face tone={hold ? "mute" : dir === "buy" ? "up" : "down"}>
              {hold ? t("desk.hold") : `${dir.toUpperCase()}${a?.score != null ? ` · ${a.score.toFixed(0)}` : ""}`}
            </Face>
          </div>
          {a?.confidence != null ? (
            <p className="mt-1 text-2xs text-subtle">{t("desk.conf", { n: Math.round(a.confidence * 100) })}</p>
          ) : null}
          <p className={cn("mt-1.5 text-xs leading-relaxed text-muted", reading && "shimmer-text")}>
            {reading ? t("floor.reading") : hold ? t("desk.ashEmpty") : a?.thesis || t("mandate.ash")}
          </p>
          {rec && rec.closed >= 2 ? (
            <p className="mt-1.5 text-2xs text-subtle">{t("floor.hits", { wins: rec.wins, closed: rec.closed })}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function KaiCard({ view, reading }: { view?: DeskView; reading: boolean }) {
  const t = useT();
  const k = view?.kai;
  const face = kaiFace(k?.status ?? "none");
  const geo = k?.geometry;
  const showSide = face === "ready" && k?.side;
  return (
    <article className="rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="flex items-start gap-2.5">
        <Mark id="kai" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Kai</p>
              <p className="text-2xs text-subtle">
                {t("desk.setup")}
                <SourceChip id="kai" />
              </p>
            </div>
            <Face tone={face === "ready" ? "up" : face === "blocked" ? "down" : "wait"}>
              {face === "ready"
                ? `${t("desk.ready")}${k?.symbol ? ` · ${k.symbol}` : ""}`
                : face === "wait"
                  ? `${t("desk.wait")}${k?.symbol ? ` · ${k.symbol}` : ""}`
                  : face === "blocked"
                    ? t("desk.blocked")
                    : t("desk.noTrade")}
            </Face>
          </div>
          {showSide ? (
            <p className="mt-1 font-mono text-2xs text-muted">
              {k.side!.toUpperCase()}
              {k.setupType ? ` · ${k.timeframe ?? "15m"} ${k.setupType}` : ""}
            </p>
          ) : (
            <p className="mt-1 font-mono text-2xs text-subtle">{t("desk.hold")}</p>
          )}
          <p className={cn("mt-1.5 text-xs leading-relaxed text-muted", reading && "shimmer-text")}>
            {reading ? t("floor.reading") : k?.reason || t("mandate.kai")}
          </p>
          {face === "ready" && geo?.valid ? (
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
              <div className="flex justify-between gap-2">
                <dt className="text-subtle">{t("desk.entry")}</dt>
                <dd className="font-mono">{compactPrice(geo.entry!)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-subtle">{t("desk.stop")}</dt>
                <dd className="font-mono">{compactPrice(geo.stop!)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-subtle">{t("desk.target")}</dt>
                <dd className="font-mono">{compactPrice(geo.target!)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-subtle">{t("desk.rr")}</dt>
                <dd className="font-mono">{geo.rr!.toFixed(2)}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function DamianCard({ view, reading }: { view?: DeskView; reading: boolean }) {
  const t = useT();
  const last = useDesk((s) => s.lastCouncil);
  const d = view?.damian;
  const regime = d?.regime ?? (last?.mood === "risk-on" ? "risk_on" : last?.mood === "risk-off" ? "risk_off" : "cautious");
  const sectors = (d?.sectors ?? last?.sentiment?.sectors ?? []).filter((s) => s.id === "crypto" || s.id === "equities" || s.id === "metals");
  const wind =
    regime === "risk_on" ? t("desk.tailwind") : regime === "risk_off" ? t("desk.headwind") : t("desk.neutral");
  return (
    <article className="rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="flex items-start gap-2.5">
        <Mark id="damian" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Damian</p>
              <p className="text-2xs text-subtle">
                {t("desk.regime")}
                <SourceChip id="damian" />
              </p>
            </div>
            <Face tone={regime === "risk_on" ? "up" : regime === "risk_off" ? "down" : "mute"}>
              {regime === "risk_on" ? t("desk.riskOn") : regime === "risk_off" ? t("desk.riskOff") : t("desk.cautious")}
            </Face>
          </div>
          <p className={cn("mt-1.5 text-xs leading-relaxed text-muted", reading && "shimmer-text")}>
            {reading ? t("floor.reading") : d?.summary || last?.sentiment?.summary || t("mandate.damian")}
          </p>
          {sectors.length ? (
            <ul className="mt-2 space-y-1">
              {sectors.map((s) => {
                const score = "score" in s && typeof s.score === "number" ? s.score : null;
                const Icon = s.stance === "bullish" ? ArrowUpRight : s.stance === "bearish" ? ArrowDownRight : Minus;
                return (
                  <li key={s.id} className="flex items-center justify-between gap-2 rounded-md bg-surface px-2 py-1">
                    <span className="text-2xs text-muted">{t(`sector.${s.id}` as MsgKey)}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-2xs tabular-nums">
                      {score != null ? (score >= 0 ? `+${score.toFixed(0)}` : score.toFixed(0)) : s.stance}
                      <Icon className={cn("size-3", s.stance === "bullish" ? "text-up" : s.stance === "bearish" ? "text-down" : "text-subtle")} />
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <p className="mt-2 text-2xs tracking-wide text-subtle uppercase">{wind}</p>
        </div>
      </div>
    </article>
  );
}

function IrisCard({ view, reading }: { view?: DeskView; reading: boolean }) {
  const t = useT();
  const iris = view?.iris;
  const decision = iris?.decision ?? "wait";
  const checks: Array<{ ok: boolean; label: string }> = iris
    ? [
        { ok: iris.checks.drawdown, label: t("desk.checkDd") },
        { ok: iris.checks.openLegLimit, label: t("desk.checkLegs") },
        { ok: iris.checks.teamLock, label: t("desk.checkLock") },
        { ok: iris.checks.liquidity, label: t("desk.checkLiq") },
      ]
    : [];
  const face =
    decision === "approve" ? t("desk.approve") : decision === "reduce" ? t("desk.reduce") : decision === "reject" ? t("desk.reject") : t("desk.wait");
  return (
    <article className="rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="flex items-start gap-2.5">
        <Mark id="iris" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Iris</p>
              <p className="text-2xs text-subtle">
                {t("desk.riskChair")}
                <SourceChip id="iris" />
              </p>
            </div>
            <Face tone={decision === "approve" || decision === "reduce" ? "up" : decision === "reject" ? "down" : "wait"}>{face}</Face>
          </div>
          {iris ? (
            <p className="mt-1 font-mono text-2xs text-muted">
              {t("desk.size")} {iris.sizePct.toFixed(1)}%
            </p>
          ) : null}
          <p className={cn("mt-1.5 text-xs leading-relaxed text-muted", reading && "shimmer-text")}>
            {reading ? t("floor.reading") : iris?.reason || t("mandate.iris")}
          </p>
          {checks.length ? (
            <ul className="mt-2 space-y-0.5">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-2xs">
                  <span className={c.ok ? "text-up" : "text-down"}>{c.ok ? "✓" : "✕"}</span>
                  <span className="text-muted">{c.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}
