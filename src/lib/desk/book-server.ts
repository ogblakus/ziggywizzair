import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { DeskBook } from "@/lib/desk/engine";

export const loadDeskBook = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { ensureDeskLoop, loadBook } = await import("./persist.server");
    ensureDeskLoop();
    const book = await loadBook(context.userId);
    return { book, at: Date.now() };
  });

export const saveDeskBook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: DeskBook) => input)
  .handler(async ({ context, data }) => {
    const { saveFromClient, ensureDeskLoop } = await import("./persist.server");
    ensureDeskLoop();
    const { book, accepted } = await saveFromClient(context.userId, data);
    return {
      ok: true as const,
      accepted,
      lastTickAt: book.lastTickAt,
      book,
    };
  });

export const leaveDeskBook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { loadBook, persistBook, ensureDeskLoop, tickDesk } = await import("./persist.server");
    ensureDeskLoop();
    const current = await loadBook(context.userId);
    const saved = await persistBook(context.userId, current, { away: true });
    void tickDesk(undefined, { userId: context.userId }).catch(() => undefined);
    return { ok: true as const, lastTickAt: saved.lastTickAt };
  });
