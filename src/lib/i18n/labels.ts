import { qtyFmt } from "@/lib/format";
import { isLot } from "@/lib/market/universe";
import type { Locale, MsgKey } from "@/lib/i18n/catalog";
import { t, getLocale } from "@/lib/i18n/locale";
import type { Fill } from "@/lib/types";

const ASSET_KEYS: Record<string, MsgKey> = {
  BTC: "asset.BTC",
  ETH: "asset.ETH",
  GOLD: "asset.GOLD",
  SILVER: "asset.SILVER",
  SPY: "asset.SPY",
  NVDA: "asset.NVDA",
  AAPL: "asset.AAPL",
  TSLA: "asset.TSLA",
  MSFT: "asset.MSFT",
  AMZN: "asset.AMZN",
  META: "asset.META",
};

export function assetName(symbol: string, locale?: Locale) {
  const key = ASSET_KEYS[symbol];
  return key ? t(key, undefined, locale) : symbol;
}

/** On-screen name. Polish hides GOLD/SILVER in favor of Złoto/Srebro. */
export function assetLabel(symbol: string, locale?: Locale) {
  const loc = locale ?? getLocale();
  if (loc === "pl" && (symbol === "GOLD" || symbol === "SILVER")) return assetName(symbol, loc);
  return symbol;
}

export function fillSideLabel(side: Fill["side"], locale?: Locale) {
  return t(side === "buy" ? "fill.buy" : "fill.sell", undefined, locale);
}

export function fillSourceLabel(source: Fill["source"], locale?: Locale) {
  if (source === "council") return t("fill.source.council", undefined, locale);
  if (source === "autopilot") return t("fill.source.autopilot", undefined, locale);
  return t("fill.source.manual", undefined, locale);
}

const NOTE_KEYS: Record<string, MsgKey> = {
  "close.manual": "close.manual",
  Manual: "close.manual",
  Ręcznie: "close.manual",
  "close.manualPartial": "close.manualPartial",
  "Manual (partial)": "close.manualPartial",
  "Ręcznie (część)": "close.manualPartial",
  "close.timeSession": "close.timeSession",
  "close.timePromising": "close.timePromising",
  "close.contrary": "close.contrary",
  "close.hyperliquid": "close.hl",
  Close: "port.closeNote",
  close: "port.closeNote",
  manual: "fill.source.manual",
  council: "fill.source.council",
  autopilot: "fill.source.autopilot",
};

export function fillNoteLabel(note: string | undefined, source: Fill["source"], locale?: Locale) {
  const raw = (note ?? "").trim();
  if (NOTE_KEYS[raw]) return t(NOTE_KEYS[raw], undefined, locale);
  if (!raw) return fillSourceLabel(source, locale);
  return raw;
}

export function tapeFillText(
  fill: Pick<Fill, "side" | "qty" | "symbol" | "price" | "fee" | "note" | "source">,
  locale?: Locale,
) {
  const fee = fill.fee ? t("tape.feeBit", { usd: `$${fill.fee.toFixed(2)}` }, locale) : "";
  const line = t(
    "tape.fillLine",
    {
      side: fillSideLabel(fill.side, locale),
      qty: qtyFmt(fill.qty, isLot(fill.symbol)),
      name: assetName(fill.symbol, locale),
      px: fill.price.toFixed(2),
      fee,
    },
    locale,
  );
  const note = fillNoteLabel(fill.note, fill.source, locale);
  return note ? `${line} · ${note}` : line;
}
