import { useLayoutEffect, type ReactNode } from "react";
import { hydrateLocale, useLocale } from "@/lib/i18n";

export function LocaleHydrator({ children }: { children: ReactNode }) {
  const locale = useLocale();
  useLayoutEffect(() => {
    hydrateLocale();
  }, []);
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.setAttribute("data-locale", locale);
  }, [locale]);
  return children;
}