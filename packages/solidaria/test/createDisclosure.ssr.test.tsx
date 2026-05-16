import { describe, expect, it } from "vitest";
import { getDisclosurePanelHiddenAttribute } from "../src/disclosure/createDisclosure";

function serverPanelProps(isExpanded: boolean) {
  return {
    role: "group",
    "aria-hidden": !isExpanded,
    hidden: getDisclosurePanelHiddenAttribute(isExpanded, false),
  };
}

describe("createDisclosure SSR", () => {
  it("returns collapsed panel props with boolean hidden for server rendering", () => {
    const panel = serverPanelProps(false);

    expect(panel.role).toBe("group");
    expect(panel["aria-hidden"]).toBe(true);
    expect(panel.hidden).toBe(true);
  });

  it("returns expanded panel props without hidden for server rendering", () => {
    const panel = serverPanelProps(true);

    expect(panel.role).toBe("group");
    expect(panel["aria-hidden"]).toBe(false);
    expect(panel.hidden).toBeUndefined();
  });

  it("leaves hidden management to the browser after hydration", () => {
    expect(getDisclosurePanelHiddenAttribute(false, true)).toBeUndefined();
    expect(getDisclosurePanelHiddenAttribute(true, true)).toBeUndefined();
  });
});
