import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { AgentId } from "@/lib/agents/personas";
import { localAsk } from "@/lib/agents/local-council";
import { gateCouncilOrder } from "@/lib/agents/quorum";
import { isEnglishLeak, isWhyOpenedQuestion, missedWhyOpened, replyLocale } from "@/lib/ai/ask-lang";
import { clipPctOf, markOf, qtyForClip } from "@/lib/desk/size";
import { clientIp, rateLimit } from "@/lib/security/limit";
import type { AskResult, CouncilResult, MarketSnapshot, SectorCall, SentimentReport, Stance } from "@/lib/types";

const AGENTS: AgentId[] = ["vesper", "ash", "kai", "damian", "iris"];

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON in model output");
  return JSON.parse(text.slice(start, end + 1)) as unknown;
}

function asVote(v: unknown): "buy" | "sell" | "hold" {
  return v === "buy" || v === "sell" || v === "hold" ? v : "hold";
}

function asAgent(v: unknown): AgentId {
  return typeof v === "string" && AGENTS.includes(v as AgentId) ? (v as AgentId) : "iris";
}

function asMood(v: unknown): CouncilResult["mood"] {
  return v === "risk-on" || v === "risk-off" || v === "cautious" ? v : "cautious";
}

function asStance(v: unknown): Stance {
  return v === "bullish" || v === "bearish" || v === "neutral" ? v : "neutral";
}

function parseSentiment(raw: unknown): SentimentReport | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const ids: SectorCall["id"][] = ["equities", "crypto", "metals", "dollar", "vol"];
  const list = Array.isArray(o.sectors) ? o.sectors : [];
  const byId = new Map<string, Record<string, unknown>>();
  for (const row of list) {
    if (row && typeof row === "object") {
      const r = row as Record<string, unknown>;
      if (typeof r.id === "string") byId.set(r.id, r);
    }
  }
  const sectors: SectorCall[] = ids.map((id) => {
    const r = byId.get(id) ?? {};
    return {
      id,
      stance: asStance(r.stance),
      why: typeof r.why === "string" && r.why.trim() ? r.why.trim().slice(0, 80) : "—",
    };
  });
  const summary =
    typeof o.summary === "string" && o.summary.trim()
      ? o.summary.trim().slice(0, 220)
      : sectors
          .filter((s) => s.stance !== "neutral")
          .map((s) => `${s.id} ${s.stance}`)
          .join(" · ") || "Mixed.";
  return { summary, sectors };
}

function parseCouncil(raw: unknown, snap: MarketSnapshot): CouncilResult {
  const o = (raw ?? {}) as Record<string, unknown>;
  const session = (o.session ?? o) as Record<string, unknown>;
  const list = Array.isArray(o.agents) ? o.agents : [];
  const byId = new Map<string, Record<string, unknown>>();
  for (const row of list) {
    if (row && typeof row === "object") {
      const r = row as Record<string, unknown>;
      if (typeof r.id === "string") byId.set(r.id, r);
    }
  }
  const symbols = new Set(snap.tickers.map((t) => t.symbol));
  const sentiment = parseSentiment(o.sentiment) ?? parseSentiment(session.sentiment);
  const agents: CouncilResult["agents"] = AGENTS.map((id) => {
    const r = byId.get(id) ?? {};
    const symbol = typeof r.symbol === "string" && symbols.has(r.symbol) ? r.symbol : null;
    const conviction = Math.min(1, Math.max(0, Number(r.conviction) || 0));
    const sizePct = Math.min(12, Math.max(0, Number(r.sizePct) || 0));
    const thesis =
      typeof r.thesis === "string" && r.thesis.trim()
        ? r.thesis.trim().slice(0, 280)
        : id === "damian" && sentiment?.summary
          ? sentiment.summary
          : "No view this print.";
    return {
      id,
      thesis,
      vote: id === "damian" ? "hold" : asVote(r.vote),
      symbol: id === "damian" ? null : symbol,
      conviction,
      sizePct: id === "damian" ? 0 : sizePct,
    };
  });
  const orderRaw = o.order && typeof o.order === "object" ? (o.order as Record<string, unknown>) : null;
  let order: CouncilResult["order"] = null;
  if (orderRaw && (orderRaw.side === "buy" || orderRaw.side === "sell")) {
    const symbol = typeof orderRaw.symbol === "string" ? orderRaw.symbol : "";
    const t = snap.tickers.find((x) => x.symbol === symbol);
    const iris = agents.find((a) => a.id === "iris");
    const intended = iris && iris.sizePct > 0 ? iris.sizePct : Number(orderRaw.qty) > 0 ? 3 : 3;
    const px = t ? markOf(t) : 0;
    const qty = t ? qtyForClip(snap.book.equity, intended, px, symbol) : 0;
    if (t && qty > 0) {
      const actual = clipPctOf(qty, px, snap.book.equity);
      const raw =
        typeof orderRaw.rationale === "string" ? orderRaw.rationale.slice(0, 220) : "Chair synthesis.";
      const rationale = raw
        .replace(/(daje|sizes)\s+\d+(?:[.,]\d+)?%/gi, `$1 ${actual.toFixed(1)}%`)
        .replace(/\d+(?:[.,]\d+)?%\s+(na|on)\s+/gi, `${actual.toFixed(1)}% $1 `);
      order = {
        side: orderRaw.side,
        symbol,
        qty,
        rationale,
        limitPx:
          Number(orderRaw.limitPx) > 0 ? Number(Number(orderRaw.limitPx).toFixed(4)) : undefined,
      };
    }
  }
  order = gateCouncilOrder(order, agents, snap);
  return {
    mood: asMood(session.mood ?? o.mood),
    summary:
      typeof session.summary === "string"
        ? session.summary.slice(0, 200)
        : typeof o.summary === "string"
          ? o.summary.slice(0, 200)
          : "Council closed without a single view.",
    agents,
    order,
    sentiment,
  };
}

async function chat(
  system: string,
  user: string,
  maxTokens: number,
  opts?: { timeoutMs?: number; json?: boolean; temperature?: number },
): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("AI is not available in this environment");
  const json = opts?.json !== false;
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(opts?.timeoutMs ?? 8_000),
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: opts?.temperature ?? (json ? 0.85 : 0.7),
      max_tokens: maxTokens,
      ...(json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`xAI API error ${res.status}`);
  }
  const body = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return body.choices?.[0]?.message?.content ?? "";
}

function langBlock(locale: "en" | "pl", kind: "council" | "ask"): string {
  if (locale === "pl") {
    return kind === "council"
      ? "JĘZYK OBOWIĄZKOWY: session.summary, każda teza agenta, sentiment.summary i why sektorów pisz PO POLSKU, prostym językiem. Tickerów (META, BTC) nie tłumacz. Zakazany żargon: tape, wire, floor, probe, fills, heurystyki, quorum, lastCouncil, livePx, RSI, SMA20 — zamiast tego: notowania, wiadomości, rada, mała pozycja, transakcje, portfel, cena na żywo, średnia. Damian NIE głosuje na spółkę. Damian wypełnia sentiment (akcje, krypto, metale, dolar, zmienność): byczo/niedźwiedzio/brak kierunku + krótko czemu. BEZ cytowania nagłówka. Nie mów VIX/DXY — mów zmienność i dolar."
      : "JĘZYK OBOWIĄZKOWY: pole text w CAŁOŚCI PO POLSKU. Mów jak starszy kolega z biurka, nie jak terminal i nie jak czatbot. Dwa akapity, nie więcej. Żadnego zdania-hasła w osobnej linijce. Jeśli P&L koło zera: „praktycznie na zero”, nigdy „+0,0%”. Tickerów nie tłumacz. Zakazany żargon (tape, clip, rvol, RSI, SMA, livePx, quorum). Wolno jedną cenę albo jeden procent jako kolor. Zero angielskich sloganów.";
  }
  return "LANGUAGE: English. Keep ticker symbols as-is.";
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
  try {
    const snap = data.snap;
    const last = data.last;
    const locale = data.locale === "pl" ? "pl" : "en";
    const compact = {
      lookingAt: data.selected ?? null,
      ...compactSnap(snap),
      lastSession: last
        ? {
            summary: clipText(last.summary, 240),
            mood: last.mood,
            order: last.order
              ? { side: last.order.side, symbol: last.order.symbol, rationale: clipText(last.order.rationale, 180) }
              : null,
            votes: (last.agents ?? []).slice(0, 6).map((a) => ({
              id: a.id,
              vote: a.vote,
              symbol: a.symbol,
            })),
            damianSaid: clipText(last.sentiment?.summary ?? last.agents.find((a) => a.id === "damian")?.thesis, 180) || null,
          }
        : null,
    };
    if (tooBig(compact)) return { ok: false, error: "Council payload too large." };
    const system = `${langBlock(locale, "council")}

You chair ZiggyWizzAir, a five-agent paper desk. The market tab chart is Hyperliquid 1m for the trader's eye. Agents NEVER analyse 1m — that is noise.
Agents (do NOT write job titles like scout, executor, chain, zwiadowca, egzekutor, pieczęć, last in the chain — those are fixed):
- vesper: momentum. Cite changePct, RSI 15m, vsSma 15m, rvol 15m. Rides expansion (need >+0.35% from open, vs SMA20 >+0.15, RSI 50–78). Cuts stalls.
- ash: mean reversion. Cite vsSma 15m, RSI 15m, changePct. Buys wash (vs SMA20 < −0.55, RSI < 42). Sells stretch (vs SMA20 > +0.85, RSI > 62).
- kai: setup only on a name already picked. Reads 15m, 1h, 4h only. Highest TF tagging FVG wins (bull: candle3 low > candle1 high). Else 15m pullback 18–62% off the extreme. Chase = last 12% of that TF range. rvol from 15m ≥ 0.55. Sets limitPx at FVG midpoint or a tick into the pullback. Cite TF, retrace%, FVG prices, rvol, limit. No limit = hold.
- damian: NOT TA. Sector weather only (equities, crypto, metals, dollar, vol). No ticker vote.
- iris: PM. Sizes 2–6% from Damian's weather. HARD RULE: round-trip fees ≤ 5%. Hold a few hours; promising a few days. Max TWO adds/day on a pullback. New entries need Vesper or Ash on direction AND Kai's limit. Cite size% and cash%. lock:true on a position = the user owns it — never close or add.
Rules:
- SIZE qty from livePx. Charts on screen are 1m; your numbers are 15m/1h/4h.
- thesis MUST cite TF + numbers (RSI 15m, vs SMA20 15m, rvol 15m, retrace on that TF, FVG high/low). Never role talk.
- Skip dead tape (rvol 15m < 0.55).
- order.limitPx required for new entries. Cuts omit limitPx.
- Never claim a real broker fill.
Return JSON only:
{"session":{"mood":"risk-on"|"cautious"|"risk-off","summary":"one sentence"},
 "agents":[{"id":"vesper"|"ash"|"kai"|"damian"|"iris","thesis":"1-2 sentences","vote":"buy"|"sell"|"hold","symbol":"TICKER"|null,"conviction":0-1,"sizePct":0-10}],
 "sentiment":{"summary":"one sentence","sectors":[{"id":"equities"|"crypto"|"metals"|"dollar"|"vol","stance":"bullish"|"bearish"|"neutral","why":"short"}]},
 "order":null|{"side":"buy"|"sell","symbol":"TICKER","qty":number,"limitPx":number|null,"rationale":"one sentence"}}
qty is share/oz count sized to sizePct of equity at livePx. Include all five agents. Only Iris fills order. Damian never fills order.`;
    const raw = extractJson(await chat(system, JSON.stringify(compact), 900));
    return { ok: true, result: parseCouncil(raw, snap) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Council failed";
    return { ok: false, error: message };
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
        await chat(
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
          { timeoutMs: 22_000, json: true },
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
