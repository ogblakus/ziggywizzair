import { cn } from "@/lib/utils";

function Glyph({ symbol }: { symbol: string }) {
  if (symbol === "GOLD") {
    return (
      <svg viewBox="0 0 16 16" className="size-[62%]" aria-hidden>
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="2.3" fill="currentColor" />
      </svg>
    );
  }
  if (symbol === "SILVER") {
    return (
      <svg viewBox="0 0 16 16" className="size-[62%]" aria-hidden>
        <path fill="currentColor" d="M9.6 2.5A6.1 6.1 0 1 0 13.4 10.2 4.9 4.9 0 0 1 9.6 2.5Z" />
      </svg>
    );
  }
  if (symbol === "BTC") {
    return (
      <svg viewBox="0 0 16 16" className="size-[62%]" aria-hidden>
        <path
          fill="currentColor"
          d="M8 1.8 9.7 5.6 13.8 6 10.8 8.8 11.6 12.8 8 10.8 4.4 12.8 5.2 8.8 2.2 6 6.3 5.6Z"
        />
      </svg>
    );
  }
  if (symbol === "ETH") {
    return (
      <svg viewBox="0 0 16 16" className="size-[62%]" aria-hidden>
        <path fill="currentColor" d="M8 1.5 13.4 8.1 8 10.8Zm0 10.2 5.4-2.7L8 14.6 2.6 8Z" />
        <path fill="currentColor" opacity="0.7" d="M8 1.5 2.6 8.1 8 10.8Z" />
      </svg>
    );
  }
  if (symbol === "SPY") {
    return (
      <svg viewBox="0 0 16 16" className="size-[62%]" aria-hidden>
        <path
          d="M2.2 11.8 6 7.2 8.7 9.5 13.8 3.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return <span className="text-3xs font-semibold tracking-tight">{symbol.slice(0, 1)}</span>;
}

export function TickerMark({
  symbol,
  className,
}: {
  symbol: string;
  className?: string;
}) {
  return (
    <span
      className={cn("ticker-mark inline-flex shrink-0 items-center justify-center rounded-full", className)}
      aria-hidden
    >
      <Glyph symbol={symbol} />
    </span>
  );
}
