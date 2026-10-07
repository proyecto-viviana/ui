export const CSP_NONCE_KEY = Symbol.for("proyecto-viviana.csp-nonce");

type NonceStore = {
  getStore(): string | undefined;
};

export function installNonceStore(store: NonceStore): void {
  (globalThis as Record<symbol, NonceStore>)[CSP_NONCE_KEY] = store;
}

export function readScriptNonce(): string | undefined {
  const store = (globalThis as Record<symbol, NonceStore | undefined>)[CSP_NONCE_KEY];
  const value = store?.getStore();
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
