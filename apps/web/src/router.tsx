import { createRouter } from "@tanstack/solid-router";
import { routeTree } from "./routeTree.gen";
import { readScriptNonce } from "./csp-nonce";

export function getRouter() {
  const nonce = readScriptNonce();
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    ...(nonce ? { ssr: { nonce } } : {}),
  });
  return router;
}

declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
