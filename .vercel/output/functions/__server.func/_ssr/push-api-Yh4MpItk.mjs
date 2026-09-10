import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-DQLtvhPD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/push-api-Yh4MpItk.js
var getPushPublicKey_createServerFn_handler = createServerRpc({
	id: "95fcd8f79dd8754227ad02b43e9237b62a286d94d18c2bbc4c2d56acaaa19276",
	name: "getPushPublicKey",
	filename: "src/lib/desk/push-api.ts"
}, (opts) => getPushPublicKey.__executeServer(opts));
var getPushPublicKey = createServerFn({ method: "GET" }).handler(getPushPublicKey_createServerFn_handler, async () => {
	const { getVapidPublicKey } = await import("./push.server-C8LgGe03.mjs");
	return { publicKey: await getVapidPublicKey() };
});
var savePushSubscription_createServerFn_handler = createServerRpc({
	id: "11dcb0543b2739f8307b9fabfe4ff2c13d11fd5e0464f717908c2456bf5e2e27",
	name: "savePushSubscription",
	filename: "src/lib/desk/push-api.ts"
}, (opts) => savePushSubscription.__executeServer(opts));
var savePushSubscription = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(savePushSubscription_createServerFn_handler, async ({ context, data }) => {
	const { saveSubscription } = await import("./push.server-C8LgGe03.mjs");
	return saveSubscription({
		...data,
		userId: context.userId
	});
});
var dropPushSubscription_createServerFn_handler = createServerRpc({
	id: "ebf9a024314c19b45a067453fa6b269b5bf70177db374a41c0324456e6b8027a",
	name: "dropPushSubscription",
	filename: "src/lib/desk/push-api.ts"
}, (opts) => dropPushSubscription.__executeServer(opts));
var dropPushSubscription = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(dropPushSubscription_createServerFn_handler, async ({ context, data }) => {
	const { dropSubscription } = await import("./push.server-C8LgGe03.mjs");
	await dropSubscription(data.endpoint, context.userId);
	return { ok: true };
});
//#endregion
export { dropPushSubscription_createServerFn_handler, getPushPublicKey_createServerFn_handler, savePushSubscription_createServerFn_handler };
