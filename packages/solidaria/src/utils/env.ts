/**
 * Environment detection utilities.
 *
 * Avoids direct references to `process.env` which can cause TypeScript issues in browser
 * environments and declaration builds (where `tsconfig.build.json` omits `types: ["node"]`).
 * Compatible with Node.js, bundlers, and Vite environments.
 *
 * Behaviour notes:
 * - `getEnv()` reads `globalThis.process?.env ?? {}`, providing safe access to the entire
 *   process environment map without ambient Node types.
 * - `getEnvVar(key)` checks `import.meta.env[key]` first (Vite/bundler convention),
 *   then falls back to `globalThis.process?.env?.[key]` (Node/bundler convention).
 * - `isDevEnv()` checks `import.meta.env.DEV` first, falling back to
 *   `getEnvVar("NODE_ENV") !== "production"`. Under Vite, `import.meta.env.DEV` reflects
 *   the Vite dev server mode even if `NODE_ENV` is unset or differs; under Node it checks
 *   `NODE_ENV !== "production"`. Both callers intending dev-only warnings and macro dev-mode
 *   branching benefit from Vite dev mode awareness.
 * - `isProdEnv()` checks `import.meta.env.PROD` first, falling back to
 *   `getEnvVar("NODE_ENV") === "production"`.
 * - `isTestEnv()` checks `getEnvVar("NODE_ENV") === "test"`.
 *
 * This is a local runtime helper. It has no direct React Aria counterpart.
 */

type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, unknown> & { DEV?: boolean; PROD?: boolean };
};
type ProcessLike = { env?: Record<string, string | undefined> };

/**
 * Reads a single environment variable, checking import.meta.env first (Vite),
 * then globalThis.process?.env (Node/bundlers).
 */
export function getEnvVar(key: string): string | undefined {
  const importMetaEnv = (import.meta as ImportMetaWithEnv).env;
  if (importMetaEnv && typeof importMetaEnv[key] === "string") {
    return importMetaEnv[key] as string;
  }

  const processEnv = (globalThis as typeof globalThis & { process?: ProcessLike }).process?.env;
  if (processEnv) {
    return processEnv[key];
  }
  return undefined;
}

/**
 * Reads the entire process environment dictionary, returning an empty record
 * when running in browser environments without a global process object.
 */
export function getEnv(): Record<string, string | undefined> {
  const processEnv = (globalThis as typeof globalThis & { process?: ProcessLike }).process?.env;
  return processEnv ?? {};
}

/**
 * Check if we're running in a test environment.
 */
export function isTestEnv(): boolean {
  return getEnvVar("NODE_ENV") === "test";
}

/**
 * Check if we're running in a development environment (not production).
 */
export function isDevEnv(): boolean {
  const importMetaEnv = (import.meta as ImportMetaWithEnv).env;
  if (importMetaEnv?.DEV === true) {
    return true;
  }
  const nodeEnv = getEnvVar("NODE_ENV");
  return nodeEnv !== "production";
}

/**
 * Check if we're running in production.
 */
export function isProdEnv(): boolean {
  const importMetaEnv = (import.meta as ImportMetaWithEnv).env;
  if (importMetaEnv?.PROD === true) {
    return true;
  }
  return getEnvVar("NODE_ENV") === "production";
}
