import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { CreateIdLabelsFixture } from "./fixtures/createIdLabels";

describe("createId labels SSR", () => {
  it("writes marker-bearing markup for two label/field pairs", () => {
    const html = renderToString(() => <CreateIdLabelsFixture />);
    expect(html).toMatch(/\s_hk=/);
    expect(html.match(/<input/g)).toHaveLength(2);
    expect(html.match(/aria-labelledby="solidaria-/g)).toHaveLength(2);
    const output = resolve(import.meta.dirname, "../../../output");
    mkdirSync(output, { recursive: true });
    writeFileSync(resolve(output, "create-id-labels-ssr.html"), html, "utf8");
  });
});
