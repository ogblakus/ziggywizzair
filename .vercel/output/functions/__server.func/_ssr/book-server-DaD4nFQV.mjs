import { n as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-Nk1Kc5zC.mjs";
import { t as createServerRpc } from "./createServerRpc-CN-evIEF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book-server-DaD4nFQV.js
var loadDeskBook_createServerFn_handler = createServerRpc({
	id: "fe8bb7b7a1cf2d937bc09dfe6254c5720783c76a41ac7b95d1367a7c2a461951",
	name: "loadDeskBook",
	filename: "src/lib/desk/book-server.ts"
}, (opts) => loadDeskBook.__executeServer(opts));
var loadDeskBook = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadDeskBook_createServerFn_handler, async ({ context }) => {
	const { ensureDeskLoop, loadBook } = await import("./persist.server-Y-5m4bn4.mjs");
	ensureDeskLoop();
	return {
		book: await loadBook(context.userId),
		at: Date.now()
	};
});
var saveDeskBook_createServerFn_handler = createServerRpc({
	id: "c5fd351cdb85b1f38396c6648973f61e8af17062402a3f2cda864a006ff4da33",
	name: "saveDeskBook",
	filename: "src/lib/desk/book-server.ts"
}, (opts) => saveDeskBook.__executeServer(opts));
var saveDeskBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveDeskBook_createServerFn_handler, async ({ context, data }) => {
	const { saveFromClient, ensureDeskLoop } = await import("./persist.server-Y-5m4bn4.mjs");
	ensureDeskLoop();
	const { book, accepted } = await saveFromClient(context.userId, data);
	return {
		ok: true,
		accepted,
		lastTickAt: book.lastTickAt,
		book
	};
});
var leaveDeskBook_createServerFn_handler = createServerRpc({
	id: "49963a16a27b3dfccf18cc186ff9e37d59eb8f97e8b968c644599faf113c871d",
	name: "leaveDeskBook",
	filename: "src/lib/desk/book-server.ts"
}, (opts) => leaveDeskBook.__executeServer(opts));
var leaveDeskBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(leaveDeskBook_createServerFn_handler, async ({ context }) => {
	const { loadBook, persistBook, ensureDeskLoop, tickDesk } = await import("./persist.server-Y-5m4bn4.mjs");
	ensureDeskLoop();
	const current = await loadBook(context.userId);
	const saved = await persistBook(context.userId, current, { away: true });
	tickDesk(void 0, { userId: context.userId }).catch(() => void 0);
	return {
		ok: true,
		lastTickAt: saved.lastTickAt
	};
});
//#endregion
export { leaveDeskBook_createServerFn_handler, loadDeskBook_createServerFn_handler, saveDeskBook_createServerFn_handler };
