#!/usr/bin/env node
/**
 * Run a command with `.grok/app-env.json` merged into its environment.
 *
 * `dev`, `build` and `preview` all route through this wrapper, so the dev
 * server, the built bundle and the preview server can never disagree about
 * `VITE_AUTH_ENABLED` — a divergence that only shows up as a built-output
 * mismatch long after the fact. Anything that starts Vite directly bypasses it.
 *
 * Only `VITE_`-prefixed keys are honored from the JSON file: it is a build
 * flag carrier, not a secret store. `BETTER_AUTH_SECRET` is loaded separately
 * from `data/auth-secret` so preview sessions survive a process restart.
 *
 * A real `process.env` entry always wins, so an explicit override still works.
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { constants as osConstants } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const APP_ENV_REL_PATH = ".grok/app-env.json";
export const AUTH_SECRET_REL_PATH = "data/auth-secret";

const VITE_PREFIX = "VITE_";

/**
 * Parse an app-env document, keeping only `VITE_`-prefixed string entries.
 * Anything unparseable is an empty environment — a workspace without the file
 * must behave exactly like today (auth on, no overrides).
 */
export function parseAppEnv(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {};
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const env = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (!key.startsWith(VITE_PREFIX)) continue;
    if (typeof value !== "string") continue;
    env[key] = value;
  }
  return env;
}

/** The app env recorded under `root`, or `{}` when the file is absent. */
export function readAppEnv(root) {
  try {
    return parseAppEnv(readFileSync(join(root, APP_ENV_REL_PATH), "utf8"));
  } catch {
    return {};
  }
}

/** File values under the process environment: an explicit override wins. */
export function mergeAppEnv(appEnv, processEnv) {
  return { ...appEnv, ...processEnv };
}

/**
 * Stable Better Auth signing secret for the preview process.
 * Server.ts already reads `BETTER_AUTH_SECRET`; without this, a restart mints
 * a new one and every existing session cookie/bearer dies even though the
 * user rows are still in PGLite.
 */
export function ensureAuthSecret(root, processEnv = {}) {
  const fromEnv = typeof processEnv.BETTER_AUTH_SECRET === "string"
    ? processEnv.BETTER_AUTH_SECRET.trim()
    : "";
  if (fromEnv) return fromEnv;
  const path = join(root, AUTH_SECRET_REL_PATH);
  try {
    const existing = readFileSync(path, "utf8").trim();
    if (existing) return existing;
  } catch {
    /* first run */
  }
  const secret = randomBytes(32).toString("hex");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${secret}\n`, { encoding: "utf8", mode: 0o600 });
  return secret;
}

/**
 * Translate a child's `exit` `(code, signal)` into this process's exit status.
 *
 * Do not re-raise the signal with `process.kill(process.pid, signal)`: under
 * qemu-user (amd64 image builds on an arm host) a self-directed signal is
 * routinely delivered as SIGSEGV to the wrong process, which takes down the
 * test worker and fails the image build. `128 + signo` is what a shell reports
 * for a signal-killed command, so a cancelled `vite build` is still a failure.
 */
export function exitStatusFromChild(code, signal) {
  if (signal) {
    const signo = osConstants.signals[signal];
    return 128 + (typeof signo === "number" ? signo : 1);
  }
  return code ?? 1;
}

/** The workspace root (this file lives in `<root>/scripts/`). */
export function projectRoot() {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}

/**
 * Whether `moduleUrl` is the script node was asked to run.
 *
 * Both sides are resolved through symlinks: node realpaths `import.meta.url`
 * but leaves `process.argv[1]` as typed, so comparing them raw makes a CLI
 * launched through a symlinked path (`/tmp` on macOS) a silent no-op.
 */
export function isMainModule(moduleUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === fileURLToPath(moduleUrl);
  } catch {
    return false;
  }
}

function main(argv) {
  const [command, ...args] = argv;
  if (!command) {
    console.error("usage: node scripts/with-app-env.mjs <command> [args…]");
    process.exit(2);
  }
  const root = projectRoot();
  const env = mergeAppEnv(readAppEnv(root), process.env);
  if (!String(env.BETTER_AUTH_SECRET ?? "").trim()) {
    env.BETTER_AUTH_SECRET = ensureAuthSecret(root, env);
  }
  const child = spawn(command, args, { stdio: "inherit", env });
  // The dev server is long-running and is stopped by signalling this wrapper.
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => child.kill(signal));
  }
  child.on("error", (err) => {
    console.error(`[with-app-env] failed to run ${command}:`, err?.message || err);
    process.exit(127);
  });
  child.on("exit", (code, signal) => {
    process.exit(exitStatusFromChild(code, signal));
  });
}

if (isMainModule(import.meta.url)) {
  main(process.argv.slice(2));
}
