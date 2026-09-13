import { qtyFmt, money } from "@/lib/format";
import { isLot } from "@/lib/market/universe";
import { t } from "@/lib/i18n/locale";
import { assetName, fillNoteLabel, fillSideLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/catalog";
import { alertKindAllowed, type AlertPrefs } from "@/lib/desk/alert-prefs";
import type { ClosedTrade, Fill, ProposedOrder } from "@/lib/types";

export type FillAlert = {
  title: string;
  body: string;
  tag: string;
  url?: string;
};

export function alertForFill(fill: Fill, closed?: ClosedTrade | null, locale: Locale = "en"): FillAlert {
  const qty = qtyFmt(fill.qty, isLot(fill.symbol));
  const px = fill.price >= 100 ? fill.price.toFixed(2) : fill.price.toFixed(4);
  const name = assetName(fill.symbol, locale);
  const note = fillNoteLabel(fill.note, fill.source, locale);
  if (closed) {
    const pnl = closed.pnl >= 0 ? `+${money(closed.pnl)}` : money(closed.pnl);
    return {
      title: t("fill.closedName", { name }, locale),
      body: `P&L ${pnl} · ${note}`,
      tag: `close-${fill.symbol}`,
    };
  }
  const title = t(fill.side === "buy" ? "fill.openedLong" : "fill.openedShort", { name }, locale);
  return {
    title,
    body: `${fillSideLabel(fill.side, locale)} ${qty} @ ${px} · ${note}`,
    tag: `open-${fill.symbol}`,
  };
}

export function alertForProposal(order: ProposedOrder, locale: "en" | "pl"): FillAlert {
  const side = fillSideLabel(order.side, locale);
  const qty = qtyFmt(order.qty, isLot(order.symbol));
  const name = assetName(order.symbol, locale);
  if (locale === "pl") {
    return {
      title: "ZiggyWizzAir · rada czeka na Ciebie",
      body: `Iris proponuje ${side} ${name} (${qty}). Otwórz apkę: złóż zlecenie albo odrzuć.${order.rationale ? ` ${order.rationale.slice(0, 120)}` : ""}`,
      tag: `proposal-${order.symbol}`,
      url: "/?decide=1",
    };
  }
  return {
    title: "ZiggyWizzAir · the floor is waiting",
    body: `Iris wants to ${side} ${name} (${qty}). Open the app to place or pass.${order.rationale ? ` ${order.rationale.slice(0, 120)}` : ""}`,
    tag: `proposal-${order.symbol}`,
    url: "/?decide=1",
  };
}

export function alertsForFills(
  fills: Fill[],
  closed: ClosedTrade[],
  locale: Locale = "en",
  prefs?: AlertPrefs | null,
): FillAlert[] {
  const byId = new Map(closed.map((c) => [c.id, c]));
  return fills
    .map((f) => {
      const row = byId.get(f.id) ?? null;
      const kind = row ? "close" : "open";
      if (!alertKindAllowed(kind, prefs)) return null;
      return alertForFill(f, row, locale);
    })
    .filter((a): a is FillAlert => Boolean(a));
}