interface AssetFetcher {
  fetch(input: Request | string | URL, init?: RequestInit): Promise<Response>;
}

interface Env {
  ASSETS: AssetFetcher;
}

export const COMPARISON_SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

export function cacheControlForPath(pathname: string): string {
  if (pathname.startsWith("/_astro/")) {
    return "public, max-age=31536000, immutable";
  }

  return "public, max-age=0, must-revalidate";
}

export function withSecurityHeaders(response: Response, request?: Request): Response {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(COMPARISON_SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  if (request && !headers.has("Cache-Control")) {
    headers.set("Cache-Control", cacheControlForPath(new URL(request.url).pathname));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env) {
    return withSecurityHeaders(await env.ASSETS.fetch(request), request);
  },
};
