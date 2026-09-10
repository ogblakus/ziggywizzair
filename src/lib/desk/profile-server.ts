import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

const USERNAME_RE = /^[a-z][a-z0-9_]{2,19}$/;
const RESERVED = new Set([
  "ziggy",
  "ziggywizzair",
  "wizzair",
  "admin",
  "system",
  "desk",
  "tape",
  "floor",
  "iris",
  "vesper",
  "ash",
  "kai",
  "damian",
  "kaczmarski",
]);

export function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

export function usernameError(raw: string): string | null {
  const name = normalizeUsername(raw);
  if (!USERNAME_RE.test(name)) {
    return "3–20 characters. Start with a letter. Only a–z, 0–9, underscore.";
  }
  if (RESERVED.has(name)) return "That handle is reserved.";
  return null;
}

type ProfileRow = { username: string };

export const loadProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<ProfileRow>`
      select username from desk_profiles where user_id = ${context.userId} limit 1
    `;
    return { username: rows[0]?.username ?? null };
  });

export const claimUsername = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { username: string }) => input)
  .handler(async ({ context, data }) => {
    const username = normalizeUsername(data.username ?? "");
    const invalid = usernameError(username);
    if (invalid) return { ok: false as const, error: invalid, username: null };

    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    try {
      const mine = await sql<ProfileRow>`
        select username from desk_profiles where user_id = ${context.userId} limit 1
      `;
      if (mine[0]?.username) {
        return { ok: true as const, username: mine[0].username, locked: true as const };
      }
      await sql`
        insert into desk_profiles (user_id, username)
        values (${context.userId}, ${username})
      `;
      try {
        const { snapshotVault } = await import("@/lib/desk/vault.server");
        await snapshotVault(sql);
      } catch {
        /* vault is best-effort */
      }
      return { ok: true as const, username, locked: true as const };
    } catch {
      return { ok: false as const, error: "That handle is taken.", username: null };
    }
  });
