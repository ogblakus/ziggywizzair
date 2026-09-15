import { useEffect, useRef, useState, type FormEvent } from "react";
import { AgentDesk } from "@/components/desk/agent-desk";
import { DecisionEngineCard, PaperTicketCard } from "@/components/desk/decision-card";
import { FloorControls } from "@/components/desk/autopilot-switch";
import { TapePanel } from "@/components/desk/tape-panel";
import { ResearchLab } from "@/components/desk/research-lab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENT_BY_ID, type AgentId } from "@/lib/agents/personas";
import { assetLabel } from "@/lib/i18n/labels";
import { useDesk } from "@/lib/desk-store";
import { useT } from "@/lib/i18n";

type FloorPane = "agents" | "tape" | "lab";

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
            {t("desk.agents")}
          </TabsTrigger>
          <TabsTrigger value="tape" className="text-2xs sm:text-sm">
            {t("floor.tape")}
          </TabsTrigger>
          <TabsTrigger value="lab" className="text-2xs sm:text-sm">
            {t("desk.lab")}
          </TabsTrigger>
        </TabsList>
        <div className="min-h-0 flex-1 overflow-hidden">
          {pane === "agents" ? (
            <AgentsPane onConvene={onConvene} />
          ) : pane === "tape" ? (
            <TapePanel />
          ) : (
            <ResearchLab />
          )}
        </div>
      </Tabs>
    </div>
  );
}

function AgentsPane({ onConvene }: { onConvene?: () => void }) {
  const lastCouncil = useDesk((s) => s.lastCouncil);
  const t = useT();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 pb-3">
        <div className="flex min-w-0 flex-wrap items-baseline gap-2">
          <h2 className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("floor.council")}</h2>
          {lastCouncil?.engineVersion ? (
            <span className="font-mono text-2xs text-subtle">V{lastCouncil.engineVersion}</span>
          ) : (
            <span className="text-2xs text-subtle">{t("floor.idle")}</span>
          )}
        </div>
        {onConvene ? <FloorControls onConvene={onConvene} className="flex lg:hidden" /> : null}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
        <div className="space-y-2 lg:hidden">
          <DecisionEngineCard compact />
          <PaperTicketCard />
        </div>
        <AgentDesk />
      </div>
    </div>
  );
}

export function FloorDock() {
  const [pane, setPane] = useState<"tape" | "lab">("tape");
  const t = useT();
  return (
    <Tabs value={pane} onValueChange={(v) => setPane(v as "tape" | "lab")} className="flex h-full min-h-0 flex-col gap-2">
      <TabsList className="w-full shrink-0">
        <TabsTrigger value="tape" className="text-2xs sm:text-xs">
          {t("floor.tape")}
        </TabsTrigger>
        <TabsTrigger value="lab" className="text-2xs sm:text-xs">
          {t("desk.lab")}
        </TabsTrigger>
      </TabsList>
      <div className="min-h-0 flex-1 overflow-hidden">{pane === "tape" ? <TapePanel /> : <ResearchLab />}</div>
    </Tabs>
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
                      {AGENT_BY_ID[turn.speaker as AgentId]?.mark ?? "?"}
                    </div>
                    <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-elevated px-3.5 py-2.5 shadow-[var(--shadow-border)]">
                      <p className="text-2xs font-medium tracking-wide text-subtle uppercase">
                        {AGENT_BY_ID[turn.speaker as AgentId]?.name ?? turn.speaker}
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

      <div className="shrink-0 space-y-2 border-t border-border bg-bg pt-3 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] lg:pb-0">
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => void onAsk(c)}
              disabled={asking || convening}
              className="min-h-9 rounded-md bg-surface px-3 py-1.5 text-2xs text-muted hover:text-fg disabled:opacity-50"
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
            <Button type="submit" variant="secondary" disabled={asking || !q.trim()} className="h-11 shrink-0 px-4">
              {asking ? "…" : t("floor.ask")}
            </Button>
          </div>
          <p className="px-0.5 text-2xs leading-relaxed text-subtle">{t("floor.askHint")}</p>
        </form>
      </div>
    </div>
  );
}
