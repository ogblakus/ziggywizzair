import { useLayoutEffect, type ReactNode } from "react";
import { hydrateLocale, useLocale } from "@/lib/i18n";
import { useDesk } from "@/lib/desk-store";

export function LocaleHydrator({ children }: { children: ReactNode }) {
  const locale = useLocale();
  useLayoutEffect(() => {
    hydrateLocale();
  }, []);
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.setAttribute("data-locale", locale);
    useDesk.setState({ locale });
  }, [locale]);
  return children;
}