/**
 * Environment detection utilities.
 * These avoid direct references to process.env which can cause TypeScript issues in browser environments.
 * Compatible with Node.js and Vite environments.
 *
 * This is a local runtime helper. It has no direct React Aria counterpart.
 */

type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, unknown> & { DEV?: boolean; PROD?: boolean };
};
type ProcessLike = { env?: Record<string, string | undefined> };

function getEnvVar(key: string): string | undefined {
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
