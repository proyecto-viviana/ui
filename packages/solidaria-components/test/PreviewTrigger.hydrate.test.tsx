/**
 * Hydration half of the PreviewTrigger server-render regression (#117).
 *
 * SSR writes closed-trigger markup (aria-haspopup, aria-expanded=false, no
 * popover). This test hydrates that markup. It must fail if Solid cannot find
 * the server nodes (ElementTag key mismatch) or invents a popover on hydrate.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
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

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/previewtrigger-ssr.html"),
  "utf8",
);

describe("PreviewTrigger hydration over server markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // Honest red: ElementTag's createMemo `<a>` looks up hydration key `00100`;
  // SSR registered `0040000000`. Not a skip — this must fail until the walk
  // matches. Do not "fix" by deleting this test or hydrating a native `<a>`.
  it.fails("hydrates the closed trigger without a mismatch or a popover", () => {
    const container = hydrateOverSsr(ssrHtml, () => <PreviewTriggerFixture />);
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe("Example");
    expect(link?.getAttribute("aria-haspopup")).toBe("dialog");
    expect(link?.getAttribute("aria-expanded")).toBe("false");
    expect(link?.hasAttribute("aria-controls")).toBe(false);
    expect(container.textContent).not.toContain("Preview content");
  });
});
