import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { SelectBox, SelectBoxGroup, SelectBoxGroupContext } from "../src";
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
              <strong>{item.label}</strong>
              <span>{item.description}</span>
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

    await user.click(pro);

    expect(starter).not.toHaveAttribute("data-selected");
    expect(pro).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["pro"]));
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
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </SelectBox>
        )}
      </SelectBoxGroup>
    ));

    const listbox = screen.getByRole("listbox", { name: "Plans" });
    expect(listbox).toHaveAttribute("data-orientation", "horizontal");
    expect(listbox).toHaveAttribute("data-disabled", "true");

    const starter = screen.getByRole("option", { name: "Starter" });
    expect(starter).toHaveAttribute("aria-disabled", "true");

    await user.click(starter);
    expect(onSelectionChange).not.toHaveBeenCalled();
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
            <strong>{item.label}</strong>
            <span>{item.description}</span>
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
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["starter"]));
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
            <strong>{item.label}</strong>
            <span>{item.description}</span>
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
            <strong>{item.label}</strong>
            <span>{item.description}</span>
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
          <strong>Starter</strong>
          <span>For small teams</span>
        </SelectBox>
        <SelectBox id="pro" textValue="Pro">
          <strong>Pro</strong>
          <span>For growing teams</span>
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
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["pro"]));
  });

  it("merges SelectBoxGroupContext props", () => {
    const ref = vi.fn();

    render(() => (
      <SelectBoxGroupContext.Provider
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
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </SelectBox>
          )}
        </SelectBoxGroup>
      </SelectBoxGroupContext.Provider>
    ));

    const listbox = screen.getByRole("listbox", { name: "Context plans" });
    expect(listbox).toHaveAttribute("data-orientation", "horizontal");
    expect(listbox).toHaveClass("context-select-box-group");
    expect(listbox).toHaveStyle({ margin: "1px" });
    expect(screen.getByRole("option", { name: "Pro" })).toHaveAttribute("data-selected", "true");
    expect(ref).toHaveBeenCalledWith(listbox);
  });
});
