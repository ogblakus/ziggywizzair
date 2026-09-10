import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-DQLtvhPD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book-server-BZrrm0g1.js
var loadDeskBook_createServerFn_handler = createServerRpc({
	id: "fe8bb7b7a1cf2d937bc09dfe6254c5720783c76a41ac7b95d1367a7c2a461951",
	name: "loadDeskBook",
	filename: "src/lib/desk/book-server.ts"
}, (opts) => loadDeskBook.__executeServer(opts));
var loadDeskBook = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadDeskBook_createServerFn_handler, async ({ context }) => {
	const { ensureDeskLoop, loadBook } = await import("./persist.server-D2VKJYzE.mjs");
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
	const { saveFromClient, ensureDeskLoop } = await import("./persist.server-D2VKJYzE.mjs");
	ensureDeskLoop();
	const { book, accepted } = await saveFromClient(context.userId, data);
	return {
		ok: true,
		accepted,
		lastTickAt: book.lastTickAt,
		book
	};
});
//#endregion
export { loadDeskBook_createServerFn_handler, saveDeskBook_createServerFn_handler };
