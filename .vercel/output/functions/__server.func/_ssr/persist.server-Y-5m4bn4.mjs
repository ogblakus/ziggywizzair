import { g as withTeamLocks } from "./holds-BpglsS1V.mjs";
import { d as preferBook, f as scrubGhostAutopilot, i as emptyBook, n as bookLooksLive, r as catchUpBook, u as pickBook } from "./engine-C1GaS4Le.mjs";
import { i as getSql } from "./db-By3YCc4B.mjs";
import { BOOKS_DIR, listFileBooks, snapshotSoon } from "./vault.server-DeQoDthf.mjs";
import { i as loadLiveMarket } from "./quotes-BfNKKZaD.mjs";
import { join } from "node:path";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
//#region node_modules/.nitro/vite/services/ssr/assets/persist.server-Y-5m4bn4.js
var FILE_DIR = BOOKS_DIR;
function asBook(raw) {
	if (!raw || typeof raw !== "object") return null;
	const p = raw;
	if (typeof p.cash !== "number" || !Number.isFinite(p.cash)) return null;
	const base = emptyBook();
	const book = {
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
		tape: Array.isArray(p.tape) ? p.tape.slice(0, 80).map((row) => ({
			...row,
			text: typeof row.text === "string" ? row.text.slice(0, 400) : String(row.text ?? "")
		})) : base.tape,
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
		mode: p.mode === "live" ? "live" : "demo"
	};
	book.positions = withTeamLocks(book.positions, book.fills);
	return scrubGhostAutopilot(book);
}
function fileFor(userId) {
	const safe = userId.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "desk";
	return join(FILE_DIR, `quorum-desk-${safe}.json`);
}
async function readJsonBook(path) {
	try {
		return asBook(JSON.parse(await readFile(path, "utf8")));
	} catch {
		try {
			const legacy = join(tmpdir(), path.split("/").pop() ?? "");
			if (legacy !== path) return asBook(JSON.parse(await readFile(legacy, "utf8")));
		} catch {}
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
		ask: book.lastAsk?.question ?? null,
		proposal: book.proposal ? `${book.proposal.side}:${book.proposal.symbol}` : null,
		lastCouncilAt: book.lastCouncilAt ?? 0
	});
}
async function writeFileBook(userId, book) {
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
		const clean = scrubGhostAutopilot(picked);
		peeks()[userId] = clean;
		return clean;
	}
	return emptyBook();
}
async function persistInner(userId, book, opts) {
	const now = Date.now();
	const next = {
		...book,
		lastTickAt: Math.max(book.lastTickAt, now),
		clientUntil: opts?.away ? now : opts?.touchClient ? now + 45e3 : book.clientUntil ?? 0
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
	} catch {}
	return next;
}
async function persistBook(userId, book, opts) {
	return locked(() => persistInner(userId, book, opts));
}
async function tickOne(userId, book, tape, now) {
	book = scrubGhostAutopilot(book);
	if (!bookLooksLive(book) && !book.autopilot && book.lastTickAt === 0) return;
	if (now < (book.clientUntil || 0)) {
		await persistBook(userId, {
			...book,
			lastTickAt: now
		});
		return;
	}
	const beforeIds = new Set(book.fills.map((f) => f.id));
	const hadProposal = Boolean(book.proposal);
	let next = book;
	const { shouldAwayCouncil, conveneAway } = await import("./away-council-Buqpyo2z.mjs");
	if (tape.length && shouldAwayCouncil(book, now)) try {
		const [{ loadLiveNews }, { loadLiveMacro }] = await Promise.all([import("./news-BCja-IdZ.mjs").then((n) => n.n), import("./macro-DaPt4VNL.mjs").then((n) => n.r).then((n) => n.r)]);
		const [news, macro] = await Promise.all([loadLiveNews(), loadLiveMacro()]);
		next = (await conveneAway(next, tape, news.ok ? news.headlines : [], macro.ok ? macro.macro : null, now)).book;
	} catch {}
	next = tape.length ? catchUpBook(next, tape, now) : {
		...next,
		lastTickAt: now
	};
	const saved = await persistBook(userId, next);
	if (now > (saved.clientUntil || 0)) {
		const fresh = saved.fills.filter((f) => !beforeIds.has(f.id));
		if (fresh.length) import("./push.server-BWkb1GjS.mjs").then((m) => m.notifyFills(fresh, saved.closedTrades, userId, saved.locale === "pl" ? "pl" : "en", saved.alertPrefs)).catch(() => void 0);
		else if (saved.proposal && !hadProposal && !saved.autopilot) import("./push.server-BWkb1GjS.mjs").then((m) => m.notifyProposal(saved.proposal, saved.locale === "pl" ? "pl" : "en", userId, saved.alertPrefs)).catch(() => void 0);
	}
}
async function tickDesk(quotes, opts) {
	if (opts?.fromClient && opts.userId) return locked(async () => persistInner(opts.userId, await loadBook(opts.userId), { touchClient: true }));
	let tape = quotes;
	if (!tape) {
		const market = await loadLiveMarket();
		tape = market.ok ? market.quotes : [];
	}
	const now = Date.now();
	const rows = await locked(async () => {
		const listed = await listSqlBooks();
		const seen = new Set(listed.map((r) => r.userId));
		for (const [userId, book] of Object.entries(peeks())) if (!seen.has(userId)) listed.push({
			userId,
			book
		});
		for (const file of await listFileBooks()) {
			if (seen.has(file.userId)) continue;
			try {
				const book = asBook(JSON.parse(file.raw));
				if (book) {
					listed.push({
						userId: file.userId,
						book
					});
					seen.add(file.userId);
				}
			} catch {}
		}
		return listed;
	});
	for (const row of rows) await tickOne(row.userId, peeks()[row.userId] ?? row.book, tape ?? [], now);
	return opts?.userId ? peeks()[opts.userId] ?? null : null;
}
async function saveFromClient(userId, raw) {
	return locked(async () => {
		const incoming = asBook(raw) ?? emptyBook();
		try {
			if (JSON.stringify(incoming).length > 25e4) {
				const existing = await loadBook(userId);
				peeks()[userId] = existing;
				return {
					book: existing,
					accepted: false
				};
			}
		} catch {
			return {
				book: await loadBook(userId),
				accepted: false
			};
		}
		const existing = await loadBook(userId);
		if (!preferBook(incoming, existing) && bookLooksLive(existing)) {
			const merged = incoming.selected && incoming.selected !== existing.selected ? {
				...existing,
				selected: incoming.selected
			} : existing;
			peeks()[userId] = merged;
			return {
				book: merged,
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
export { ensureDeskLoop, loadBook, persistBook, saveFromClient, tickDesk };
