import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { TabSwitch, ToggleSwitch, SwitchContext } from "../src/switch";
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

describe("ToggleSwitch", () => {
  it('renders with role="switch"', () => {
    render(() => <ToggleSwitch aria-label="Notifications">Enable notifications</ToggleSwitch>);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeInTheDocument();
  });

  describe("ref and inputRef forwarding", () => {
    it("forwards ref to field root div and inputRef to input element via function refs", () => {
      let fieldEl: HTMLDivElement | null = null;
      let inputEl: HTMLInputElement | null = null;

      render(() => (
        <ToggleSwitch
          aria-label="Ref switch"
          ref={(el) => {
            fieldEl = el;
          }}
          inputRef={(el) => {
            inputEl = el;
          }}
        >
          Enable
        </ToggleSwitch>
      ));

      expect(fieldEl).toBeInstanceOf(HTMLDivElement);
      expect(inputEl).toBeInstanceOf(HTMLInputElement);
      expect(inputEl?.getAttribute("role")).toBe("switch");
      expect(fieldEl?.contains(inputEl!)).toBe(true);
    });

    it("forwards ref and inputRef via object refs", () => {
      const fieldRef = { current: null as HTMLDivElement | null };
      const inputRef = { current: null as HTMLInputElement | null };

      render(() => (
        <ToggleSwitch aria-label="Ref switch" ref={fieldRef} inputRef={inputRef}>
          Enable
        </ToggleSwitch>
      ));

      expect(fieldRef.current).toBeInstanceOf(HTMLDivElement);
      expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
      expect(fieldRef.current?.contains(inputRef.current!)).toBe(true);
    });

    it("honors ref and inputRef injected through SwitchContext", () => {
      let contextFieldEl: HTMLDivElement | null = null;
      let contextInputEl: HTMLInputElement | null = null;
      let localFieldEl: HTMLDivElement | null = null;
      let localInputEl: HTMLInputElement | null = null;

      render(() => (
        <SwitchContext
          value={{
            ref: (el) => {
              contextFieldEl = el;
            },
            inputRef: (el) => {
              contextInputEl = el;
            },
          }}
        >
          <ToggleSwitch
            aria-label="Context switch"
            ref={(el) => {
              localFieldEl = el;
            }}
            inputRef={(el) => {
              localInputEl = el;
            }}
          >
            Context test
          </ToggleSwitch>
        </SwitchContext>
      ));

      expect(contextFieldEl).toBeInstanceOf(HTMLDivElement);
      expect(localFieldEl).toBe(contextFieldEl);
      expect(contextInputEl).toBeInstanceOf(HTMLInputElement);
      expect(localInputEl).toBe(contextInputEl);
    });
  });

  describe("controlled DOM restoration", () => {
    it("keeps native checked false when controlled onChange refuses the click", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => (
        <ToggleSwitch aria-label="Notifications" isSelected={false} onChange={onChange}>
          Enable notifications
        </ToggleSwitch>
      ));
      const switchEl = screen.getByRole("switch") as HTMLInputElement;

      await user.click(switchEl);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(switchEl.checked).toBe(false);
    });

    it("keeps native checked true when a label click is refused", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => (
        <ToggleSwitch isSelected onChange={onChange}>
          Enable notifications
        </ToggleSwitch>
      ));
      const switchEl = screen.getByRole("switch") as HTMLInputElement;

      await user.click(screen.getByText("Enable notifications"));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(false);
      expect(switchEl.checked).toBe(true);
    });

    it("keeps an accepted Space toggle and a later external update on the input", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      const [selected, setSelected] = createSignal(false);
      render(() => (
        <ToggleSwitch
          aria-label="Notifications"
          isSelected={selected()}
          onChange={(next) => {
            onChange(next);
            setSelected(next);
          }}
        />
      ));
      const switchEl = screen.getByRole("switch") as HTMLInputElement;
      switchEl.focus();

      await user.keyboard(" ");
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(switchEl.checked).toBe(true);

      setSelected(false);
      flush();
      expect(switchEl.checked).toBe(false);
    });
  });
});
