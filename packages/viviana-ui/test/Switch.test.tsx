import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { TabSwitch } from "../src/switch";
import { SegmentedControl } from "../src/segmentedcontrol";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

describe("TabSwitch", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  const threeOptions = [
    { label: "List", value: "list" },
    { label: "Grid", value: "grid" },
    { label: "Board", value: "board" },
  ];

  it("names the radiogroup with the caller aria-label", () => {
    render(() => <TabSwitch aria-label="Layout" options={threeOptions} />);

    expect(screen.getByRole("radiogroup", { name: "Layout" })).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: "View mode" })).not.toBeInTheDocument();
  });

  it("renders every option as a radio, including a third", () => {
    render(() => <TabSwitch aria-label="Layout" options={threeOptions} />);

    expect(screen.getByRole("radio", { name: "List" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Grid" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Board" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("selects the radio matching the controlled value", () => {
    render(() => <TabSwitch aria-label="Layout" options={threeOptions} value="grid" />);

    expect(screen.getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "Board" })).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange with the option value string", async () => {
    const onChange = vi.fn();
    render(() => (
      <TabSwitch aria-label="Layout" options={threeOptions} value="list" onChange={onChange} />
    ));

    await user.click(screen.getByRole("radio", { name: "Grid" }));
    expect(onChange).toHaveBeenCalledWith("grid");
  });

  it("applies class on the radiogroup", () => {
    render(() => <TabSwitch aria-label="Layout" options={threeOptions} class="tab-switch-class" />);

    expect(screen.getByRole("radiogroup")).toHaveClass("tab-switch-class");
  });

  it("is a mapping wrapper, not an identity alias of SegmentedControl", () => {
    expect(TabSwitch).not.toBe(SegmentedControl);
    expect(typeof TabSwitch).toBe("function");
  });
});
