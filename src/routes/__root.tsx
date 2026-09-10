import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { APP_NAME } from "@/components/desk/brand";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { ThemeProvider, useAppearance } from "@/components/desk/theme-provider";
import { LocaleHydrator } from "@/lib/i18n/hydrator";
import { ZoomLock } from "@/components/desk/zoom-lock";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#09090b" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      {
        name: "description",
        content: "Paper-trading desk. Four AI agents, live tape, your book.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/icon-180.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Sora:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" className="dark antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem("zw-locale");if(l!=="pl"&&l!=="en"){var m=document.cookie.match(/(?:^|; )zw-locale=(pl|en)/);l=m?m[1]:((navigator.language||"").toLowerCase().indexOf("pl")===0?"pl":"en")}document.documentElement.lang=l;document.documentElement.setAttribute("data-locale",l)}catch(e){}})();`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <ZoomLock />
        <AuthProvider>
          <ThemeProvider>
            <LocaleHydrator>
              <TooltipProvider>
                <Outlet />
                <ThemedToaster />
              </TooltipProvider>
            </LocaleHydrator>
          </ThemeProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});

function ThemedToaster() {
  const { resolved } = useAppearance();
  return (
    <Toaster
      theme={resolved}
      position="bottom-right"
      toastOptions={{
        className: "bg-elevated text-fg shadow-[var(--shadow-border)]",
      }}
    />
  );
}