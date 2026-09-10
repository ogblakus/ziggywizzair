import { qtyFmt, money } from "@/lib/format";
import { isLot } from "@/lib/market/universe";
import type { ClosedTrade, Fill, ProposedOrder } from "@/lib/types";

export type FillAlert = {
  title: string;
  body: string;
  tag: string;
  url?: string;
};

export function alertForFill(fill: Fill, closed?: ClosedTrade | null): FillAlert {
  const qty = qtyFmt(fill.qty, isLot(fill.symbol));
  const px = fill.price >= 100 ? fill.price.toFixed(2) : fill.price.toFixed(4);
  if (closed) {
    const pnl = closed.pnl >= 0 ? `+${money(closed.pnl)}` : money(closed.pnl);
    return {
      title: `ZiggyWizzAir closed ${fill.symbol}`,
      body: `P&L ${pnl}${fill.note ? ` · ${fill.note.slice(0, 120)}` : ""}`,
      tag: `close-${fill.symbol}`,
    };
  }
  const opened = fill.side === "buy" ? "long" : "short";
  return {
    title: `ZiggyWizzAir opened ${fill.symbol} ${opened}`,
    body: `${fill.side.toUpperCase()} ${qty} @ ${px}${fill.note ? ` · ${fill.note.slice(0, 120)}` : ""}`,
    tag: `open-${fill.symbol}`,
  };
}

export function alertForProposal(order: ProposedOrder, locale: "en" | "pl"): FillAlert {
  const side = order.side === "buy"
    ? locale === "pl" ? "KUP" : "BUY"
    : locale === "pl" ? "SPRZEDAJ" : "SELL";
  const qty = qtyFmt(order.qty, isLot(order.symbol));
  if (locale === "pl") {
    return {
      title: "ZiggyWizzAir · rada czeka na Ciebie",
      body: `Iris proponuje ${side} ${order.symbol} (${qty}). Otwórz apkę: złóż zlecenie albo odrzuć.${order.rationale ? ` ${order.rationale.slice(0, 120)}` : ""}`,
      tag: `proposal-${order.symbol}`,
      url: "/?decide=1",
    };
  }
  return {
    title: "ZiggyWizzAir · the floor is waiting",
    body: `Iris wants to ${side} ${order.symbol} (${qty}). Open the app to place or pass.${order.rationale ? ` ${order.rationale.slice(0, 120)}` : ""}`,
    tag: `proposal-${order.symbol}`,
    url: "/?decide=1",
  };
}

export function alertsForFills(fills: Fill[], closed: ClosedTrade[]): FillAlert[] {
  const byId = new Map(closed.map((c) => [c.id, c]));
  return fills.map((f) => alertForFill(f, byId.get(f.id) ?? null));
}