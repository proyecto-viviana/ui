interface AssetFetcher {
  fetch(input: Request | string | URL, init?: RequestInit): Promise<Response>;
}

interface Env {
  ASSETS: AssetFetcher;
}

const COMPARISON_CSP_BASE: ReadonlyArray<readonly [string, string]> = [
  ["default-src", "'self'"],
  ["script-src", "'self'"],
  ["style-src", "'self' 'unsafe-inline'"],
  ["style-src-attr", "'unsafe-inline'"],
  ["font-src", "'self' https://use.typekit.net"],
  [
    "img-src",
    "'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://i.imgur.com",
  ],
  ["connect-src", "'self'"],
  ["frame-src", "'self'"],
  ["frame-ancestors", "'self'"],
  ["object-src", "'none'"],
  ["base-uri", "'self'"],
  ["form-action", "'self'"],
];

const SCRIPT_PATTERN = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

export function comparisonContentSecurityPolicy(scriptHashes: readonly string[] = []): string {
  return COMPARISON_CSP_BASE.map(([name, value]) => {
    if (name === "script-src" && scriptHashes.length > 0) {
      return `${name} ${value} ${scriptHashes.join(" ")}`;
    }
    return `${name} ${value}`;
  }).join("; ");
}

export const COMPARISON_SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": comparisonContentSecurityPolicy(),
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

function isExecutableInlineScript(attrs: string): boolean {
  if (/\bsrc\s*=/i.test(attrs)) return false;
  const type = /\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(attrs);
  const value = (type?.[1] ?? type?.[2] ?? type?.[3] ?? "").trim().toLowerCase();
  if (!value) return true;
  return (
    value === "module" ||
    value === "text/javascript" ||
    value === "application/javascript" ||
    value === "application/ecmascript" ||
    value === "text/ecmascript"
  );
}

function inlineScriptBodies(html: string): string[] {
  const bodies: string[] = [];
  for (const match of html.matchAll(SCRIPT_PATTERN)) {
    if (!isExecutableInlineScript(match[1] ?? "")) continue;
    bodies.push(match[2] ?? "");
  }
  return bodies;
}

async function sha256Base64(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  const bytes = new Uint8Array(digest);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function inlineScriptHashes(html: string): Promise<string[]> {
  const hashes: string[] = [];
  const seen = new Set<string>();
  for (const body of inlineScriptBodies(html)) {
    const hash = `'sha256-${await sha256Base64(body)}'`;
    if (seen.has(hash)) continue;
    seen.add(hash);
    hashes.push(hash);
  }
  return hashes;
}

// Inline script bytes change every Astro build, so script-src hashes are taken
// from the HTML body. style-src stays 'unsafe-inline': pages set style
// attributes and publish no csp-nonce. script-src has neither 'unsafe-inline'
// nor 'unsafe-eval'.
export async function withSecurityHeaders(
  response: Response,
  request?: Request,
): Promise<Response> {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(COMPARISON_SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  const contentType = headers.get("content-type") ?? "";
  let body: BodyInit | null = response.body;
  if (contentType.includes("text/html") && response.body !== null) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    const hashes = await inlineScriptHashes(new TextDecoder().decode(bytes));
    headers.set("Content-Security-Policy", comparisonContentSecurityPolicy(hashes));
    body = bytes;
  }

  if (request && !headers.has("Cache-Control")) {
    headers.set("Cache-Control", cacheControlForPath(new URL(request.url).pathname));
  }

  return new Response(body, {
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
