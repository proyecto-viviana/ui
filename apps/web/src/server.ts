import { AsyncLocalStorage } from "node:async_hooks";
import handler, { createServerEntry } from "@tanstack/solid-start/server-entry";
import { installNonceStore } from "./csp-nonce";
import { createRequestNonce, stampWebSecurityHeaders } from "./security-headers";

// Wrangler main points at this module. The package server-entry is the handler
// wrapped here; getRouter reads the nonce from this store during the fetch.
const nonceStore = new AsyncLocalStorage<string>();
installNonceStore(nonceStore);

export default createServerEntry({
  async fetch(request, requestOptions) {
    const nonce = createRequestNonce();
    const response = await nonceStore.run(nonce, () => handler.fetch(request, requestOptions));
    return stampWebSecurityHeaders(response, nonce);
  },
});
