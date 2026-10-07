import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { installNonceStore, readScriptNonce } from "../../src/csp-nonce";
import {
  THEME_BOOT_SCRIPT,
  THEME_BOOT_SCRIPT_HASH,
  WEB_SECURITY_HEADERS,
  createRequestNonce,
  stampWebSecurityHeaders,
  webContentSecurityPolicy,
} from "../../src/security-headers";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function readApp(relative: string): string {
  return readFileSync(path.join(appRoot, relative), "utf8");
}

describe("docs response security headers", () => {
  it("pins the theme-boot hash to the script the root document emits", () => {
    const hash = `sha256-${createHash("sha256").update(THEME_BOOT_SCRIPT).digest("base64")}`;
    expect(hash).toBe(THEME_BOOT_SCRIPT_HASH);
    expect(readApp("src/routes/__root.tsx")).toContain(THEME_BOOT_SCRIPT);
  });

  it("allows the nonce and theme hash on scripts and leaves styles unnonced", () => {
    const policy = webContentSecurityPolicy("abc123");
    const directive = (name: string) =>
      policy.split("; ").find((part) => part.startsWith(`${name} `));

    expect(directive("script-src")).toBe(
      `script-src 'self' 'nonce-abc123' '${THEME_BOOT_SCRIPT_HASH}'`,
    );
    expect(directive("script-src")).not.toContain("unsafe-inline");
    expect(directive("style-src")).toBe(
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    );
    expect(directive("style-src")).not.toContain("nonce-");
    expect(directive("style-src-attr")).toBe("style-src-attr 'unsafe-inline'");
    expect(directive("font-src")).toBe("font-src 'self' https://fonts.gstatic.com");
    expect(directive("img-src")).toBe("img-src 'self' data: blob:");
    expect(directive("connect-src")).toBe("connect-src 'self'");
    expect(directive("frame-src")).toBe("frame-src 'none'");
    expect(directive("frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).not.toContain("require-corp");
  });

  it("stamps the four required headers without reading the response body", async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("<html></html>"));
        controller.close();
      },
    });
    const stamped = stampWebSecurityHeaders(
      new Response(body, { status: 201, headers: { "content-type": "text/html" } }),
      "abc123",
    );

    expect(stamped.status).toBe(201);
    expect(stamped.headers.get("content-type")).toBe("text/html");
    expect(stamped.headers.get("Content-Security-Policy")).toBe(webContentSecurityPolicy("abc123"));
    for (const [name, value] of Object.entries(WEB_SECURITY_HEADERS)) {
      expect(stamped.headers.get(name)).toBe(value);
    }
    expect(stamped.headers.get("Cross-Origin-Embedder-Policy")).toBeNull();
    expect(stamped.headers.get("Cross-Origin-Opener-Policy")).toBeNull();
    await expect(stamped.text()).resolves.toBe("<html></html>");
  });

  it("issues an unpadded nonce and reads it back from the request store", () => {
    const nonce = createRequestNonce();
    expect(nonce).toMatch(/^[A-Za-z0-9_-]{22}$/);

    let current: string | undefined = "stored-nonce";
    installNonceStore({
      getStore() {
        return current;
      },
    });
    expect(readScriptNonce()).toBe("stored-nonce");
    current = undefined;
    expect(readScriptNonce()).toBeUndefined();
    current = "";
    expect(readScriptNonce()).toBeUndefined();
  });

  it("keeps the worker main on the fetch wrapper that installs the nonce store", () => {
    expect(readApp("wrangler.jsonc")).toMatch(/"main":\s*"\.\/src\/server\.ts"/);
    const server = readApp("src/server.ts");
    expect(server).toContain("installNonceStore");
    expect(server).toContain("nonceStore.run");
    expect(server).toContain("handler.fetch");
    expect(server).toContain("stampWebSecurityHeaders");
    const router = readApp("src/router.tsx");
    expect(router).toContain("readScriptNonce");
    expect(router).toContain("ssr: { nonce }");
  });
});
