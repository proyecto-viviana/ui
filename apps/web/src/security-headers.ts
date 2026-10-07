// Theme boot lives in routes/__root.tsx and cannot take a nonce without a page
// edit, so script-src carries this hash. The policy does not nonce styles: a
// style nonce would ignore style-src 'unsafe-inline'.
export const THEME_BOOT_SCRIPT =
  "(function(){try{var t=localStorage.getItem('pv-theme');var s=(t==='dark'||t==='light')?t:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-color-scheme',s)}catch(e){}})()";

export const THEME_BOOT_SCRIPT_HASH = "sha256-iC64X0Cikwe/bCDsCqifz617QXCaEvzXcERXp/aG1UY=";

export const WEB_SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-Frame-Options": "DENY",
};

export function webContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' '${THEME_BOOT_SCRIPT_HASH}'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function createRequestNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function stampWebSecurityHeaders(response: Response, nonce: string): Response {
  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", webContentSecurityPolicy(nonce));
  for (const [name, value] of Object.entries(WEB_SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
