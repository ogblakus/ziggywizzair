import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Minus, ArrowDownRight } from "lucide-react";
import { toast } from "sonner";
import { TapePanel } from "@/components/desk/tape-panel";
import { FloorControls } from "@/components/desk/autopilot-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENTS, AGENT_BY_ID, type Vote } from "@/lib/agents/personas";
import { recordsFrom } from "@/lib/agents/scorecard";
import { compactPrice, qtyFmt } from "@/lib/format";
import { sentimentBias } from "@/lib/market/macro";
import { isLot } from "@/lib/market/universe";
import { useDesk } from "@/lib/desk-store";
import { cn } from "@/lib/utils";
import { assetLabel } from "@/lib/i18n/labels";
import { useT, txError, type MsgKey } from "@/lib/i18n";
import { useTradingMode } from "@/lib/trading-mode";
import { liveProposal } from "@/lib/desk/proposal";

type FloorPane = "agents" | "tape";

export function CouncilPanel({ onConvene }: { onConvene?: () => void }) {
  const [pane, setPane] = useState<FloorPane>("agents");
  const t = useT();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Tabs
        value={pane}
        onValueChange={(v) => setPane(v as FloorPane)}
        className="flex h-full min-h-0 flex-col gap-2"
      >
        <TabsList className="w-full shrink-0">
          <TabsTrigger value="agents" className="text-2xs sm:text-sm">
            {t("floor.agents")}
          </TabsTrigger>
          <TabsTrigger value="tape" className="text-2xs sm:text-sm">
            {t("floor.tape")}
          </TabsTrigger>
        </TabsList>
        <div className="min-h-0 flex-1 overflow-hidden">
          {pane === "agents" ? <AgentsPane onConvene={onConvene} /> : <TapePanel />}
        </div>
      </Tabs>
    </div>
  );
}

function AgentsPane({ onConvene }: { onConvene?: () => void }) {
  const agents = useDesk((s) => s.agents);
  const lastCouncil = useDesk((s) => s.lastCouncil);
  const agentCalls = useDesk((s) => s.agentCalls);
  const proposal = liveProposal(useDesk((s) => s.proposal));
  const working = useDesk((s) => s.working);
  const executeProposal = useDesk((s) => s.executeProposal);
  const dismissProposal = useDesk((s) => s.dismissProposal);
  const mode = useTradingMode((s) => s.mode);
  const recs = recordsFrom(agentCalls ?? []);
  const t = useT();

  function fill() {
    const res = executeProposal();
    if (!res.ok) toast.error(txError(res.error));
    else toast.success(t("floor.filled"));
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 pb-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("floor.council")}</h2>
          {lastCouncil ? (
            <Badge
              variant={
                lastCouncil.mood === "risk-off"
                  ? "down"
                  : lastCouncil.mood === "risk-on"
                    ? "up"
                    : "default"
              }
            >
              {t(`mood.${lastCouncil.mood}` as MsgKey)}
            </Badge>
          ) : (
            <span className="text-2xs text-subtle">{t("floor.idle")}</span>
          )}
        </div>
        {onConvene ? <FloorControls onConvene={onConvene} className="lg:hidden" /> : null}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
        <DamianCard />

        <p className="px-0.5 text-2xs font-medium tracking-wide text-subtle uppercase">{t("floor.specialists")}</p>
        <ul className="space-y-2">
          {AGENTS.filter((p) => p.id === "vesper" || p.id === "ash" || p.id === "kai").map((persona) => {
            const speech = agents.find((a) => a.id === persona.id);
            const reading = speech?.status === "reading";
            const rec = recs.find((r) => r.id === persona.id);
            return (
              <li key={persona.id} className="rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]">
                <div className="flex items-start gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-xs font-medium text-accent">
                    {persona.mark}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">{persona.name}</div>
                        <div className="text-2xs text-subtle">
                          {t(`role.${persona.id}` as MsgKey)}
                          {rec ? (
                            <span className="ml-1.5 text-muted">
                              {rec.closed >= 2
                                ? t("floor.hits", { wins: rec.wins, closed: rec.closed })
                                : t("floor.hitsSoon")}
                              {!rec.trusted ? ` · ${t("floor.cold")}` : ""}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {speech ? <VoteChip vote={speech.vote} symbol={speech.symbol} /> : null}
                    </div>
                    <p
                      className={cn(
                        "mt-1.5 text-xs leading-relaxed text-muted",
                        reading && "shimmer-text",
                      )}
                    >
                      {reading
                        ? t("floor.reading")
                        : lastCouncil
                          ? (speech?.thesis ?? t(`mandate.${persona.id}` as MsgKey))
                          : t(`mandate.${persona.id}` as MsgKey)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {(() => {
          const persona = AGENTS.find((p) => p.id === "iris")!;
          const speech = agents.find((a) => a.id === "iris");
          const reading = speech?.status === "reading";
          return (
            <div className="rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]">
              <div className="flex items-start gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-xs font-medium text-accent">
                  {persona.mark}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{persona.name}</div>
                      <div className="text-2xs text-subtle">{t("role.iris")}</div>
                    </div>
                    {speech ? <VoteChip vote={speech.vote} symbol={speech.symbol} /> : null}
                  </div>
                  <p className={cn("mt-1.5 text-xs leading-relaxed text-muted", reading && "shimmer-text")}>
                    {reading
                      ? t("floor.reading")
                      : lastCouncil
                        ? (speech?.thesis ?? t("mandate.iris"))
                        : t("mandate.iris")}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {proposal ? (
          <div className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]">
            <div className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("floor.proposed")}</div>
            <div className="mt-1 font-mono text-sm tabular-nums">
              {proposal.side.toUpperCase()} {qtyFmt(proposal.qty, isLot(proposal.symbol))}{" "}
              {assetLabel(proposal.symbol)}
              {proposal.limitPx ? ` · ${t("floor.limitAt", { px: compactPrice(proposal.limitPx) })}` : ""}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted">{proposal.rationale}</p>
            <div className="mt-3 flex gap-2">
              <Button className="flex-1" size="sm" onClick={fill} disabled={mode === "live"}>
                {t("floor.place")}
              </Button>
              <Button className="flex-1" size="sm" variant="ghost" onClick={dismissProposal}>
                {t("floor.dismiss")}
              </Button>
            </div>
            {mode === "live" ? (
              <p className="mt-2 text-2xs leading-relaxed text-muted">{t("floor.liveNoPlace")}</p>
            ) : null}
          </div>
        ) : null}
        {working ? (
          <div className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]">
            <div className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("floor.working")}</div>
            <div className="mt-1 font-mono text-sm tabular-nums">
              {working.side.toUpperCase()} {qtyFmt(working.qty, isLot(working.symbol))} {assetLabel(working.symbol)}
              {working.limitPx ? ` · ${t("floor.limitAt", { px: compactPrice(working.limitPx) })}` : ""}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted">{working.rationale}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ChatPane({ onAsk }: { onAsk: (q: string) => Promise<void> }) {
  const asking = useDesk((s) => s.asking);
  const pendingAsk = useDesk((s) => s.pendingAsk);
  const convening = useDesk((s) => s.convening);
  const lastAsk = useDesk((s) => s.lastAsk);
  const selected = useDesk((s) => s.selected);
  const positions = useDesk((s) => s.positions);
  const [q, setQ] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const t = useT();

  const thread = (lastAsk?.log?.length
    ? lastAsk.log
    : lastAsk
      ? [{ question: lastAsk.question, speaker: lastAsk.speaker, text: lastAsk.text, ts: lastAsk.ts }]
      : []
  ).filter((turn) => typeof turn.ts === "number" && Date.now() - turn.ts < 24 * 60 * 60 * 1000);
  const lastQ = thread[thread.length - 1]?.question;
  const waiting = Boolean(asking && pendingAsk && pendingAsk !== lastQ);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [thread.length, waiting, lastAsk?.text]);

  const chips = [
    t("floor.chipTell", { symbol: assetLabel(selected) }),
    positions[0] ? t("floor.chipClose", { symbol: assetLabel(positions[0].symbol) }) : t("floor.chipProbe", { symbol: assetLabel(selected) }),
    t("floor.chipWire"),
  ];

  async function submitAsk(e: FormEvent) {
    e.preventDefault();
    const text = q.trim();
    if (!text) return;
    setQ("");
    await onAsk(text);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0.5 pr-1">
        {thread.length === 0 && !waiting ? (
          <p className="px-1 pt-3 text-sm leading-relaxed text-muted">{t("floor.askEmpty")}</p>
        ) : (
          <div className="space-y-4 pb-3 pt-1">
            {thread.map((turn, i) => {
              const paras = turn.text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
              return (
                <div key={`${turn.question}-${i}`} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-br-md bg-accent/15 px-3.5 py-2.5">
                      <p className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("floor.you")}</p>
                      <p className="mt-1 text-sm leading-relaxed text-fg">{turn.question}</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-xs font-medium text-accent">
                      {AGENT_BY_ID[turn.speaker]?.mark ?? "?"}
                    </div>
                    <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-elevated px-3.5 py-2.5 shadow-[var(--shadow-border)]">
                      <p className="text-2xs font-medium tracking-wide text-subtle uppercase">
                        {AGENT_BY_ID[turn.speaker]?.name ?? turn.speaker}
                      </p>
                      {paras.map((p, j) => (
                        <p key={j} className="mt-1.5 text-sm leading-relaxed text-fg">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            {waiting ? (
              <div className="space-y-2">
                <div className="flex justify-end">
                  <div className="max-w-[88%] rounded-2xl rounded-br-md bg-accent/15 px-3.5 py-2.5">
                    <p className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("floor.you")}</p>
                    <p className="mt-1 text-sm leading-relaxed text-fg">{pendingAsk}</p>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <div className="mb-1 size-8 shrink-0 rounded-md bg-surface" />
                  <div className="rounded-2xl rounded-bl-md bg-elevated px-3.5 py-2.5 text-muted">
                    <span className="typing-dots" aria-hidden>
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="shrink-0 space-y-2 border-t border-border pt-3">
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => void onAsk(c)}
              disabled={asking || convening}
              className="rounded-md bg-surface px-2 py-1 text-2xs text-muted hover:text-fg disabled:opacity-50"
            >
              {c}
            </button>
          ))}
        </div>
        <form onSubmit={submitAsk} className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("floor.askPh")}
              disabled={asking}
              className="h-11"
            />
            <Button type="submit" variant="secondary" disabled={asking || !q.trim()} className="px-4">
              {asking ? "…" : t("floor.ask")}
            </Button>
          </div>
          <p className="px-0.5 text-2xs leading-relaxed text-subtle">
            {t("floor.askHint")}
          </p>
        </form>
      </div>
    </div>
  );
}

function DamianCard() {
  const t = useT();
  const lastCouncil = useDesk((s) => s.lastCouncil);
  const agents = useDesk((s) => s.agents);
  const macro = useDesk((s) => s.macro);
  const speech = agents.find((a) => a.id === "damian");
  const reading = speech?.status === "reading";
  const report = lastCouncil?.sentiment;
  const sectors = report?.sectors ?? [];
  const thesis = report?.summary ?? speech?.thesis ?? t("mandate.damian");
  const bias = sentimentBias(sectors);
  const fill = Math.min(100, Math.max(8, (bias + 1) * 50));

  return (
    <div className="rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-xs font-medium text-accent">
          D
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">Damian Kaczmarski</div>
          <div className="text-2xs text-subtle">{t("floor.sentiment")}</div>
          <p className={cn("mt-1.5 text-xs leading-relaxed text-muted", reading && "shimmer-text")}>
            {reading ? t("floor.reading") : thesis}
          </p>
          <div className="relative mt-2.5 h-2.5 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full"
              style={{
                width: `${fill}%`,
                background: "linear-gradient(90deg, #c45c5c 0%, #c4a05c 42%, #3d9a7a 100%)",
              }}
            />
            <div
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-fg bg-surface"
              style={{ left: `${fill}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-2xs text-subtle">
            <span className="inline-flex items-center gap-0.5 text-down">
              <ArrowDownRight className="size-3" />
            </span>
            <span className="inline-flex items-center gap-0.5 text-up">
              <ArrowUpRight className="size-3" />
            </span>
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-1.5">
            <div className="rounded-md bg-surface px-2 py-1.5">
              <dt className="text-2xs text-subtle">{t("sector.dollar")}</dt>
              <dd className="font-mono text-xs tabular-nums">
                {macro?.dxy != null ? macro.dxy.toFixed(2) : "—"}
                {macro?.dxyChg != null ? (
                  <span className={macro.dxyChg >= 0 ? " text-up" : " text-down"}>
                    {" "}
                    {macro.dxyChg >= 0 ? "+" : ""}
                    {macro.dxyChg.toFixed(2)}%
                  </span>
                ) : null}
              </dd>
            </div>
            <div className="rounded-md bg-surface px-2 py-1.5">
              <dt className="text-2xs text-subtle">{t("sector.vol")}</dt>
              <dd className="font-mono text-xs tabular-nums">
                {macro?.vix != null ? macro.vix.toFixed(1) : "—"}
                {macro?.vixChg != null ? (
                  <span className={macro.vixChg >= 0 ? " text-down" : " text-up"}>
                    {" "}
                    {macro.vixChg >= 0 ? "+" : ""}
                    {macro.vixChg.toFixed(2)}%
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>
          {sectors.length ? (
            <ul className="mt-2 space-y-1">
              {sectors.map((row) => {
                const Icon =
                  row.stance === "bullish" ? ArrowUpRight : row.stance === "bearish" ? ArrowDownRight : Minus;
                const tone =
                  row.stance === "bullish" ? "text-up" : row.stance === "bearish" ? "text-down" : "text-subtle";
                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-2 rounded-md bg-surface px-2 py-1.5"
                  >
                    <span className="text-xs text-fg">{t(`sector.${row.id}`)}</span>
                    <Icon className={cn("size-3.5 shrink-0", tone)} aria-hidden />
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function VoteChip({ vote, symbol }: { vote: Vote; symbol: string | null }) {
  const t = useT();
  if (vote === "hold") {
    return (
      <span className="inline-flex items-center gap-1 text-2xs font-medium text-subtle">
        <Minus className="size-3" />
        {t("floor.hold")}
      </span>
    );
  }
  const Icon = vote === "buy" ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-2xs font-medium tabular-nums",
        vote === "buy" ? "text-up" : "text-down",
      )}
    >
      <Icon className="size-3" />
      {vote === "buy" ? t("ticket.buyCap") : t("ticket.sellCap")}
      {symbol ? ` ${assetLabel(symbol)}` : ""}
    </span>
  );
}
