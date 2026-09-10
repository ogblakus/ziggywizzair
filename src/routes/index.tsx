import { createFileRoute } from "@tanstack/react-router";
import { markBootSplash, TakeoffSplash } from "@/components/desk/brand";
import { DeskApp } from "@/components/desk/desk-app";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import type { LiveMarketResult } from "@/lib/market/quotes";

export const Route = createFileRoute("/")({
  loader: (): LiveMarketResult => ({ ok: false, error: "boot" }),
  staleTime: Infinity,
  pendingMs: Infinity,
  component: Home,
});

function Home() {
  const boot = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    markBootSplash();
    return <TakeoffSplash cycle />;
  }
  if (!user) return <RedirectToSignIn />;
  return <DeskApp boot={boot} />;
}