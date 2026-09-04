/**
 * Hydration half of the experimental Kumo Button SSR writer.
 *
 * Reads `output/kumo-button-ssr.html` and hydrates the same fixture over it.
 * A mismatch here would abort hydration for the whole tree; a successful
 * hydrate that cannot press is a dead button.
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr, setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { Button } from "../src/components/button";

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/kumo-button-ssr.html"),
  "utf8",
);

describe("Kumo Button hydrates over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("hydrates with no mismatch and responds to press", async () => {
    const container = hydrateOverSsr(ssrHtml, () => (
      <div data-theme="kumo">
        <Button variant="primary">Save</Button>
      </div>
    ));
    const button = container.querySelector<HTMLButtonElement>("button");
    expect(button).not.toBeNull();
    expect(button).toHaveAttribute("data-kumo-component", "Button");
    expect(button?.textContent).toContain("Save");

    const onClick = vi.fn();
    button!.addEventListener("click", onClick);
    const user = setupUser();
    await user.click(button!);
    expect(onClick).toHaveBeenCalled();
  });
});
