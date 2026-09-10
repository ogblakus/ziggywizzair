import { agentShort } from "@/lib/agents/personas";
import { timeAgo } from "@/lib/format";
import { useDesk } from "@/lib/desk-store";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useTradingMode } from "@/lib/trading-mode";
import type { TapeItem } from "@/lib/types";

function visibleOnLane(item: TapeItem, mode: "demo" | "live") {
  const lane = item.lane ?? (item.kind === "news" ? "market" : "demo");
  return lane === "market" || lane === mode;
}

export function TapePanel() {
  const tape = useDesk((s) => s.tape);
  const clock = useDesk((s) => s.clock);
  const mode = useTradingMode((s) => s.mode);
  const t = useT();
  const rows = tape.filter((item) => visibleOnLane(item, mode));

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <h2 className="px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase">
        {t("tape.title")}
      </h2>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {rows.length === 0 ? (
          <li className="px-1 text-sm text-muted">{t("tape.wait")}</li>
        ) : (
          rows.map((item) => {
            const who =
              item.kind === "agent" && item.agentId
                ? agentShort(item.agentId)
                : item.kind === "fill"
                  ? t("tape.fill")
                  : item.kind === "news"
                    ? t("tape.wire")
                    : null;
            return (
              <li key={item.id} className="flex gap-2 rounded-lg px-1 py-1.5 text-xs leading-relaxed">
                <span className="w-12 shrink-0 font-mono text-2xs text-subtle tabular-nums">
                  {timeAgo(item.ts, clock)}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 text-muted",
                    (item.kind === "fill" || item.kind === "agent") && "text-fg",
                  )}
                >
                  {who ? <span className="text-subtle">{who} · </span> : null}
                  {item.text}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}