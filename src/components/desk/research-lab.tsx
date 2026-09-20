import { useEffect, useMemo, useState } from "react";
import { loadResearchLab, type ResearchLabPayload } from "@/lib/agents/research-api";
import { ALPHA_RESEARCH_VERSION } from "@/lib/agents/research";
import { useDesk } from "@/lib/desk-store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <dt className="text-2xs text-subtle">{k}</dt>
      <dd className="font-mono text-2xs tabular-nums text-fg">{v}</dd>
    </div>
  );
}

function fmt(n: number | null | undefined, d = 3) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(d);
}

function barClock(barT: number | null) {
  if (barT == null) return "—";
  return new Date(barT).toISOString().slice(11, 16) + "Z";
}

export function ResearchLab() {
  const t = useT();
  const selected = useDesk((s) => s.selected);
  const [open, setOpen] = useState<"vol" | "alpha" | "xs" | "factors">("vol");
  const [lab, setLab] = useState<ResearchLabPayload | null>(null);

  useEffect(() => {
    let live = true;
    const pull = () => {
      void loadResearchLab({ data: {} })
        .then((payload) => {
          if (live) setLab(payload);
        })
        .catch(() => {
          if (live) {
            setLab({
              version: ALPHA_RESEARCH_VERSION,
              stored: false,
              barT: null,
              rows: [],
              diagnostics: {
                count: 0,
                lastBarT: null,
                lastInserted: 0,
                lastDuplicate: 0,
                lastError: "load failed",
                missingSymbols: [],
                gaps: [],
                lastTrigger: null,
                lastRunAt: null,
              },
            });
          }
        });
    };
    pull();
    const id = window.setInterval(pull, 15_000);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, []);

  const row = useMemo(() => {
    if (!lab?.rows.length) return null;
    return lab.rows.find((r) => r.symbol === selected) ?? lab.rows[0] ?? null;
  }, [lab, selected]);

  const factors = row?.factors;
  const enough = Boolean(factors?.sufficient);
  const stored = Boolean(lab?.stored);
  const diag = lab?.diagnostics;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-2xs font-medium tracking-[0.16em] text-subtle uppercase">{t("desk.lab")}</p>
          <p className="mt-0.5 text-2xs text-muted">{t("desk.labOnly")}</p>
        </div>
        <span className="font-mono text-2xs text-subtle">{row?.symbol ?? selected}</span>
      </div>

      <p className="mt-1 font-mono text-2xs text-subtle">
        {stored
          ? `${t("desk.labCount", { n: diag?.count ?? 0 })} · ${t("desk.labLast", { t: barClock(lab?.barT ?? diag?.lastBarT ?? null) })}`
          : t("desk.labNone")}
        {diag?.missingSymbols.length ? ` · ${t("desk.labMissing", { s: diag.missingSymbols.join(",") })}` : ""}
        {diag?.gaps?.length ? ` · ${t("desk.labGaps", { n: diag.gaps.reduce((a, g) => a + g.bars, 0) })}` : ""}
        {diag?.lastError ? ` · ${t("desk.labError")}` : ""}
        {diag?.lastTrigger ? ` · ${t("desk.labTrigger", { s: diag.lastTrigger })}` : ""}
        {diag?.lastRunAt ? ` · ${t("desk.labRun", { t: barClock(diag.lastRunAt) })}` : ""}
      </p>

      <div className="mt-2 flex flex-wrap gap-1">
        {(["vol", "alpha", "xs", "factors"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setOpen(id)}
            className={cn(
              "rounded-md px-2 py-1 text-2xs uppercase tracking-wide",
              open === id ? "bg-surface text-fg" : "text-subtle hover:text-fg",
            )}
          >
            {t(`desk.${id === "vol" ? "vol" : id === "alpha" ? "alpha" : id === "xs" ? "xs" : "factors"}`)}
          </button>
        ))}
      </div>

      <dl className="mt-2 min-h-0 flex-1 overflow-y-auto">
        {!stored ? (
          <p className="mt-2 text-2xs tracking-wide text-subtle uppercase">{t("desk.insufficient")}</p>
        ) : open === "vol" ? (
          <>
            <Cell k={t("desk.atr")} v={fmt(row?.atr, 4)} />
            <Cell k={t("desk.atrPct")} v={fmt(row?.atrPct, 3)} />
            <Cell k={t("desk.signedMove")} v={fmt(row?.signedMove, 3)} />
            <Cell k="normalizedMove" v={fmt(row?.normalizedMove, 3)} />
          </>
        ) : open === "alpha" ? (
          <>
            <Cell k="Vesper lean" v={fmt(row?.vesperLean, 3)} />
            <Cell k="Ash lean" v={fmt(row?.ashLean, 3)} />
            <Cell k={t("desk.signedMove")} v={fmt(row?.signedMove, 3)} />
          </>
        ) : open === "xs" ? (
          <>
            <Cell k="robust-z" v={fmt(row?.xs, 3)} />
            <Cell k="sufficient" v={row?.sufficient ? "yes" : "no"} />
          </>
        ) : (
          <>
            <Cell k={t("desk.marketBeta")} v={enough ? fmt(factors?.marketBeta, 3) : "—"} />
            <Cell k={t("desk.marketRes")} v={enough ? fmt(factors?.marketResidual, 3) : "—"} />
            <Cell k={t("desk.sectorBeta")} v={enough ? fmt(factors?.sectorBeta, 3) : "—"} />
            <Cell k={t("desk.sectorRes")} v={enough ? fmt(factors?.sectorResidual, 3) : "—"} />
            <Cell k={t("desk.nObs")} v={String(factors?.observationCount ?? 0)} />
            {!enough ? (
              <p className="mt-2 text-2xs tracking-wide text-subtle uppercase">{t("desk.insufficient")}</p>
            ) : null}
          </>
        )}
      </dl>
    </section>
  );
}
