import { useLayoutEffect, useCallback, useSyncExternalStore } from "react";
import { LOCALES, type Locale, type MsgKey } from "@/lib/i18n/catalog";
import { getLocale, hydrateLocale, setLocale, subscribeLocale, t as translate, txError } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

export { LOCALES, getLocale, hydrateLocale, setLocale, txError };
export { t } from "@/lib/i18n/locale";
export type { Locale, MsgKey };

export function useLocale(): Locale {
  const locale = useSyncExternalStore(subscribeLocale, getLocale, getLocale);
  useLayoutEffect(() => {
    hydrateLocale();
  }, []);
  return locale;
}

export function useT() {
  const locale = useLocale();
  return useCallback((key: MsgKey, vars?: Record<string, string | number>) => translate(key, vars, locale), [locale]);
}

export function LanguageSwitch({ compact }: { compact?: boolean }) {
  const locale = useLocale();
  const t = useT();
  return (
    <div
      role="group"
      aria-label={t("settings.language")}
      data-language-switch=""
      className={cn("grid grid-cols-2 gap-1 rounded-lg bg-surface p-1", compact && "max-w-[12rem]")}
    >
      {LOCALES.map((row) => (
        <button
          key={row.id}
          type="button"
          onClick={() => setLocale(row.id)}
          aria-pressed={locale === row.id}
          data-locale={row.id}
          className={cn(
            "flex h-11 items-center justify-center rounded-md text-sm font-medium",
            locale === row.id ? "bg-elevated text-fg" : "text-muted",
          )}
        >
          {row.label}
        </button>
      ))}
    </div>
  );
}
