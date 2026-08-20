import { describe, expect, it } from "vite-plus/test";
import { renderPropDescription } from "./prop-tables";

function renderedAnchor(markdown: string): HTMLAnchorElement | null {
  const template = document.createElement("template");
  template.innerHTML = renderPropDescription(markdown);
  return template.content.querySelector("a");
}

describe("renderPropDescription", () => {
  it("renders the allowed inline forms without restoring source HTML", () => {
    expect(
      renderPropDescription(
        "Use `value` with **care**; see [the guide](https://example.com/docs?a=1&b=2). <img src=x>",
      ),
    ).toBe(
      'Use <code>value</code> with <strong>care</strong>; see <a href="https://example.com/docs?a=1&amp;b=2" target="_blank" rel="noreferrer">the guide</a>. &lt;img src=x&gt;',
    );
  });

  it.each([
    '[unsafe](https://example.com/"onmouseover=alert(1))',
    "[unsafe](https://example.com/'onfocus=alert(1))",
    "[unsafe](https://example.com/<script>)",
  ])("does not let an attribute delimiter create an active link: %s", (markdown) => {
    const html = renderPropDescription(markdown);

    expect(html).not.toContain("<a ");
    expect(renderedAnchor(markdown)).toBeNull();
  });

  it("leaves non-web URL schemes as inert escaped markdown", () => {
    expect(renderPropDescription("[unsafe](javascript:alert(1))")).toBe(
      "[unsafe](javascript:alert(1))",
    );
    expect(renderPropDescription("[mail](mailto:owner@example.com)")).toBe(
      "[mail](mailto:owner@example.com)",
    );
  });

  it("accepts root-relative and fragment links", () => {
    const local = renderedAnchor("[local](/docs/components?view=all#api)");
    const fragment = renderedAnchor("[section](#api)");

    expect(local?.getAttribute("href")).toBe("/docs/components?view=all#api");
    expect(new URL(local?.getAttribute("href") ?? "", "https://local.invalid/base").host).toBe(
      "local.invalid",
    );
    expect(fragment?.getAttribute("href")).toBe("#api");
  });

  it.each(["//example.com/path", "/\\example.com/path"])(
    "does not classify a host-changing path as local: %s",
    (target) => {
      expect(renderedAnchor(`[unsafe](${target})`)).toBeNull();
    },
  );

  it.each([
    "https://example.com/%00path",
    "https://example.com/%0Apath",
    "/docs/%1fpath",
    "#section%7F",
  ])("leaves encoded control characters inert: %s", (target) => {
    expect(renderedAnchor(`[unsafe](${target})`)).toBeNull();
  });
});
