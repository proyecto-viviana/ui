import { describe, expect, it } from "vite-plus/test";
import { COMPARISON_SECURITY_HEADERS, cacheControlForPath, withSecurityHeaders } from "./worker";

describe("comparison worker security headers", () => {
  it("stamps the production header set onto an assets response", async () => {
    const stamped = withSecurityHeaders(
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
    const stamped = withSecurityHeaders(new Response("missing", { status: 404 }));

    expect(stamped.status).toBe(404);
    expect(stamped.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sets immutable cache on hashed assets and revalidates HTML", () => {
    expect(cacheControlForPath("/_astro/react-runtime.AbCd.js")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(cacheControlForPath("/components/button/")).toBe("public, max-age=0, must-revalidate");

    const hashed = withSecurityHeaders(
      new Response("js", { headers: { "content-type": "text/javascript" } }),
      new Request("https://comparison.example/_astro/chunk.js"),
    );
    expect(hashed.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");

    const html = withSecurityHeaders(
      new Response("<html></html>", { headers: { "content-type": "text/html" } }),
      new Request("https://comparison.example/coverage/"),
    );
    expect(html.headers.get("Cache-Control")).toBe("public, max-age=0, must-revalidate");
  });

  it("does not overwrite a Cache-Control the asset already set", () => {
    const stamped = withSecurityHeaders(
      new Response("js", {
        headers: { "Cache-Control": "public, max-age=60" },
      }),
      new Request("https://comparison.example/_astro/chunk.js"),
    );

    expect(stamped.headers.get("Cache-Control")).toBe("public, max-age=60");
  });
});
