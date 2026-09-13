import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { clientIp, rateLimit } from "@/lib/security/limit";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function normalizeDevice(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(s) ? s : null;
}

function mintRecoveryCode(bytes: Uint8Array) {
  let body = "";
  for (let i = 0; i < 12; i++) {
    body += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
    if (i === 3 || i === 7) body += "-";
  }
  return body;
}

function normalizeRecovery(raw: string) {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function cryptoBits() {
  const { randomBytes, createHash } = await import("node:crypto");
  const { hashPassword, verifyPassword } = await import("better-auth/crypto");
  const digest = (raw: string) => createHash("sha256").update(raw).digest("hex");
  return { randomBytes, digest, hashPassword, verifyPassword };
}

async function userIdForHandle(handle: string): Promise<string | null> {
  const { emailForHandle } = await import("@/lib/desk/login-handle");
  const email = await emailForHandle(handle);
  if (!email) return null;
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    select id from "user" where lower(email) = ${email.toLowerCase()} limit 1
  `;
  return rows[0]?.id ?? null;
}

async function writePassword(userId: string, password: string) {
  const { randomBytes, hashPassword } = await cryptoBits();
  const hashed = await hashPassword(password);
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    select id from account
    where "userId" = ${userId} and "providerId" = 'credential'
    limit 1
  `;
  const now = new Date().toISOString();
  if (rows[0]?.id) {
    await sql`
      update account
      set password = ${hashed}, "updatedAt" = ${now}
      where id = ${rows[0].id}
    `;
  } else {
    const id = randomBytes(16).toString("hex");
    await sql`
      insert into account (
        id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
      ) values (
        ${id}, ${userId}, 'credential', ${userId}, ${hashed}, ${now}, ${now}
      )
    `;
  }
  try {
    const { snapshotVault } = await import("@/lib/desk/vault.server");
    await snapshotVault(sql);
  } catch {
    /* vault is best-effort */
  }
}

export async function rememberDevice(userId: string, device: string) {
  const token = normalizeDevice(device);
  if (!token) return;
  const { randomBytes, digest } = await cryptoBits();
  const tokenHash = digest(token);
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const id = randomBytes(12).toString("hex");
  const now = new Date().toISOString();
  await sql`
    insert into desk_devices (id, user_id, token_hash, created_at, last_seen)
    values (${id}, ${userId}, ${tokenHash}, ${now}, ${now})
    on conflict (token_hash) do update
      set user_id = excluded.user_id, last_seen = excluded.last_seen
  `;
  const extra = await sql<{ id: string }>`
    select id from desk_devices
    where user_id = ${userId}
    order by last_seen desc
    offset 8
  `;
  for (const row of extra) {
    await sql`delete from desk_devices where id = ${row.id}`;
  }
}

async function deviceOwns(userId: string, device: string) {
  const token = normalizeDevice(device);
  if (!token) return false;
  const { digest } = await cryptoBits();
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ n: number }>`
    select 1 as n from desk_devices
    where user_id = ${userId} and token_hash = ${digest(token)}
    limit 1
  `;
  return rows.length > 0;
}

async function recoveryMatches(userId: string, code: string) {
  const normalized = normalizeRecovery(code);
  if (normalized.length < 8) return false;
  const { verifyPassword } = await cryptoBits();
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ code_hash: string }>`
    select code_hash from desk_recovery where user_id = ${userId} limit 1
  `;
  const hash = rows[0]?.code_hash;
  if (!hash) return false;
  try {
    return await verifyPassword({ hash, password: normalized });
  } catch {
    return false;
  }
}

export const passwordStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const cred = await sql<{ n: number }>`
      select 1 as n from account
      where "userId" = ${context.userId}
        and "providerId" = 'credential'
        and password is not null
      limit 1
    `;
    const rec = await sql<{ n: number }>`
      select 1 as n from desk_recovery where user_id = ${context.userId} limit 1
    `;
    return { hasPassword: cred.length > 0, hasRecovery: rec.length > 0 };
  });

export const changeDeskPassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { current?: string; next: string }) => input)
  .handler(
    async ({
      context,
      data,
    }): Promise<{ ok: true } | { ok: false; error: "bad" | "current" | "short" }> => {
      const next = data.next ?? "";
      if (next.length < 8 || next.length > 128) return { ok: false, error: "short" };
      const ip = await clientIp();
      if (!rateLimit(`pwchange:${ip}:${context.userId}`, 8, 15 * 60_000)) {
        return { ok: false, error: "bad" };
      }
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      const rows = await sql<{ password: string | null }>`
        select password from account
        where "userId" = ${context.userId} and "providerId" = 'credential'
        limit 1
      `;
      const existing = rows[0]?.password;
      if (existing) {
        const current = data.current ?? "";
        const { verifyPassword } = await cryptoBits();
        let ok = false;
        try {
          ok = await verifyPassword({ hash: existing, password: current });
        } catch {
          ok = false;
        }
        if (!ok) return { ok: false, error: "current" };
      }
      await writePassword(context.userId, next);
      return { ok: true };
    },
  );

export const issueRecoveryCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ ok: true; code: string } | { ok: false }> => {
    const ip = await clientIp();
    if (!rateLimit(`pwrec:${ip}:${context.userId}`, 6, 60 * 60_000)) return { ok: false };
    const { randomBytes, hashPassword } = await cryptoBits();
    const code = mintRecoveryCode(randomBytes(12));
    const hashed = await hashPassword(normalizeRecovery(code));
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const now = new Date().toISOString();
    await sql`
      insert into desk_recovery (user_id, code_hash, created_at)
      values (${context.userId}, ${hashed}, ${now})
      on conflict (user_id) do update set code_hash = excluded.code_hash, created_at = excluded.created_at
    `;
    return { ok: true, code };
  });

export const trustThisDevice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { device: string }) => input)
  .handler(async ({ context, data }) => {
    await rememberDevice(context.userId, data.device);
    return { ok: true as const };
  });

export const resetDeskPassword = createServerFn({ method: "POST" })
  .validator((input: { handle: string; password: string; device?: string; recovery?: string }) => input)
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: "bad" | "short" }> => {
    const password = data.password ?? "";
    if (password.length < 8 || password.length > 128) return { ok: false, error: "short" };
    const ip = await clientIp();
    const handle = (data.handle ?? "").trim().toLowerCase().slice(0, 80);
    if (!handle) return { ok: false, error: "bad" };
    if (!rateLimit(`pwreset:${ip}:${handle}`, 6, 15 * 60_000)) return { ok: false, error: "bad" };

    const userId = await userIdForHandle(data.handle);
    if (!userId) {
      const { hashPassword } = await cryptoBits();
      await hashPassword("timing-pad-password");
      return { ok: false, error: "bad" };
    }

    const viaDevice = data.device ? await deviceOwns(userId, data.device) : false;
    const viaRecovery = data.recovery ? await recoveryMatches(userId, data.recovery) : false;
    if (!viaDevice && !viaRecovery) return { ok: false, error: "bad" };

    await writePassword(userId, password);
    if (data.device) await rememberDevice(userId, data.device);
    return { ok: true };
  });
