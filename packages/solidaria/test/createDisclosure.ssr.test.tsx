import { createDisclosureState } from "@proyecto-viviana/solid-stately";
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import {
  createDisclosure,
  getDisclosurePanelHiddenAttribute,
} from "../src/disclosure/createDisclosure";

type DisclosurePanelProps = ReturnType<typeof createDisclosure>["panelProps"];

interface DisclosurePanelSnapshot {
  role: DisclosurePanelProps["role"];
  ariaHidden: DisclosurePanelProps["aria-hidden"];
  hidden: DisclosurePanelProps["hidden"];
}

function renderDisclosure(defaultExpanded = false) {
  let panel: DisclosurePanelSnapshot | undefined;
  const html = renderToString(() => {
    const state = createDisclosureState({ defaultExpanded });
    const aria = createDisclosure({}, state, () => null);
    const panelProps = aria.panelProps;
    panel = {
      role: panelProps.role,
      ariaHidden: panelProps["aria-hidden"],
      hidden: panelProps.hidden,
    };

    return (
      <>
        <button {...aria.buttonProps}>Toggle</button>
        <div {...aria.panelProps}>Content</div>
      </>
    );
  });

  if (!panel) throw new Error("Disclosure fixture did not produce panel props");
  return { html, panel };
}

describe("createDisclosure SSR", () => {
  it("returns collapsed panel props with boolean hidden for server rendering", () => {
    const { panel } = renderDisclosure();

    expect(panel.role).toBe("group");
    expect(panel.ariaHidden).toBe("true");
    expect(panel.hidden).toBe(true);
  });

  it("returns expanded panel props without hidden for server rendering", () => {
    const { panel } = renderDisclosure(true);

    expect(panel.role).toBe("group");
    expect(panel.ariaHidden).toBe("false");
    expect(panel.hidden).toBeUndefined();
  });

  it("serializes collapsed and expanded panel state into ARIA DOM attributes", () => {
    const collapsed = renderDisclosure().html;
    const expanded = renderDisclosure(true).html;

    expect(collapsed).toContain('role="group"');
    expect(collapsed).toContain('aria-hidden="true"');
    expect(collapsed).toMatch(/ hidden(?:=""|(?=[ >]))/);
    expect(expanded).toContain('role="group"');
    expect(expanded).toContain('aria-hidden="false"');
    expect(expanded).not.toMatch(/ hidden(?:=""|(?=[ >]))/);
  });

  it("leaves hidden management to the browser after hydration", () => {
    expect(getDisclosurePanelHiddenAttribute(false, true)).toBeUndefined();
    expect(getDisclosurePanelHiddenAttribute(true, true)).toBeUndefined();
  });
});
