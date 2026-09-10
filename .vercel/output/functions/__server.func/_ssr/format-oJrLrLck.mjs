//#region node_modules/.nitro/vite/services/ssr/assets/format-oJrLrLck.js
function money(n, digits = 2) {
	const abs = Math.abs(n);
	const sign = n < 0 ? "-" : "";
	if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
	return `${sign}$${abs.toLocaleString("en-US", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	})}`;
}
function compactMoney(n) {
	const sign = n < 0 ? "-" : "";
	const abs = Math.abs(n);
	if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
	if (abs >= 1e4) return `${sign}$${(abs / 1e3).toFixed(1)}k`;
	return money(n, 0);
}
function compactPrice(n) {
	if (n >= 1e3) return n.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
	if (n >= 100) return n.toFixed(2);
	if (n >= 1) return n.toFixed(2);
	return n.toFixed(4);
}
function pct(n, digits = 2) {
	return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}
function qtyFmt(n, crypto) {
	const abs = Math.abs(n);
	if (crypto) return abs.toFixed(abs >= 1 ? 3 : 4);
	if (abs >= 100) return abs.toFixed(0);
	return abs.toFixed(2);
}
function signedQty(n, crypto) {
	if (n > 0) return `+${qtyFmt(n, crypto)}`;
	if (n < 0) return `-${qtyFmt(n, crypto)}`;
	return qtyFmt(n, crypto);
}
function signedClass(n) {
	if (n > 1e-7) return "text-up";
	if (n < -1e-7) return "text-down";
	return "text-muted";
}
function timeAgo(ts, now = Date.now()) {
	const s = Math.max(0, Math.floor((now - ts) / 1e3));
	if (s < 5) return "now";
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m`;
	return `${Math.floor(m / 60)}h`;
}
//#endregion
export { qtyFmt as a, timeAgo as c, pct as i, compactPrice as n, signedClass as o, money as r, signedQty as s, compactMoney as t };
