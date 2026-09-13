import { createServerFn } from "@tanstack/react-start";
import { normalizeUsername, usernameError } from "@/lib/desk/profile-server";
import { clientIp, rateLimit } from "@/lib/security/limit";

export const HANDLE_EMAIL_DOMAIN = "handle.ziggywizzair.app";

export function looksLikeEmail(raw: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

export function handleEmail(nick: string) {
  return `${normalizeUsername(nick)}@${HANDLE_EMAIL_DOMAIN}`;
}

export async function emailForHandle(raw: string): Promise<string | null> {
  const handle = raw.trim().toLowerCase();
  if (!handle) return null;
  if (looksLikeEmail(handle)) return handle;
  if (usernameError(handle)) return null;
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ email: string }>`
      select u.email as email
      from desk_profiles p
      join "user" u on u.id = p.user_id
      where lower(p.username) = ${handle}
      limit 1
    `;
    return rows[0]?.email ?? handleEmail(handle);
  } catch {
    return handleEmail(handle);
  }
}

async function attachDevice(email: string, device?: string) {
  if (!device) return;
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string }>`
      select id from "user" where lower(email) = ${email.toLowerCase()} limit 1
    `;
    const userId = rows[0]?.id;
    if (!userId) return;
    const { rememberDevice } = await import("@/lib/desk/password");
    await rememberDevice(userId, device);
  } catch {
    /* device trust is best-effort */
  }
}

export const handleAvailable = createServerFn({ method: "POST" })
  .validator((input: { username: string }) => input)
  .handler(async ({ data }): Promise<{ ok: true; free: boolean } | { ok: false; error: "invalid" }> => {
    const ip = await clientIp();
    if (!rateLimit(`nick:${ip}`, 40, 60_000)) return { ok: false, error: "invalid" };
    const username = normalizeUsername(data.username ?? "");
    if (usernameError(username)) return { ok: false, error: "invalid" };
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ n: number }>`
      select 1 as n from desk_profiles where lower(username) = ${username} limit 1
    `;
    if (rows.length) return { ok: true, free: false };
    const mails = await sql<{ n: number }>`
      select 1 as n from "user" where lower(email) = ${handleEmail(username)} limit 1
    `;
    return { ok: true, free: mails.length === 0 };
  });

export const signInHandle = createServerFn({ method: "POST" })
  .validator((input: { handle: string; password: string; remember?: boolean; device?: string }) => input)
  .handler(async ({ data }): Promise<{ ok: true; token: string | null } | { ok: false; error: "bad" }> => {
    const password = data.password;
    if (password.length < 8 || password.length > 128) return { ok: false, error: "bad" };
    const ip = await clientIp();
    const handle = (data.handle ?? "").trim().toLowerCase().slice(0, 80);
    if (!rateLimit(`signin:${ip}:${handle}`, 8, 15 * 60_000)) return { ok: false, error: "bad" };
    const email = await emailForHandle(data.handle);
    if (!email) return { ok: false, error: "bad" };
    try {
      const { auth } = await import("@/lib/auth/server");
      let headers: Headers | undefined;
      try {
        const { getRequest } = await import("@tanstack/react-start/server");
        headers = getRequest().headers;
      } catch {
        headers = undefined;
      }
      const result = await auth.api.signInEmail({
        body: { email, password, rememberMe: data.remember !== false },
        ...(headers ? { headers } : {}),
      });
      const token =
        result && typeof result === "object" && "token" in result
          ? ((result as { token?: string | null }).token ?? null)
          : null;
      await attachDevice(email, data.device);
      return { ok: true, token };
    } catch {
      return { ok: false, error: "bad" };
    }
  });

async function requestHeaders(): Promise<Headers | undefined> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    return getRequest().headers;
  } catch {
    return undefined;
  }
}

export const signUpHandle = createServerFn({ method: "POST" })
  .validator((input: { username: string; password: string; device?: string }) => input)
  .handler(async ({ data }): Promise<{ ok: true; token: string | null } | { ok: false; error: "invalid" | "taken" | "bad" }> => {
    const username = normalizeUsername(data.username ?? "");
    if (usernameError(username)) return { ok: false, error: "invalid" };
    const password = data.password;
    if (password.length < 8 || password.length > 128) return { ok: false, error: "bad" };
    const ip = await clientIp();
    if (!rateLimit(`signup:${ip}`, 6, 15 * 60_000)) return { ok: false, error: "bad" };
    const mail = handleEmail(username);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const taken = await sql<{ n: number }>`
      select 1 as n from desk_profiles where lower(username) = ${username}
      union all
      select 1 as n from "user" where lower(email) = ${mail}
      limit 1
    `;
    if (taken.length) return { ok: false, error: "taken" };
    try {
      const { auth } = await import("@/lib/auth/server");
      const headers = await requestHeaders();
      const result = await auth.api.signUpEmail({
        body: { email: mail, password, name: username },
        ...(headers ? { headers } : {}),
      });
      const userId =
        result && typeof result === "object" && "user" in result
          ? (result as { user?: { id?: string } }).user?.id
          : undefined;
      if (userId) {
        try {
          await sql`
            insert into desk_profiles (user_id, username)
            values (${userId}, ${username})
          `;
        } catch {
          /* unique — already claimed */
        }
        try {
          const { snapshotVault } = await import("@/lib/desk/vault.server");
          await snapshotVault(sql);
        } catch {
          /* vault is best-effort */
        }
        if (data.device) {
          try {
            const { rememberDevice } = await import("@/lib/desk/password");
            await rememberDevice(userId, data.device);
          } catch {
            /* device trust is best-effort */
          }
        }
      }
      const token =
        result && typeof result === "object" && "token" in result
          ? ((result as { token?: string | null }).token ?? null)
          : null;
      return { ok: true, token };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (/already/i.test(msg)) return { ok: false, error: "taken" };
      return { ok: false, error: "bad" };
    }
  });
