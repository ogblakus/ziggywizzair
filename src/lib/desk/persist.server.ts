import { readFile, rename, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getSql } from "@/lib/db";
import { BOOKS_DIR, listFileBooks, snapshotSoon } from "@/lib/desk/vault.server";
import { loadLiveMarket, type LiveQuote } from "@/lib/market/quotes";
import {
  bookLooksLive,
  catchUpBook,
  emptyBook,
  pickBook,
  preferBook,
  scrubGhostAutopilot,
  type DeskBook,
} from "@/lib/desk/engine";
import { withTeamLocks } from "@/lib/desk/holds";

const FILE_DIR = BOOKS_DIR;

type DeskRow = { user_id: string; payload: DeskBook | string };

function asBook(raw: unknown): DeskBook | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<DeskBook>;
  if (typeof p.cash !== "number" || !Number.isFinite(p.cash)) return null;
  const base = emptyBook();
  const book: DeskBook = {
    ...base,
    cash: p.cash,
    positions: Array.isArray(p.positions) ? p.positions.slice(0, 16) : [],
    fills: Array.isArray(p.fills) ? p.fills.slice(0, 80) : [],
    closedTrades: Array.isArray(p.closedTrades) ? p.closedTrades.slice(0, 200) : [],
    autopilot: Boolean(p.autopilot),
    lastCouncil: p.lastCouncil ?? null,
    lastAsk: p.lastAsk ?? null,
    agents: Array.isArray(p.agents) && p.agents.length ? p.agents : base.agents,
    startingEquity: typeof p.startingEquity === "number" ? p.startingEquity : base.startingEquity,
    periodAnchors: p.periodAnchors ?? base.periodAnchors,
    tape: Array.isArray(p.tape)
      ? p.tape.slice(0, 80).map((row) => ({
          ...row,
          text: typeof row.text === "string" ? row.text.slice(0, 400) : String(row.text ?? ""),
        }))
      : base.tape,
    proposal: p.proposal ?? null,
    working: p.working ?? null,
    selected: typeof p.selected === "string" ? p.selected : "NVDA",
    lastAutoAt: typeof p.lastAutoAt === "number" ? p.lastAutoAt : 0,
    lastTickAt: typeof p.lastTickAt === "number" ? p.lastTickAt : 0,
    fillSeq: typeof p.fillSeq === "number" ? p.fillSeq : 0,
    clientUntil: typeof p.clientUntil === "number" ? p.clientUntil : 0,
    deskEpoch: typeof p.deskEpoch === "number" ? p.deskEpoch : 0,
    agentCalls: Array.isArray(p.agentCalls) ? p.agentCalls.slice(0, 80) : [],
    lastCouncilAt: typeof p.lastCouncilAt === "number" ? p.lastCouncilAt : 0,
    locale: p.locale === "pl" ? "pl" : "en",
    mode: p.mode === "live" ? "live" : "demo",
  };
  book.positions = withTeamLocks(book.positions, book.fills);
  return scrubGhostAutopilot(book);
}

function fileFor(userId: string) {
  const safe = userId.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "desk";
  return join(FILE_DIR, `quorum-desk-${safe}.json`);
}

async function readJsonBook(path: string): Promise<DeskBook | null> {
  try {
    return asBook(JSON.parse(await readFile(path, "utf8")));
  } catch {
    try {
      const legacy = join(tmpdir(), path.split("/").pop() ?? "");
      if (legacy !== path) return asBook(JSON.parse(await readFile(legacy, "utf8")));
    } catch {
      /* none */
    }
    return null;
  }
}

function contentKey(book: DeskBook) {
  return JSON.stringify({
    cash: book.cash,
    positions: book.positions,
    fills: book.fills.map((f) => f.id),
    closed: book.closedTrades.length,
    autopilot: book.autopilot,
    epoch: book.deskEpoch,
    fillSeq: book.fillSeq,
    lastAutoAt: book.lastAutoAt,
    council: book.lastCouncil?.summary ?? null,
    ask: book.lastAsk?.question ?? null,
    proposal: book.proposal ? `${book.proposal.side}:${book.proposal.symbol}` : null,
    lastCouncilAt: book.lastCouncilAt ?? 0,
  });
}

async function writeFileBook(userId: string, book: DeskBook) {
  try {
    await mkdir(FILE_DIR, { recursive: true });
    const file = fileFor(userId);
    const tmp = `${file}.tmp`;
    await writeFile(tmp, JSON.stringify(book), "utf8");
    try {
      await rename(tmp, file);
    } catch {
      await writeFile(file, JSON.stringify(book), "utf8");
    }
  } catch {
    /* tmpfs / read-only — SQL + memory still hold the book */
  }
}

async function readSqlBook(userId: string): Promise<DeskBook | null> {
  try {
    const sql = await getSql();
    const rows = await sql<DeskRow>`select user_id, payload from desk_books where user_id = ${userId} limit 1`;
    const payload = rows[0]?.payload;
    if (!payload) return null;
    return asBook(typeof payload === "string" ? JSON.parse(payload) : payload);
  } catch {
    return null;
  }
}

async function writeSqlBook(userId: string, book: DeskBook) {
  try {
    const sql = await getSql();
    const payload = JSON.stringify(book);
    await sql.query(
      `insert into desk_books (user_id, payload, updated_at) values ($1, $2::jsonb, now())
       on conflict (user_id) do update set payload = excluded.payload, updated_at = now()`,
      [userId, payload],
    );
  } catch {
    /* memory peek still holds it */
  }
}

async function listSqlBooks(): Promise<Array<{ userId: string; book: DeskBook }>> {
  try {
    const sql = await getSql();
    const rows = await sql<DeskRow>`select user_id, payload from desk_books`;
    const out: Array<{ userId: string; book: DeskBook }> = [];
    for (const row of rows) {
      const book = asBook(typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload);
      if (book) out.push({ userId: row.user_id, book });
    }
    return out;
  } catch {
    return [];
  }
}

const g = globalThis as typeof globalThis & {
  __quorumDeskLoop?: ReturnType<typeof setInterval>;
  __quorumDeskChain?: Promise<unknown>;
  __quorumDeskPeeks?: Record<string, DeskBook>;
  __quorumDeskFileKeys?: Record<string, string>;
};

function peeks() {
  g.__quorumDeskPeeks ??= {};
  return g.__quorumDeskPeeks;
}

function fileKeys() {
  g.__quorumDeskFileKeys ??= {};
  return g.__quorumDeskFileKeys;
}

function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = (g.__quorumDeskChain ?? Promise.resolve()).then(fn, fn);
  g.__quorumDeskChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function loadBook(userId: string): Promise<DeskBook> {
  const mem = peeks()[userId] ?? null;
  const sqlBook = await readSqlBook(userId);
  const fileBook = await readJsonBook(fileFor(userId));
  const picked = pickBook(pickBook(mem, sqlBook), fileBook);
  if (picked) {
    const clean = scrubGhostAutopilot(picked);
    peeks()[userId] = clean;
    return clean;
  }
  return emptyBook();
}

async function persistInner(userId: string, book: DeskBook, opts?: { touchClient?: boolean; away?: boolean }) {
  const now = Date.now();
  const next: DeskBook = {
    ...book,
    lastTickAt: Math.max(book.lastTickAt, now),
    clientUntil: opts?.away ? now : opts?.touchClient ? now + 45_000 : (book.clientUntil ?? 0),
  };
  peeks()[userId] = next;
  await writeSqlBook(userId, next);
  const key = contentKey(next);
  if (key !== fileKeys()[userId]) {
    fileKeys()[userId] = key;
    await writeFileBook(userId, next);
  }
  try {
    snapshotSoon(await getSql());
  } catch {
    /* vault is best-effort */
  }
  return next;
}

export async function persistBook(userId: string, book: DeskBook, opts?: { touchClient?: boolean; away?: boolean }) {
  return locked(() => persistInner(userId, book, opts));
}

async function tickOne(userId: string, book: DeskBook, tape: LiveQuote[], now: number): Promise<void> {
  book = scrubGhostAutopilot(book);
  if (!bookLooksLive(book) && !book.autopilot && book.lastTickAt === 0) return;
  if (now < (book.clientUntil || 0)) {
    await persistBook(userId, { ...book, lastTickAt: now });
    return;
  }
  const beforeIds = new Set(book.fills.map((f) => f.id));
  const hadProposal = Boolean(book.proposal);
  let next = book;
  const { shouldAwayCouncil, conveneAway } = await import("./away-council");
  if (tape.length && shouldAwayCouncil(book, now)) {
    try {
      const [{ loadLiveNews }, { loadLiveMacro }] = await Promise.all([
        import("@/lib/market/news"),
        import("@/lib/market/macro"),
      ]);
      const [news, macro] = await Promise.all([loadLiveNews(), loadLiveMacro()]);
      const away = await conveneAway(
        next,
        tape,
        news.ok ? news.headlines : [],
        macro.ok ? macro.macro : null,
        now,
      );
      next = away.book;
    } catch {
      /* council miss — still mark the book */
    }
  }
  next = tape.length ? catchUpBook(next, tape, now) : { ...next, lastTickAt: now };
  const saved = await persistBook(userId, next);
  const away = now > (saved.clientUntil || 0);
  if (away) {
    const fresh = saved.fills.filter((f) => !beforeIds.has(f.id));
    if (fresh.length) {
      void import("./push.server")
        .then((m) => m.notifyFills(fresh, saved.closedTrades, userId, saved.locale === "pl" ? "pl" : "en"))
        .catch(() => undefined);
    } else if (saved.proposal && !hadProposal && !saved.autopilot) {
      void import("./push.server")
        .then((m) => m.notifyProposal(saved.proposal!, saved.locale === "pl" ? "pl" : "en", userId))
        .catch(() => undefined);
    }
  }
}

export async function tickDesk(
  quotes?: LiveQuote[],
  opts?: { fromClient?: boolean; userId?: string },
): Promise<DeskBook | null> {
  if (opts?.fromClient && opts.userId) {
    return locked(async () => persistInner(opts.userId!, await loadBook(opts.userId!), { touchClient: true }));
  }

  let tape = quotes;
  if (!tape) {
    const market = await loadLiveMarket();
    tape = market.ok ? market.quotes : [];
  }

  const now = Date.now();
  const rows = await locked(async () => {
    const listed = await listSqlBooks();
    const seen = new Set(listed.map((r) => r.userId));
    for (const [userId, book] of Object.entries(peeks())) {
      if (!seen.has(userId)) listed.push({ userId, book });
    }
    for (const file of await listFileBooks()) {
      if (seen.has(file.userId)) continue;
      try {
        const book = asBook(JSON.parse(file.raw));
        if (book) {
          listed.push({ userId: file.userId, book });
          seen.add(file.userId);
        }
      } catch {
        /* skip junk file */
      }
    }
    return listed;
  });
  for (const row of rows) {
    await tickOne(row.userId, peeks()[row.userId] ?? row.book, tape ?? [], now);
  }
  return opts?.userId ? peeks()[opts.userId] ?? null : null;
}

export async function saveFromClient(
  userId: string,
  raw: unknown,
): Promise<{ book: DeskBook; accepted: boolean }> {
  return locked(async () => {
    const incoming = asBook(raw) ?? emptyBook();
    try {
      if (JSON.stringify(incoming).length > 250_000) {
        const existing = await loadBook(userId);
        peeks()[userId] = existing;
        return { book: existing, accepted: false };
      }
    } catch {
      const existing = await loadBook(userId);
      return { book: existing, accepted: false };
    }
    const existing = await loadBook(userId);
    if (!preferBook(incoming, existing) && bookLooksLive(existing)) {
      const merged =
        incoming.selected && incoming.selected !== existing.selected
          ? { ...existing, selected: incoming.selected }
          : existing;
      peeks()[userId] = merged;
      return { book: merged, accepted: false };
    }
    const saved = await persistInner(userId, incoming, { touchClient: true });
    return { book: saved, accepted: true };
  });
}

export function ensureDeskLoop() {
  if (g.__quorumDeskLoop) return;
  g.__quorumDeskLoop = setInterval(() => {
    void tickDesk().catch(() => undefined);
  }, 60_000);
}

export { asBook };
