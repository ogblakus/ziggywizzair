import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { AgentId } from "@/lib/agents/personas";
import { localAsk } from "@/lib/agents/local-council";
import { isEnglishLeak, isWhyOpenedQuestion, missedWhyOpened, replyLocale } from "@/lib/ai/ask-lang";
import { agentChat, extractJson, langBlock } from "@/lib/agents/core/chat";
import { runOrchestrator } from "@/lib/agents/orchestrator";
import { runLocalV2 } from "@/lib/agents/local-v2";
import { clientIp, rateLimit } from "@/lib/security/limit";
import type { AskResult, CouncilResult, MarketSnapshot } from "@/lib/types";

const AGENTS: AgentId[] = ["vesper", "ash", "kai", "damian", "iris"];

function asAgent(v: unknown): AgentId {
  return typeof v === "string" && AGENTS.includes(v as AgentId) ? (v as AgentId) : "iris";
}

function clipText(v: unknown, n: number) {
  return typeof v === "string" ? v.slice(0, n) : "";
}

function compactSnap(snap: MarketSnapshot) {
  return {
    tickers: (snap.tickers ?? []).slice(0, 12).map((t) => ({
      s: t.symbol,
      px: Number(t.price.toFixed(2)),
      livePx: t.livePx != null ? Number(t.livePx.toFixed(4)) : null,
      chg: Number(t.changePct.toFixed(2)),
      rsi: Number(t.rsi.toFixed(1)),
      vsSma: Number(t.vsSma.toFixed(2)),
      buySetup: t.buySetup ?? "none",
      buyLimit: t.buyLimit != null ? Number(t.buyLimit.toFixed(4)) : null,
      buyRetrace: t.buyRetrace ?? null,
      buyFvg: t.buyFvg ? [Number(t.buyFvg.low.toFixed(2)), Number(t.buyFvg.high.toFixed(2))] : null,
      buyWick: t.buyWick ?? false,
      buyTf: t.buyTf ?? null,
      sellSetup: t.sellSetup ?? "none",
      sellLimit: t.sellLimit != null ? Number(t.sellLimit.toFixed(4)) : null,
      sellRetrace: t.sellRetrace ?? null,
      sellFvg: t.sellFvg ? [Number(t.sellFvg.low.toFixed(2)), Number(t.sellFvg.high.toFixed(2))] : null,
      sellWick: t.sellWick ?? false,
      sellTf: t.sellTf ?? null,
      rvol: t.rvol != null ? Number(t.rvol.toFixed(2)) : null,
      session: t.session ?? null,
    })),
    book: {
      cash: Math.round(snap.book.cash),
      equity: Math.round(snap.book.equity),
      dayPnlPct: Number(snap.book.dayPnlPct.toFixed(2)),
      positions: (snap.book.positions ?? []).slice(0, 16).map((p) => ({
        s: p.symbol,
        qty: Number(p.qty.toFixed(4)),
        pnlPct: Number((p.pnlPct ?? 0).toFixed(2)),
        lock: Boolean(p.teamLock),
      })),
      working: snap.book.working
        ? { s: snap.book.working.symbol, side: snap.book.working.side, limitPx: snap.book.working.limitPx ?? null }
        : null,
    },
    wire: (snap.headlines ?? []).slice(0, 6).map((h) => ({
      t: clipText(h.text, 160),
      s: h.symbol ?? null,
    })),
    macro: snap.macro
      ? {
          vol: snap.macro.vix,
          volChg: snap.macro.vixChg,
          dollar: snap.macro.dxy,
          dollarChg: snap.macro.dxyChg,
          cryptoMcap: snap.macro.cryptoMcap,
          cryptoMcapPct: snap.macro.cryptoMcapPct,
          stocksPct: snap.macro.equityPct,
        }
      : null,
    scorecard: (snap.scorecard ?? []).slice(0, 12),
  };
}

function tooBig(payload: unknown) {
  try {
    return JSON.stringify(payload).length > 24_000;
  } catch {
    return true;
  }
}

export async function runCouncilSession(data: {
  snap: MarketSnapshot;
  last?: CouncilResult | null;
  selected?: string;
  locale?: "en" | "pl";
}): Promise<{ ok: true; result: CouncilResult } | { ok: false; error: string }> {
  const snap = data.snap;
  const locale = data.locale === "pl" ? "pl" : "en";
  if (!snap.tickers?.length) return { ok: false, error: "Council payload too large." };
  try {
    const session = await runOrchestrator({ snap, selected: data.selected ?? null, locale, last: data.last ?? null });
    return { ok: true, result: session.result };
  } catch {
    return { ok: true, result: runLocalV2({ snap, selected: data.selected ?? null, locale }) };
  }
}

export const conveneCouncil = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      snap: MarketSnapshot;
      last?: CouncilResult | null;
      selected?: string;
      locale?: "en" | "pl";
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const ip = await clientIp();
    if (!rateLimit(`council:${context.userId}`, 8, 10 * 60_000) || !rateLimit(`council-ip:${ip}`, 20, 10 * 60_000)) {
      return { ok: false as const, error: "Council is busy. Try again in a minute." };
    }
    return runCouncilSession(data);
  });

export const askFloor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      question: string;
      snap: MarketSnapshot;
      selected?: string;
      lastCouncil?: CouncilResult | null;
      lastAsk?: { question: string; speaker: string; text: string; log?: Array<{ question: string; speaker: string; text: string }> } | null;
      recentFills?: Array<{ symbol: string; side: string; qty: number; price: number; note?: string; source?: string }>;
      locale?: "en" | "pl";
    }) => input,
  )
  .handler(async ({ context, data }): Promise<{ ok: true; result: AskResult } | { ok: false; error: string }> => {
    const ip = await clientIp();
    if (!rateLimit(`ask:${context.userId}`, 20, 10 * 60_000) || !rateLimit(`ask-ip:${ip}`, 40, 10 * 60_000)) {
      return { ok: false, error: "Too many questions. Give the floor a minute." };
    }
    const question = data.question.trim().slice(0, 500);
    if (!question) return { ok: false, error: "Ask something first." };
    const locale = replyLocale(data.locale, question);
    try {
      const focusSym = (() => {
        const q = question.toUpperCase();
        const hit = data.snap.tickers.find(
          (t) => q.includes(t.symbol) || q.includes(t.name.toUpperCase()),
        );
        return hit?.symbol ?? data.selected ?? null;
      })();
      const focus = data.snap.tickers.find((t) => t.symbol === focusSym) ?? null;
      const held = data.snap.book.positions.find((p) => p.symbol === focusSym) ?? null;
      const prior = [
        ...(data.lastAsk?.log ?? []),
        data.lastAsk
          ? { question: data.lastAsk.question, speaker: data.lastAsk.speaker, text: data.lastAsk.text }
          : null,
      ]
        .filter(Boolean)
        .slice(-4) as Array<{ question: string; speaker: string; text: string }>;

      const compact = {
        q: question,
        lookingAt: data.selected ?? null,
        focus: focus
          ? {
              s: focus.symbol,
              name: focus.name,
              px: Number(focus.price.toFixed(4)),
              livePx: focus.livePx != null ? Number(focus.livePx.toFixed(4)) : null,
              liveBps: focus.liveBps != null ? Number(focus.liveBps.toFixed(1)) : null,
              open: Number(focus.open.toFixed(4)),
              high: Number(focus.high.toFixed(4)),
              low: Number(focus.low.toFixed(4)),
              chg: Number(focus.changePct.toFixed(2)),
              rsi: Number(focus.rsi.toFixed(1)),
              vsSma: Number(focus.vsSma.toFixed(2)),
              held: held
                ? { qty: Number(held.qty.toFixed(4)), avg: Number(held.avg.toFixed(4)), pnlPct: Number(held.pnlPct.toFixed(2)) }
                : null,
            }
          : null,
        tape: compactSnap(data.snap).tickers,
        book: {
          cash: Math.round(data.snap.book.cash),
          equity: Math.round(data.snap.book.equity),
          dayPnlPct: Number(data.snap.book.dayPnlPct.toFixed(2)),
          positions: (data.snap.book.positions ?? []).slice(0, 16).map((p) => ({
            s: p.symbol,
            qty: Number(p.qty.toFixed(4)),
            avg: Number(p.avg.toFixed(4)),
            pnlPct: Number(p.pnlPct.toFixed(2)),
          })),
        },
        lastCouncil: data.lastCouncil
          ? {
              mood: data.lastCouncil.mood,
              summary: clipText(data.lastCouncil.summary, 240),
              votes: (data.lastCouncil.agents ?? []).slice(0, 6).map((a) => ({
                id: a.id,
                vote: a.vote,
                symbol: a.symbol,
                thesis: clipText(a.thesis, 180),
              })),
              sentiment: data.lastCouncil.sentiment ?? null,
              order: data.lastCouncil.order
                ? {
                    side: data.lastCouncil.order.side,
                    symbol: data.lastCouncil.order.symbol,
                    qty: data.lastCouncil.order.qty,
                  }
                : null,
            }
          : null,
        recentAsks: prior.map((p) => ({
          q: clipText(p.question, 200),
          speaker: p.speaker,
          a: clipText(p.text, 280),
        })),
        recentFills: (data.recentFills ?? []).slice(0, 6),
        wire: compactSnap(data.snap).wire,
        whyOpened: isWhyOpenedQuestion(question),
      };
      if (tooBig(compact)) return { ok: false, error: "Question payload too large." };

      const raw = extractJson(
        await agentChat(
          `${langBlock(locale, "ask")}

You are one named agent on the ZiggyWizzAir paper desk. Answer like a senior colleague on a voice note — intelligent, calm, specific. Not a chatbot. Not a telegram.

Pick the speaker whose mandate fits THIS question — not the selected ticker:
- vesper — momentum, breakouts, leaders (only if they asked about a name)
- ash — dips, fades, mean reversion (only if they asked about a name)
- kai — 15m / 1h / 4h setup, FVG, session grabs (only if they asked about a name or a session)
- damian — sentiment, sectors, dollar, vol, crypto market cap, metals, news. NOT RSI. NOT a stock they didn't name.
- iris — size, cash, close, risk, "why did we open"

If the question is about crypto market cap / krypto / kapitalizacja / dollar / vol / sectors: speaker MUST be damian, and the first paragraph MUST answer that — never talk about the selected stock.
If they did not name a ticker, do not invent one.

If whyOpened is true: explain WHY the position exists using lastCouncil votes and recentFills, in plain language.

Voice:
- TWO paragraphs, max. Never one fact per line.
- First paragraph: answer the trader, including when their read is off (e.g. they say it dumped, the open-to-now print is flat — say so, politely).
- Second: what we hold and what you would actually do.
- If P&L is ~0, say "praktycznie na zero" / "basically unchanged". Never "+0.0%".
- One price or one percent as color is fine. No indicator dumps. No slogans.
- Paper only.

Return JSON only:
{"speaker":"vesper"|"ash"|"kai"|"damian"|"iris","text":"the answer"}`,
          JSON.stringify(compact),
          900,
          { timeoutMs: 22_000, temperature: 0.7 },
        ),
      ) as { speaker?: unknown; text?: unknown };
      const speaker = asAgent(raw.speaker);
      const text =
        typeof raw.text === "string" && raw.text.trim() ? raw.text.trim().slice(0, 1600) : "No view.";
      if (isEnglishLeak(text, locale) || missedWhyOpened(question, text)) {
        return {
          ok: true,
          result: localAsk(question, data.snap, locale, {
            lastCouncil: data.lastCouncil,
            recentFills: data.recentFills,
          }),
        };
      }
      return { ok: true, result: { speaker, text } };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Floor is quiet" };
    }
  });
