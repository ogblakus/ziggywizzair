import { t as __exportAll } from "./rolldown-runtime-BBjsoOtd.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-D75-wYbG.mjs";
import { T as runLocalV2 } from "./local-v2-PvgmS_Qo.mjs";
import { t as authMiddleware } from "./middleware-Nk1Kc5zC.mjs";
import { i as runOrchestrator } from "./orchestrator-BUt8YdF0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/council-B6kDihVd.js
var council_exports = /* @__PURE__ */ __exportAll({
	askFloor: () => askFloor,
	conveneCouncil: () => conveneCouncil,
	runCouncilSession: () => runCouncilSession
});
async function runCouncilSession(data) {
	const snap = data.snap;
	const locale = data.locale === "pl" ? "pl" : "en";
	if (!snap.tickers?.length) return {
		ok: false,
		error: "Council payload too large."
	};
	try {
		return {
			ok: true,
			result: (await runOrchestrator({
				snap,
				selected: data.selected ?? null,
				locale
			})).result
		};
	} catch {
		return {
			ok: true,
			result: runLocalV2({
				snap,
				selected: data.selected ?? null,
				locale
			})
		};
	}
}
var conveneCouncil = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("53881b375384a18162b7ca1787b680b3eb6d294180d70aa1bdaffe14fae37181"));
var askFloor = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("06af118d79fe5ca379095b3430783683b1e862954f62a809c1317e28038a0981"));
//#endregion
export { conveneCouncil as n, council_exports as r, askFloor as t };
