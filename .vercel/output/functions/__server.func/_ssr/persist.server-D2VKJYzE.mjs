import { i as getSql } from "./db-CS8H5U8C.mjs";
import { _ as preferBook, h as pickBook, i as bookLooksLive, o as catchUpBook, p as loadLiveMarket, u as emptyBook } from "./engine-D4bUUxwE.mjs";
import { join } from "node:path";
import { readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
//#region node_modules/.nitro/vite/services/ssr/assets/persist.server-D2VKJYzE.js
var FILE_DIR = tmpdir();
function asBook(raw) {
	if (!raw || typeof raw !== "object") return null;
	const p = raw;
	if (typeof p.cash !== "number") return null;
	const base = emptyBook();
	return {
		...base,
		...p,
		cash: p.cash,
		positions: Array.isArray(p.positions) ? p.positions : [],
		fills: Array.isArray(p.fills) ? p.fills : [],
		closedTrades: Array.isArray(p.closedTrades) ? p.closedTrades : [],
		autopilot: Boolean(p.autopilot),
		lastCouncil: p.lastCouncil ?? null,
		lastAsk: p.lastAsk ?? null,
		agents: Array.isArray(p.agents) && p.agents.length ? p.agents : base.agents,
		startingEquity: typeof p.startingEquity === "number" ? p.startingEquity : base.startingEquity,
		periodAnchors: p.periodAnchors ?? base.periodAnchors,
		tape: Array.isArray(p.tape) ? p.tape.slice(0, 80) : base.tape,
		proposal: p.proposal ?? null,
		selected: typeof p.selected === "string" ? p.selected : "NVDA",
		lastAutoAt: typeof p.lastAutoAt === "number" ? p.lastAutoAt : 0,
		lastTickAt: typeof p.lastTickAt === "number" ? p.lastTickAt : 0,
		fillSeq: typeof p.fillSeq === "number" ? p.fillSeq : 0,
		clientUntil: typeof p.clientUntil === "number" ? p.clientUntil : 0,
		deskEpoch: typeof p.deskEpoch === "number" ? p.deskEpoch : 0
	};
}
function fileFor(userId) {
	const safe = userId.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "desk";
	return join(FILE_DIR, `quorum-desk-${safe}.json`);
}
async function readJsonBook(path) {
	try {
		return asBook(JSON.parse(await readFile(path, "utf8")));
	} catch {
		return null;
	}
}
function contentKey(book) {
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
		ask: book.lastAsk?.question ?? null
	});
}
async function writeFileBook(userId, book) {
	try {
		const file = fileFor(userId);
		const tmp = `${file}.tmp`;
		await writeFile(tmp, JSON.stringify(book), "utf8");
		try {
			await rename(tmp, file);
		} catch {
			await writeFile(file, JSON.stringify(book), "utf8");
		}
	} catch {}
}
async function readSqlBook(userId) {
	try {
		const payload = (await (await getSql())`select user_id, payload from desk_books where user_id = ${userId} limit 1`)[0]?.payload;
		if (!payload) return null;
		return asBook(typeof payload === "string" ? JSON.parse(payload) : payload);
	} catch {
		return null;
	}
}
async function writeSqlBook(userId, book) {
	try {
		const sql = await getSql();
		const payload = JSON.stringify(book);
		await sql.query(`insert into desk_books (user_id, payload, updated_at) values ($1, $2::jsonb, now())
       on conflict (user_id) do update set payload = excluded.payload, updated_at = now()`, [userId, payload]);
	} catch {}
}
async function listSqlBooks() {
	try {
		const rows = await (await getSql())`select user_id, payload from desk_books`;
		const out = [];
		for (const row of rows) {
			const book = asBook(typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload);
			if (book) out.push({
				userId: row.user_id,
				book
			});
		}
		return out;
	} catch {
		return [];
	}
}
var g = globalThis;
function peeks() {
	g.__quorumDeskPeeks ??= {};
	return g.__quorumDeskPeeks;
}
function fileKeys() {
	g.__quorumDeskFileKeys ??= {};
	return g.__quorumDeskFileKeys;
}
function locked(fn) {
	const run = (g.__quorumDeskChain ?? Promise.resolve()).then(fn, fn);
	g.__quorumDeskChain = run.then(() => void 0, () => void 0);
	return run;
}
async function loadBook(userId) {
	const mem = peeks()[userId] ?? null;
	const sqlBook = await readSqlBook(userId);
	const fileBook = await readJsonBook(fileFor(userId));
	const picked = pickBook(pickBook(mem, sqlBook), fileBook);
	if (picked) {
		peeks()[userId] = picked;
		return picked;
	}
	return emptyBook();
}
async function persistInner(userId, book, opts) {
	const now = Date.now();
	const next = {
		...book,
		lastTickAt: Math.max(book.lastTickAt, now),
		clientUntil: opts?.touchClient ? now + 45e3 : book.clientUntil ?? 0
	};
	peeks()[userId] = next;
	await writeSqlBook(userId, next);
	const key = contentKey(next);
	if (key !== fileKeys()[userId]) {
		fileKeys()[userId] = key;
		await writeFileBook(userId, next);
	}
	return next;
}
async function tickOne(userId, book, tape, now) {
	if (!bookLooksLive(book) && !book.autopilot && book.lastTickAt === 0) return;
	if (now < (book.clientUntil || 0)) {
		await persistInner(userId, {
			...book,
			lastTickAt: now
		});
		return;
	}
	const beforeIds = new Set(book.fills.map((f) => f.id));
	const saved = await persistInner(userId, tape.length ? catchUpBook(book, tape, now) : {
		...book,
		lastTickAt: now
	});
	if (now > (saved.clientUntil || 0)) {
		const fresh = saved.fills.filter((f) => !beforeIds.has(f.id));
		if (fresh.length) import("./push.server-C8LgGe03.mjs").then((m) => m.notifyFills(fresh, saved.closedTrades, userId)).catch(() => void 0);
	}
}
async function tickDesk(quotes, opts) {
	if (opts?.fromClient && opts.userId) return locked(async () => persistInner(opts.userId, await loadBook(opts.userId), { touchClient: true }));
	let tape = quotes;
	if (!tape) {
		const market = await loadLiveMarket();
		tape = market.ok ? market.quotes : [];
	}
	return locked(async () => {
		const now = Date.now();
		const rows = await listSqlBooks();
		const seen = new Set(rows.map((r) => r.userId));
		for (const [userId, book] of Object.entries(peeks())) if (!seen.has(userId)) rows.push({
			userId,
			book
		});
		for (const row of rows) await tickOne(row.userId, peeks()[row.userId] ?? row.book, tape ?? [], now);
		return opts?.userId ? peeks()[opts.userId] ?? null : null;
	});
}
async function saveFromClient(userId, raw) {
	return locked(async () => {
		const incoming = asBook(raw) ?? emptyBook();
		const existing = await loadBook(userId);
		if (!preferBook(incoming, existing) && bookLooksLive(existing)) {
			peeks()[userId] = existing;
			return {
				book: existing,
				accepted: false
			};
		}
		return {
			book: await persistInner(userId, incoming, { touchClient: true }),
			accepted: true
		};
	});
}
function ensureDeskLoop() {
	if (g.__quorumDeskLoop) return;
	g.__quorumDeskLoop = setInterval(() => {
		tickDesk().catch(() => void 0);
	}, 6e4);
}
//#endregion
export { ensureDeskLoop, loadBook, saveFromClient };
