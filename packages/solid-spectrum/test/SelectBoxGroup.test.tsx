import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { SelectBox, SelectBoxGroup, SelectBoxGroupContext, Text } from "../src";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

interface PlanOption {
  id: string;
  label: string;
  description: string;
}

const plans: PlanOption[] = [
  { id: "starter", label: "Starter", description: "For small teams" },
  { id: "pro", label: "Pro", description: "For growing teams" },
];

describe("SelectBoxGroup (solid-spectrum)", () => {
  it("renders selectable cards with listbox semantics", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    function Demo() {
      const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["starter"]));
      return (
        <SelectBoxGroup
          aria-label="Plans"
          items={plans}
          getKey={(item) => item.id}
          getTextValue={(item) => item.label}
          selectedKeys={selectedKeys()}
          onSelectionChange={(keys) => {
            const nextKeys = keys === "all" ? new Set(plans.map((plan) => plan.id)) : keys;
            setSelectedKeys(new Set(Array.from(nextKeys, String)));
            onSelectionChange(keys);
          }}
        >
          {(item) => (
            <SelectBox id={item.id} textValue={item.label}>
              <Text slot="label">{item.label}</Text>
              <Text slot="description">{item.description}</Text>
            </SelectBox>
          )}
        </SelectBoxGroup>
      );
    }

    render(() => <Demo />);

    expect(screen.getByRole("listbox", { name: "Plans" })).toBeInTheDocument();
    const starter = screen.getByRole("option", { name: "Starter" });
    const pro = screen.getByRole("option", { name: "Pro" });
    expect(starter).toHaveAttribute("data-selected", "true");
    expect(pro).not.toHaveAttribute("data-selected");
    expect(screen.getByText("Starter")).toHaveAttribute("data-rsp-slot", "label");
    expect(screen.getByText("For small teams")).toHaveAttribute("data-rsp-slot", "description");

    await user.click(pro);

    expect(starter).not.toHaveAttribute("data-selected");
    expect(pro).toHaveAttribute("data-selected", "true");
    expect(new Set(onSelectionChange.mock.lastCall?.[0])).toEqual(new Set(["pro"]));
  });

  it("drops a slotted description when the item children change", async () => {
    const user = setupUser();

    function Demo() {
      const [showDescription, setShowDescription] = createSignal(true);
      return (
        <div>
          <button type="button" onClick={() => setShowDescription(false)}>
            Hide description
          </button>
          <SelectBoxGroup
            aria-label="Plans"
            items={plans}
            getKey={(item) => item.id}
            getTextValue={(item) => item.label}
          >
            {(item) => (
              <SelectBox id={item.id} textValue={item.label}>
                <Text slot="label">{item.label}</Text>
                {showDescription() ? <Text slot="description">{item.description}</Text> : null}
              </SelectBox>
            )}
          </SelectBoxGroup>
        </div>
      );
    }

    render(() => <Demo />);

    expect(screen.getByText("For small teams")).toHaveAttribute("data-rsp-slot", "description");
    await user.click(screen.getByRole("button", { name: "Hide description" }));
    expect(screen.queryByText("For small teams")).not.toBeInTheDocument();
    expect(screen.getByText("Starter")).toHaveAttribute("data-rsp-slot", "label");
  });

  it("supports horizontal orientation and disabled state", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    render(() => (
      <SelectBoxGroup
        aria-label="Plans"
        items={plans}
        getKey={(item) => item.id}
        getTextValue={(item) => item.label}
        orientation="horizontal"
        isDisabled
        onSelectionChange={onSelectionChange}
      >
        {(item) => (
          <SelectBox id={item.id} textValue={item.label}>
            <Text slot="label">{item.label}</Text>
            <Text slot="description">{item.description}</Text>
          </SelectBox>
        )}
      </SelectBoxGroup>
    ));

    const listbox = screen.getByRole("listbox", { name: "Plans" });
    expect(listbox).toHaveAttribute("data-orientation", "horizontal");
    expect(listbox).not.toHaveAttribute("data-disabled");
    expect(listbox).not.toHaveAttribute("aria-disabled");
    expect(listbox).toHaveAttribute("tabindex", "0");

    const starter = screen.getByRole("option", { name: "Starter" });
    const pro = screen.getByRole("option", { name: "Pro" });
    expect(starter).toHaveAttribute("aria-disabled", "true");
    expect(starter).toHaveAttribute("data-disabled", "true");
    expect(pro).toHaveAttribute("aria-disabled", "true");
    expect(pro).toHaveAttribute("data-disabled", "true");

    await user.click(starter);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("skips a disabled SelectBox during arrow navigation (#290)", async () => {
    const user = setupUser();
    render(() => (
      <SelectBoxGroup
        aria-label="Plans"
        items={plans}
        getKey={(item) => item.id}
        getTextValue={(item) => item.label}
        defaultSelectedKeys={["starter"]}
      >
        {(item) => (
          <SelectBox id={item.id} textValue={item.label} isDisabled={item.id === "pro"}>
            <Text slot="label">{item.label}</Text>
            <Text slot="description">{item.description}</Text>
          </SelectBox>
        )}
      </SelectBoxGroup>
    ));

    const starter = screen.getByRole("option", { name: "Starter" });
    const pro = screen.getByRole("option", { name: "Pro" });

    // Tab into the group - lands on Starter
    await user.tab();
    expect(starter).toHaveAttribute("data-focused", "true");
    expect(starter).toHaveAttribute("data-focus-visible", "true");
    expect(starter).toHaveAttribute("tabindex", "0");
    expect(pro).toHaveAttribute("aria-disabled", "true");
    expect(pro).not.toHaveAttribute("data-focused");

    // ArrowDown tries to move to Pro, but Pro is disabled so it should skip it and stay on Starter
    await user.keyboard("{ArrowDown}");
    expect(starter).toHaveAttribute("data-focused", "true");
    expect(starter).toHaveAttribute("data-focus-visible", "true");
    expect(starter).toHaveAttribute("tabindex", "0");
    expect(pro).not.toHaveAttribute("data-focused");
  });

  it("treats ArrowRight as a no-op when cards wrap into a single column (#292)", async () => {
    const user = setupUser();
    render(() => (
      <SelectBoxGroup
        aria-label="Plans"
        items={plans}
        getKey={(item) => item.id}
        getTextValue={(item) => item.label}
        orientation="horizontal"
        defaultSelectedKeys={["starter"]}
      >
        {(item) => (
          <SelectBox id={item.id} textValue={item.label}>
            <Text slot="label">{item.label}</Text>
            <Text slot="description">{item.description}</Text>
          </SelectBox>
        )}
      </SelectBoxGroup>
    ));

    const starter = screen.getByRole("option", { name: "Starter" });
    const pro = screen.getByRole("option", { name: "Pro" });

    // Mock DOM rectangles so Starter and Pro are stacked in the same visual column
    // Starter: x=0, y=0, w=368, h=84
    // Pro:     x=0, y=84, w=368, h=84
    vi.spyOn(starter, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 84,
      right: 368,
      width: 368,
      height: 84,
      toJSON: () => {},
    });
    vi.spyOn(pro, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 84,
      top: 84,
      left: 0,
      bottom: 168,
      right: 368,
      width: 368,
      height: 84,
      toJSON: () => {},
    });

    await user.tab();
    expect(starter).toHaveAttribute("data-focused", "true");

    // ArrowRight in a 1-column wrapped grid has no item to the right -> stays on Starter
    await user.keyboard("{ArrowRight}");
    expect(starter).toHaveAttribute("data-focused", "true");
    expect(pro).not.toHaveAttribute("data-focused");

    // ArrowDown moves down the column to Pro
    await user.keyboard("{ArrowDown}");
    expect(pro).toHaveAttribute("data-focused", "true");
  });

  it("supports uncontrolled defaultSelectedKeys", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <SelectBoxGroup
        aria-label="Plans"
        items={plans}
        getKey={(item) => item.id}
        getTextValue={(item) => item.label}
        defaultSelectedKeys={["pro"]}
        onSelectionChange={onSelectionChange}
      >
        {(item) => (
          <SelectBox id={item.id} textValue={item.label}>
            <Text slot="label">{item.label}</Text>
            <Text slot="description">{item.description}</Text>
          </SelectBox>
        )}
      </SelectBoxGroup>
    ));

    const starter = screen.getByRole("option", { name: "Starter" });
    const pro = screen.getByRole("option", { name: "Pro" });
    expect(starter).not.toHaveAttribute("data-selected");
    expect(pro).toHaveAttribute("data-selected", "true");

    await user.click(starter);

    expect(starter).toHaveAttribute("data-selected", "true");
    expect(pro).not.toHaveAttribute("data-selected");
    // onSelectionChange receives a `Selection` (Set subclass); compare contents.
    expect(new Set(onSelectionChange.mock.lastCall?.[0])).toEqual(new Set(["starter"]));
  });

  it("supports disabledKeys without calling onSelectionChange", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <SelectBoxGroup
        aria-label="Plans"
        items={plans}
        getKey={(item) => item.id}
        getTextValue={(item) => item.label}
        selectedKeys={["starter"]}
        disabledKeys={["pro"]}
        onSelectionChange={onSelectionChange}
      >
        {(item) => (
          <SelectBox id={item.id} textValue={item.label}>
            <Text slot="label">{item.label}</Text>
            <Text slot="description">{item.description}</Text>
          </SelectBox>
        )}
      </SelectBoxGroup>
    ));

    const starter = screen.getByRole("option", { name: "Starter" });
    const pro = screen.getByRole("option", { name: "Pro" });
    expect(pro).toHaveAttribute("aria-disabled", "true");

    await user.click(pro);

    expect(starter).toHaveAttribute("data-selected", "true");
    expect(pro).not.toHaveAttribute("data-selected");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("supports item isDisabled without calling onSelectionChange", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <SelectBoxGroup
        aria-label="Plans"
        items={plans}
        getKey={(item) => item.id}
        getTextValue={(item) => item.label}
        selectedKeys={["starter"]}
        onSelectionChange={onSelectionChange}
      >
        {(item) => (
          <SelectBox id={item.id} textValue={item.label} isDisabled={item.id === "pro"}>
            <Text slot="label">{item.label}</Text>
            <Text slot="description">{item.description}</Text>
          </SelectBox>
        )}
      </SelectBoxGroup>
    ));

    const starter = screen.getByRole("option", { name: "Starter" });
    const pro = screen.getByRole("option", { name: "Pro" });
    expect(pro).toHaveAttribute("aria-disabled", "true");

    await user.click(pro);

    expect(starter).toHaveAttribute("data-selected", "true");
    expect(pro).not.toHaveAttribute("data-selected");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("supports static SelectBox children", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <SelectBoxGroup
        aria-label="Plans"
        defaultSelectedKeys={["starter"]}
        onSelectionChange={onSelectionChange}
      >
        <SelectBox id="starter" textValue="Starter">
          <Text slot="label">Starter</Text>
          <Text slot="description">For small teams</Text>
        </SelectBox>
        <SelectBox id="pro" textValue="Pro">
          <Text slot="label">Pro</Text>
          <Text slot="description">For growing teams</Text>
        </SelectBox>
      </SelectBoxGroup>
    ));

    const starter = await screen.findByRole("option", { name: "Starter" });
    const pro = await screen.findByRole("option", { name: "Pro" });
    expect(starter).toHaveAttribute("data-selected", "true");
    expect(pro).not.toHaveAttribute("data-selected");

    await user.click(pro);

    expect(starter).not.toHaveAttribute("data-selected");
    expect(pro).toHaveAttribute("data-selected", "true");
    expect(new Set(onSelectionChange.mock.lastCall?.[0])).toEqual(new Set(["pro"]));
  });

  it("merges SelectBoxGroupContext props", () => {
    const ref = vi.fn();

    render(() => (
      <SelectBoxGroupContext
        value={{
          "aria-label": "Context plans",
          orientation: "horizontal",
          defaultSelectedKeys: ["pro"],
          UNSAFE_className: "context-select-box-group",
          UNSAFE_style: { margin: "1px" },
          ref,
        }}
      >
        <SelectBoxGroup
          items={plans}
          getKey={(item) => item.id}
          getTextValue={(item) => item.label}
        >
          {(item) => (
            <SelectBox id={item.id} textValue={item.label}>
              <Text slot="label">{item.label}</Text>
              <Text slot="description">{item.description}</Text>
            </SelectBox>
          )}
        </SelectBoxGroup>
      </SelectBoxGroupContext>
    ));

    const listbox = screen.getByRole("listbox", { name: "Context plans" });
    expect(listbox).toHaveAttribute("data-orientation", "horizontal");
    expect(listbox).toHaveClass("context-select-box-group");
    expect(listbox).toHaveStyle({ margin: "1px" });
    expect(screen.getByRole("option", { name: "Pro" })).toHaveAttribute("data-selected", "true");
    expect(ref).toHaveBeenCalledWith(listbox);
  });

  it("keeps mixed text children reactive without recreating host (#169)", () => {
    let setCount!: (value: number) => void;
    render(() => {
      const [count, updateCount] = createSignal(0);
      setCount = updateCount;
      return (
        <SelectBoxGroup aria-label="Plans">
          <SelectBox id="opt1">
            <Text slot="label">Count: {count()}</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
    });

    const option = screen.getByRole("option");
    const label = screen.getByText(/Count:/);
    expect(label).toHaveAttribute("data-rsp-slot", "label");
    expect(label).toHaveTextContent("Count: 0");

    setCount(1);
    flush();

    expect(label).toHaveTextContent("Count: 1");
    expect(screen.getByRole("option")).toBe(option);
  });
});
