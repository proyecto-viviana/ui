import { createHash, webcrypto } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { COMPARISON_SECURITY_HEADERS, cacheControlForPath, withSecurityHeaders } from "./worker";

// The root Vitest config runs this file in jsdom, which has no SubtleCrypto.
// The deployed worker uses crypto.subtle, so the test installs that same API.
if (globalThis.crypto?.subtle === undefined) {
  Object.defineProperty(globalThis.crypto, "subtle", {
    configurable: true,
    value: webcrypto.subtle,
  });
}

function comparisonWrangler(): string {
  const candidates = [path.resolve(moduleDir(import.meta.url), "../wrangler.jsonc")];
  candidates.push(path.resolve("apps/comparison/wrangler.jsonc"), path.resolve("wrangler.jsonc"));
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error(`comparison wrangler.jsonc not found from ${import.meta.url}`);
  return readFileSync(found, "utf8");
}

function moduleDir(moduleUrl: string): string {
  if (moduleUrl.startsWith("file:")) return path.dirname(fileURLToPath(moduleUrl));
  try {
    let pathname = decodeURIComponent(new URL(moduleUrl).pathname);
    if (pathname.startsWith("/@fs/")) pathname = pathname.slice("/@fs".length);
    if (existsSync(pathname)) return path.dirname(pathname);
  } catch {
    // Vite's test URL is not always a file URL under vmThreads.
  }
  return process.cwd();
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("base64");
}

describe("comparison worker security headers", () => {
  it("stamps the production header set onto an assets response", async () => {
    const stamped = await withSecurityHeaders(
      new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
    );

    expect(stamped.status).toBe(200);
    expect(stamped.headers.get("content-type")).toBe("text/html; charset=utf-8");

    for (const [name, value] of Object.entries(COMPARISON_SECURITY_HEADERS)) {
      expect(stamped.headers.get(name)).toBe(value);
    }

    await expect(stamped.text()).resolves.toBe("<html></html>");
  });

  it("keeps a 404 status so not-found handling is not turned into 200", async () => {
    const stamped = await withSecurityHeaders(new Response("missing", { status: 404 }));

    expect(stamped.status).toBe(404);
    expect(stamped.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(stamped.headers.get("Content-Security-Policy")).toBe(
      COMPARISON_SECURITY_HEADERS["Content-Security-Policy"],
    );
    await expect(stamped.text()).resolves.toBe("missing");
  });

  it("sets immutable cache on hashed assets and revalidates HTML", async () => {
    expect(cacheControlForPath("/_astro/react-runtime.AbCd.js")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(cacheControlForPath("/components/button/")).toBe("public, max-age=0, must-revalidate");

    const hashed = await withSecurityHeaders(
      new Response("js", { headers: { "content-type": "text/javascript" } }),
      new Request("https://comparison.example/_astro/chunk.js"),
    );
    expect(hashed.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");

    const html = await withSecurityHeaders(
      new Response("<html></html>", { headers: { "content-type": "text/html" } }),
      new Request("https://comparison.example/coverage/"),
    );
    expect(html.headers.get("Cache-Control")).toBe("public, max-age=0, must-revalidate");
  });

  it("does not overwrite a Cache-Control the asset already set", async () => {
    const stamped = await withSecurityHeaders(
      new Response("js", {
        headers: { "Cache-Control": "public, max-age=60" },
      }),
      new Request("https://comparison.example/_astro/chunk.js"),
    );

    expect(stamped.headers.get("Cache-Control")).toBe("public, max-age=60");
  });

  it("pins the CSP contract on the worker header map and the wrangler entry", () => {
    const policy = COMPARISON_SECURITY_HEADERS["Content-Security-Policy"] ?? "";
    const scriptSrc = policy.split("; ").find((directive) => directive.startsWith("script-src "));

    expect(comparisonWrangler()).toMatch(/"main":\s*"\.\/src\/worker\.ts"/);
    expect(scriptSrc).toBe("script-src 'self'");
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(policy).toContain("style-src 'self' 'unsafe-inline'");
    expect(policy).toContain("style-src-attr 'unsafe-inline'");
    expect(policy).toContain("font-src 'self' https://use.typekit.net");
    expect(policy).toContain("https://images.unsplash.com");
    expect(policy).toContain("https://plus.unsplash.com");
    expect(policy).toContain("https://i.imgur.com");
    expect(policy).toContain("frame-src 'self'");
    expect(policy).toContain("frame-ancestors 'self'");
    expect(policy).not.toContain("require-corp");
    expect(COMPARISON_SECURITY_HEADERS["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(COMPARISON_SECURITY_HEADERS["Cross-Origin-Embedder-Policy"]).toBeUndefined();
  });

  it("hashes executable inline scripts and leaves external scripts and the body unchanged", async () => {
    const inline = "document.documentElement.dataset.ready='1'";
    const html = [
      `<script>${inline}</script>`,
      `<script src="/theme.js">${inline}</script>`,
      `<script type="application/ld+json">{"@type":"Thing"}</script>`,
      `<script type="module">run()</script>`,
      `<script>${inline}</script>`,
    ].join("");
    const stamped = await withSecurityHeaders(
      new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
    );
    const policy = stamped.headers.get("Content-Security-Policy") ?? "";
    const scriptSrc = policy.split("; ").find((directive) => directive.startsWith("script-src "));

    expect(scriptSrc).toContain(`'sha256-${sha256(inline)}'`);
    expect(scriptSrc).toContain(`'sha256-${sha256("run()")}'`);
    expect(scriptSrc).not.toContain(`'sha256-${sha256('{"@type":"Thing"}')}'`);
    expect(scriptSrc?.match(/sha256-/g)).toHaveLength(2);
    expect(scriptSrc).not.toContain("unsafe-inline");
    expect(policy).not.toContain("unsafe-eval");
    expect(stamped.headers.get("Cross-Origin-Embedder-Policy")).toBeNull();
    expect(stamped.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    await expect(stamped.text()).resolves.toBe(html);
  });
});
