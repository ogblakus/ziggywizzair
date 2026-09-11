import { memo, useRef, useState, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import type { TickBar } from "@/lib/types";

export const Sparkline = memo(function Sparkline({
  data,
  up,
  className,
}: {
  data: number[];
  up: boolean;
  className?: string;
}) {
  const pts = data.length === 1 ? [data[0]!, data[0]!] : data;
  if (pts.length < 2) return null;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const w = 72;
  const h = 22;
  const d = pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={cn("overflow-visible", up ? "text-up" : "text-down", className)}
      aria-hidden
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
});

const W = 240;
const H = 88;
const PLOT_PX = 168;
const UP = "#3d9a7a";
const DOWN = "#c45c5c";

function sameBars(a: TickBar[], b: TickBar[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  const la = a.at(-1);
  const lb = b.at(-1);
  const fa = a[0];
  const fb = b[0];
  return la?.t === lb?.t && la?.px === lb?.px && fa?.t === fb?.t && fa?.px === fb?.px;
}

/** Inline SVG with a pixel height — flex/%/canvas all collapsed to 0 on iPhone. */
export const PriceArea = memo(function PriceArea({
  bars,
  up,
  onScrub,
  fill,
  resetKey,
  emptyLabel,
}: {
  bars: TickBar[];
  up: boolean;
  onScrub?: (bar: TickBar | null) => void;
  fill?: boolean;
  resetKey?: string;
  emptyLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const domain = useRef({ min: 0, max: 1, key: "" });
  const pts = bars.filter((b) => Number.isFinite(b.px));
  const box = fill
    ? { height: "100%", minHeight: 110 }
    : { height: PLOT_PX, minHeight: PLOT_PX };
  if (pts.length < 2) {
    return (
      <div className="flex w-full items-center justify-center text-sm text-muted" style={box}>
        {emptyLabel ?? "…"}
      </div>
    );
  }
  const values = pts.map((b) => b.px);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const key = resetKey ?? "";
  if (domain.current.key !== key) {
    domain.current = { min: rawMin, max: rawMax, key };
  } else {
    if (rawMin < domain.current.min) domain.current.min = rawMin;
    if (rawMax > domain.current.max) domain.current.max = rawMax;
  }
  const min = domain.current.min;
  const max = domain.current.max;
  const span = max - min || 1;
  const padY = 6;
  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = padY + (1 - (v - min) / span) * (H - padY * 2);
    return { x, y };
  });
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const i = hover != null ? Math.min(Math.max(hover, 0), coords.length - 1) : null;
  const pin = i != null ? coords[i] : null;
  const color = up ? UP : DOWN;

  function atPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const x = (e.clientX - rect.left) / rect.width;
    const next = Math.min(Math.max(Math.round(x * (pts.length - 1)), 0), pts.length - 1);
    setHover(next);
    onScrub?.(pts[next] ?? null);
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={fill ? "100%" : PLOT_PX}
      preserveAspectRatio="none"
      style={
        fill
          ? { display: "block", width: "100%", height: "100%", position: "absolute", inset: 0 }
          : { display: "block", width: "100%", height: PLOT_PX, minHeight: PLOT_PX }
      }
      className="touch-none"
      role="img"
      aria-label="Price"
      onPointerDown={atPointer}
      onPointerMove={atPointer}
      onPointerLeave={() => {
        setHover(null);
        onScrub?.(null);
      }}
    >
      <path d={area} fill={color} opacity={0.22} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {pin ? (
        <g>
          <line
            x1={pin.x}
            x2={pin.x}
            y1="0"
            y2={H}
            stroke={color}
            strokeWidth="1"
            opacity={0.45}
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={pin.x} cy={pin.y} r="2.4" fill={color} />
        </g>
      ) : null}
    </svg>
  );
}, (a, b) => a.up === b.up && a.fill === b.fill && a.resetKey === b.resetKey && sameBars(a.bars, b.bars));
