import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BarChart3, Briefcase, History, MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";
import { bootSplashHolding, markBootSplash, TakeoffSplash } from "@/components/desk/brand";
import { DeskTour } from "@/components/desk/desk-tour";
import { MarketDesk } from "@/components/desk/chart-panel";
import { CouncilPanel, ChatPane } from "@/components/desk/council-panel";
import { DeskHeader } from "@/components/desk/header";
import { HistoryPanel } from "@/components/desk/history-panel";
import { OpenedStrip } from "@/components/desk/opened-trades";
import { ProposalBanner } from "@/components/desk/proposal-banner";
import { PortfolioPanel } from "@/components/desk/portfolio-panel";
import { TapePanel } from "@/components/desk/tape-panel";
import { TickerStrip, Watchlist } from "@/components/desk/watchlist";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENTS, AGENT_BY_ID } from "@/lib/agents/personas";
import { localAsk, localCouncil } from "@/lib/agents/local-council";
import { askFloor, conveneCouncil } from "@/lib/ai/council";
import { leaveDeskBook, loadDeskBook, saveDeskBook } from "@/lib/desk/book-server";
import { bookLooksLive } from "@/lib/desk/engine";
import { fetchLiveMarket, fetchLiveMids, type LiveMarketResult } from "@/lib/market/quotes";
import { fetchLiveNews } from "@/lib/market/news";
import { fetchLiveMacro } from "@/lib/market/macro";
import { newsOverlap } from "@/lib/market/news-key";
import { installBootQuotes, liveAssets, preferServerBook, toDeskBook, useDesk, useFeed, bindDeskStorage } from "@/lib/desk-store";
import { bindTradingMode, useTradingMode } from "@/lib/trading-mode";
import { useMarks } from "@/lib/marks-store";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/lib/i18n";

type MobileTab = "market" | "portfolio" | "history" | "floor" | "chat";

function subscribeLg(cb: () => void) {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function useDesktop() {
  return useSyncExternalStore(
    subscribeLg,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

let bootPromise: Promise<void> | null = null;
let bootFor: string | null = null;

function bookChanged(
  a: ReturnType<typeof useDesk.getState>,
  b: ReturnType<typeof useDesk.getState>,
) {
  return (
    a.cash !== b.cash ||
    a.positions !== b.positions ||
    a.fills !== b.fills ||
    a.closedTrades !== b.closedTrades ||
    a.autopilot !== b.autopilot ||
    a.lastCouncil !== b.lastCouncil ||
    a.lastAsk !== b.lastAsk ||
    a.proposal !== b.proposal ||
    a.fillSeq !== b.fillSeq ||
    a.deskEpoch !== b.deskEpoch
  );
}

export function DeskApp({ boot }: { boot: LiveMarketResult }) {
  if (boot.ok) installBootQuotes(boot.quotes);

  const hydrated = useDesk((s) => s.hydrated);
  const markHydrated = useDesk((s) => s.markHydrated);
  const applyLiveQuotes = useDesk((s) => s.applyLiveQuotes);
  const applyLiveMids = useDesk((s) => s.applyLiveMids);
  const applyHeadlines = useDesk((s) => s.applyHeadlines);
  const applyMacro = useDesk((s) => s.applyMacro);
  const setFeed = useDesk((s) => s.setFeed);
  const snapshot = useDesk((s) => s.snapshot);
  const setConvening = useDesk((s) => s.setConvening);
  const setAsking = useDesk((s) => s.setAsking);
  const applyCouncil = useDesk((s) => s.applyCouncil);
  const answerAsk = useDesk((s) => s.answerAsk);
  const setAgentStatus = useDesk((s) => s.setAgentStatus);
  const unveilAgent = useDesk((s) => s.unveilAgent);
  const convening = useDesk((s) => s.convening);
  const autopilot = useDesk((s) => s.autopilot);
  const selected = useDesk((s) => s.selected);
  const feed = useFeed();
  const user = useCurrentUser();
  const t = useT();
  const locale = useLocale();
  const mode = useTradingMode((s) => s.mode);
  const [tab, setTab] = useState<MobileTab>("market");
  const [side, setSide] = useState<"floor" | "portfolio" | "history" | "chat">("floor");
  const [bootHold, setBootHold] = useState(true);
  const [modeFlash, setModeFlash] = useState<"demo" | "live" | null>(null);
  const prevMode = useRef(mode);
  const desktop = useDesktop();
  const synced = useRef(false);
  const saving = useRef(false);
  const syncing = useRef(false);

  useEffect(() => {
    markBootSplash();
    const pulse = window.setInterval(() => {
      const s = useDesk.getState();
      setBootHold(bootSplashHolding(s.hydrated, s.feed));
    }, 250);
    return () => window.clearInterval(pulse);
  }, []);

  useEffect(() => {
    if (prevMode.current === mode) return;
    prevMode.current = mode;
    setModeFlash(mode);
    const id = window.setTimeout(() => setModeFlash(null), 1_550);
    return () => window.clearTimeout(id);
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get("decide") === "1") {
        setTab("floor");
        setSide("floor");
        if (useTradingMode.getState().mode !== "demo") {
          useTradingMode.getState().setMode("demo");
        }
        const url = new URL(window.location.href);
        url.searchParams.delete("decide");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (mode !== "live") return;
    useDesk.getState().setAutopilot(false);
  }, [mode]);

  useEffect(() => {
    if (!user) return;
    let live = true;
    void fetchLiveMarket()
      .then((res) => {
        if (!live) return;
        if (res.ok) applyLiveQuotes(res.quotes);
        else setFeed("stale");
      })
      .catch(() => {
        if (live) setFeed("stale");
      });
    if (bootFor !== user.id) {
      bootFor = user.id;
      bindDeskStorage(user.id);
      bindTradingMode(user.id);
      bootPromise = Promise.resolve()
        .then(() => Promise.all([useDesk.persist.rehydrate(), useTradingMode.persist.rehydrate()]))
        .then(() => undefined)
        .catch(() => undefined);
    }
    void bootPromise?.then(() => {
      if (!live) return;
      markHydrated();
      if (boot.ok) applyLiveQuotes(boot.quotes);
      void syncBook(live);
      window.setTimeout(() => {
        if (live && document.visibilityState === "visible") void syncBook(live);
      }, 2500);
    });
    return () => {
      live = false;
    };
    // Boot once per signed-in user — remount rehydrate was wiping a live book.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function syncBook(live = true) {
    if (syncing.current) return;
    syncing.current = true;
    let ok = false;
    try {
      const res = await Promise.race([
        loadDeskBook(),
        new Promise<never>((_, reject) =>
          window.setTimeout(() => reject(new Error("desk sync timeout")), 4_000),
        ),
      ]);
      if (!live) return;
      const server = res.book;
      const local = toDeskBook(useDesk.getState());
      if (preferServerBook(server, local)) {
        useDesk.getState().hydrateBook(server);
      } else if (bookLooksLive(local)) {
        await saveDeskBook({ data: local });
      }
      ok = true;
    } catch {
      /* local cache still holds the book */
    } finally {
      syncing.current = false;
      const localLive = bookLooksLive(toDeskBook(useDesk.getState()));
      synced.current = ok || localLive;
    }
  }

  useEffect(() => {
    if (!hydrated) return;
    let timer = 0;
    const unsub = useDesk.subscribe((state, prev) => {
      if (!synced.current) return;
      if (!bookChanged(state, prev)) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (saving.current) return;
        saving.current = true;
        const book = toDeskBook(useDesk.getState());
        void saveDeskBook({ data: book })
          .then((res) => {
            if (!res.accepted && res.book && preferServerBook(res.book, book)) {
              useDesk.getState().hydrateBook(res.book);
            }
          })
          .catch(() => undefined)
          .finally(() => {
            saving.current = false;
          });
      }, 700);
    });
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const beat = window.setInterval(() => {
      if (document.hidden || !synced.current) return;
      useDesk.getState().touchTick();
      void saveDeskBook({ data: toDeskBook(useDesk.getState()) }).catch(() => undefined);
    }, 20_000);
    const markAway = () => {
      if (!synced.current) return;
      void leaveDeskBook().catch(() => undefined);
    };
    const onVis = () => {
      if (document.visibilityState === "visible") void syncBook(true);
      else markAway();
    };
    const onHide = () => markAway();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onHide);
    return () => {
      window.clearInterval(beat);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onHide);
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    let live = true;
    let inFlight = false;
    async function pull() {
      if (inFlight || document.hidden) return;
      inFlight = true;
      try {
        const res = await fetchLiveMarket();
        if (!live) return;
        if (res.ok) applyLiveQuotes(res.quotes);
        else setFeed("stale");
      } catch {
        if (live) setFeed("stale");
      } finally {
        inFlight = false;
      }
    }
    void pull();
    const id = window.setInterval(() => void pull(), 12_000);
    const onVis = () => {
      if (document.visibilityState === "visible") void pull();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      live = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [hydrated, applyLiveQuotes, setFeed]);

  useEffect(() => {
    if (!hydrated) return;
    let live = true;
    let inFlight = false;
    async function pullMids() {
      if (inFlight || document.hidden) return;
      inFlight = true;
      try {
        const res = await fetchLiveMids();
        if (!live) return;
        if (res.ok) applyLiveMids(res.mids);
      } catch {
        /* last mid still on the board */
      } finally {
        inFlight = false;
      }
    }
    void pullMids();
    const id = window.setInterval(() => void pullMids(), 800);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, [hydrated, applyLiveMids]);

  useEffect(() => {
    if (!hydrated) return;
    let live = true;
    let inFlight = false;
    async function pullWire() {
      if (inFlight || document.hidden) return;
      inFlight = true;
      try {
        const [news, macro] = await Promise.all([fetchLiveNews(), fetchLiveMacro()]);
        if (!live) return;
        if (news.ok) applyHeadlines(news.headlines);
        if (macro.ok) applyMacro(macro.macro);
      } catch {
        /* tape still has last wire */
      } finally {
        inFlight = false;
      }
    }
    void pullWire();
    const id = window.setInterval(() => void pullWire(), 60_000);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, [hydrated, applyHeadlines, applyMacro]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (useDesk.getState().paused) return;
      useMarks.getState().tick(liveAssets());
    }, 400);
    return () => window.clearInterval(id);
  }, []);

  async function convene() {
    if (convening) return;
    setConvening(true);
    for (const a of AGENTS) setAgentStatus(a.id, "reading");
    const snap = snapshot();
    const last = useDesk.getState().lastCouncil;
    const selected = useDesk.getState().selected;
    let result;
    let source: "ai" | "local" = "ai";
    const lastDamian = last?.agents.find((a) => a.id === "damian")?.thesis;
    const seenNews = [
      ...useDesk
        .getState()
        .tape.filter((row) => row.kind === "news" || row.agentId === "damian")
        .map((row) => row.text),
      ...(lastDamian ? [lastDamian] : []),
    ];
    try {
      const res = await conveneCouncil({ data: { snap, last, selected, locale } });
      if (res.ok) {
        result = res.result;
      } else {
        result = localCouncil(snap, last, locale, seenNews);
        source = "local";
      }
    } catch {
      result = localCouncil(snap, last, locale, seenNews);
      source = "local";
    }
    try {
      const speak = useDesk.getState().speak;
      for (const row of result.agents) {
        await new Promise((r) => window.setTimeout(r, 220));
        unveilAgent(row);
        if (row.id === "damian") {
          const dup = useDesk.getState().tape.some((item) => {
            if (item.kind !== "news" && item.agentId !== "damian") return false;
            return newsOverlap(item.text, row.thesis);
          });
          if (dup) continue;
        }
        speak({
          kind: "agent",
          agentId: row.id,
          symbol: row.symbol ?? undefined,
          text: row.thesis,
        });
      }
      applyCouncil(result, source, { spoken: true });
      if (result.order) toast.success(t("toast.councilClosed"));
      else toast.message(t("toast.councilLocal"));
    } catch {
      setConvening(false);
      toast.error(t("toast.councilStalled"));
    }
  }

  const conveneRef = useRef(convene);
  conveneRef.current = convene;

  useEffect(() => {
    if (!hydrated || !autopilot) return;
    let live = true;
    const kick = () => {
      const s = useDesk.getState();
      if (!live || !s.autopilot || s.paused || s.convening) return;
      if (useTradingMode.getState().mode === "live") return;
      if (Date.now() - s.lastAutoAt < 90_000 && s.lastCouncil) return;
      void conveneRef.current();
    };
    const soon = window.setTimeout(kick, 1_200);
    const id = window.setInterval(kick, 20_000);
    return () => {
      live = false;
      window.clearTimeout(soon);
      window.clearInterval(id);
    };
  }, [hydrated, autopilot]);

  async function ask(question: string) {
    if (useDesk.getState().asking) return;
    setAsking(true, question);
    const snap = snapshot();
    const state = useDesk.getState();
    const recentFills = state.fills.slice(0, 6).map((f) => ({
      symbol: f.symbol,
      side: f.side,
      qty: f.qty,
      price: f.price,
      note: f.note,
      source: f.source,
    }));
    try {
      const res = await Promise.race([
        askFloor({
          data: {
            question,
            snap,
            selected: state.selected,
            lastCouncil: state.lastCouncil,
            lastAsk: state.lastAsk,
            recentFills,
            locale,
          },
        }),
        new Promise<{ ok: false; error: string }>((resolve) =>
          window.setTimeout(() => resolve({ ok: false, error: "timeout" }), 24_000),
        ),
      ]);
      if (res.ok) {
        answerAsk(question, res.result, "ai");
        toast.success(t("toast.answered", { name: AGENT_BY_ID[res.result.speaker].name }));
        return;
      }
      const fallback = localAsk(question, snap, locale, {
        lastCouncil: state.lastCouncil,
        recentFills,
      });
      answerAsk(question, fallback, "local");
      toast.message(t("toast.localDesk", { name: AGENT_BY_ID[fallback.speaker].name }));
    } catch {
      const fallback = localAsk(question, snap, locale, {
        lastCouncil: state.lastCouncil,
        recentFills,
      });
      answerAsk(question, fallback, "local");
      toast.message(t("toast.localDesk", { name: AGENT_BY_ID[fallback.speaker].name }));
    } finally {
      setAsking(false);
    }
  }

  const showSplash = bootHold || !hydrated || feed === "idle";

  return (
    <div data-selected={selected} data-mode={mode} className="desk-wash relative flex h-dvh flex-col overflow-hidden">
      {showSplash ? <TakeoffSplash overlay cycle /> : null}
      {!showSplash && modeFlash ? (
        <TakeoffSplash
          overlay
          kind={modeFlash === "live" ? "takeoff" : "landing"}
          mode={modeFlash}
          caption={modeFlash === "live" ? t("mode.liveOn") : t("mode.demoOn")}
        />
      ) : null}
      <DeskTour
        ready={!showSplash}
        userId={user?.id}
        onOpenSettings={() => {
          /* settings live in the header gear */
        }}
      />
      <DeskHeader focusChat={tab === "chat"} onConvene={convene} />
      <ProposalBanner />
      {tab === "chat" ? null : <OpenedStrip />}

      {desktop ? (
        <div className="grid min-h-0 flex-1 grid-cols-[16.5rem_minmax(0,1fr)_22rem] grid-rows-[minmax(0,1fr)_12rem] gap-3 overflow-hidden p-3">
          <section className="row-span-2 min-h-0 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]">
            <Watchlist />
          </section>
          <section className="min-h-0 overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <MarketDesk />
          </section>
          <section className="row-span-2 min-h-0 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]">
            <Tabs
              value={side}
              onValueChange={(v) => setSide(v as "floor" | "portfolio" | "history" | "chat")}
              className="flex h-full min-h-0 flex-col gap-3"
            >
              <TabsList className="w-full shrink-0">
                <TabsTrigger value="floor" className="px-1 text-2xs sm:text-xs">
                  {t("nav.floor")}
                </TabsTrigger>
                <TabsTrigger value="portfolio" className="px-1 text-2xs sm:text-xs">
                  {t("nav.portfolio")}
                </TabsTrigger>
                <TabsTrigger value="history" className="px-1 text-2xs sm:text-xs">
                  {t("nav.history")}
                </TabsTrigger>
                <TabsTrigger value="chat" className="px-1 text-2xs sm:text-xs">
                  {t("floor.chat")}
                </TabsTrigger>
              </TabsList>
              <div className="min-h-0 flex-1 overflow-hidden">
                {side === "floor" ? (
                  <CouncilPanel onConvene={convene} />
                ) : side === "portfolio" ? (
                  <PortfolioPanel />
                ) : side === "history" ? (
                  <HistoryPanel />
                ) : (
                  <ChatPane onAsk={ask} />
                )}
              </div>
            </Tabs>
          </section>
          <section className="min-h-0 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]">
            <TapePanel />
          </section>
        </div>
      ) : (
        <>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 pb-24">
            {tab === "market" ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <TickerStrip />
                <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]">
                  <MarketDesk />
                </section>
              </div>
            ) : null}
            {tab === "portfolio" ? (
              <section className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]">
                <PortfolioPanel />
              </section>
            ) : null}
            {tab === "history" ? (
              <section className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]">
                <HistoryPanel />
              </section>
            ) : null}
            {tab === "floor" ? (
              <section className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]">
                <CouncilPanel onConvene={convene} />
              </section>
            ) : null}
            {tab === "chat" ? (
              <section className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]">
                <ChatPane onAsk={ask} />
              </section>
            ) : null}
          </div>

          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)]">
            <ul className="grid grid-cols-5">
              {(
                [
                  ["market", t("nav.market"), BarChart3],
                  ["portfolio", t("nav.portfolio"), Briefcase],
                  ["history", t("nav.history"), History],
                  ["floor", t("nav.floor"), Users],
                  ["chat", t("floor.chat"), MessageSquare],
                ] as const
              ).map(([id, label, Icon]) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    className={cn(
                      "flex h-16 w-full flex-col items-center justify-center gap-0.5 px-0.5 text-center text-3xs font-medium leading-none tracking-tight whitespace-nowrap",
                      tab === id ? "text-fg" : "text-muted",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

