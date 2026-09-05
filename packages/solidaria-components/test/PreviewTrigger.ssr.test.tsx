/**
 * Server-render half of the PreviewTrigger hydration regression (#117).
 *
 * Writes hydratable markup for PreviewTrigger.hydrate.test.tsx. The popover is
 * client-only (useIsHydrated); the trigger must still emit RAC closed-state
 * ARIA so hydration does not invent attributes.
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { PreviewTrigger } from "../src/PreviewTrigger";
import { Popover } from "../src/Popover";
import { Link } from "../src/Link";

function PreviewTriggerFixture() {
  return (
    <PreviewTrigger delay={0} closeDelay={0}>
      <Link href="https://example.com">Example</Link>
      <Popover data-testid="preview">
        <p>Preview content</p>
      </Popover>
    </PreviewTrigger>
  );
}

describe("PreviewTrigger SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders a closed trigger without the popover and writes hydratable markup", () => {
    const html = renderToString(() => <PreviewTriggerFixture />);

    expect(html).toContain("Example");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("Preview content");
    expect(html).not.toContain("aria-controls=");

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "previewtrigger-ssr.html"), html, "utf8");
  });
});
