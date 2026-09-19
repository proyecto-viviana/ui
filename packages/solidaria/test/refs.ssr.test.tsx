import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { FollowRefFixture } from "./fixtures/followRef";

describe("followRef SSR", () => {
  it("writes marker-bearing nested-ref markup", () => {
    const html = renderToString(() => <FollowRefFixture />);
    expect(html).toContain("Nested refs");
    expect(html).toMatch(/\s_hk=/);
    const output = resolve(import.meta.dirname, "../../../output");
    mkdirSync(output, { recursive: true });
    writeFileSync(resolve(output, "follow-ref-ssr.html"), html, "utf8");
  });
});
