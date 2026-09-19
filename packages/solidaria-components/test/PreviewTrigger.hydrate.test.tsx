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
import { hydrateOverSsr, setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { waitFor } from "@solidjs/testing-library";
import { cleanupHydrationRoots } from "../../solidaria/test-utils/hydrate";
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
    cleanupHydrationRoots();
    document.body.innerHTML = "";
  });

  it("hydrates the closed trigger without a mismatch or a popover", async () => {
    const selector = 'a[aria-haspopup="dialog"]';
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(ssrHtml, () => <PreviewTriggerFixture />, {
      beforeHydrate(container) {
        serverNodes = Array.from(container.querySelectorAll(selector));
        expect(serverNodes).toHaveLength(1);
      },
    });
    const hydratedNodes = container.querySelectorAll(selector);
    expect(hydratedNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe("Example");
    expect(link?.getAttribute("aria-haspopup")).toBe("dialog");
    expect(link?.getAttribute("aria-expanded")).toBe("false");
    expect(link?.hasAttribute("aria-controls")).toBe(false);
    expect(container.textContent).not.toContain("Preview content");

    await setupUser().tab();
    await waitFor(() => {
      expect(document.querySelector('[data-testid="preview"]')).toBeInTheDocument();
    });
    const preview = document.querySelector('[data-testid="preview"]')!;
    expect(document.activeElement).toBe(link);
    expect(container.querySelector("a")).toBe(serverNodes[0]);
    expect(link).toHaveAttribute("aria-expanded", "true");
    expect(link).toHaveAttribute("aria-controls", preview.id);
    expect(preview).toHaveTextContent("Preview content");
  });
});
