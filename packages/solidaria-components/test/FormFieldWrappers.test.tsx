/**
 * Tests for the RAC 1.19 form-field split absorbed into solidaria-components:
 * SwitchField/SwitchButton, CheckboxField/CheckboxButton, RadioField/RadioButton.
 *
 * Upstream split each monolithic control into a `*Field` wrapper (owns state,
 * validation, help text) containing a `*Button` control (the clickable label +
 * indicator). These tests prove the split renders, toggles, exposes render
 * props / data attributes, and bridges description/error to aria-describedby —
 * mirroring react-aria-components/src/{Switch,Checkbox,RadioGroup}.tsx.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import {
  SwitchField,
  SwitchButton,
  CheckboxField,
  CheckboxButton,
  RadioGroup,
  RadioField,
  RadioButton,
  type SwitchButtonRenderProps,
  type CheckboxButtonRenderProps,
  type RadioButtonRenderProps,
} from "../src/index";
import {
  setupUser,
  assertNoA11yViolations,
  assertAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

function describedText(el: HTMLElement): string {
  return (el.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent)
    .join(" ");
}

describe("SwitchField + SwitchButton", () => {
  let user: ReturnType<typeof setupUser>;
  beforeEach(() => {
    user = setupUser();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a switch with the default field/button classes", () => {
    const { container } = render(() => (
      <SwitchField aria-label="Sync">
        <SwitchButton>Enable</SwitchButton>
      </SwitchField>
    ));
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeInTheDocument();
    expect(container.querySelector(".solidaria-SwitchField")).toBeInTheDocument();
    expect(switchEl.closest("label")).toHaveClass("solidaria-SwitchButton");
  });

  it("toggles selection on click", async () => {
    render(() => (
      <SwitchField aria-label="Sync">
        <SwitchButton>Enable</SwitchButton>
      </SwitchField>
    ));
    const switchEl = screen.getByRole("switch");
    expect(switchEl).not.toBeChecked();
    await user.click(switchEl);
    expect(switchEl).toBeChecked();
  });

  it("exposes button render props", async () => {
    render(() => (
      <SwitchField aria-label="Sync">
        <SwitchButton>
          {(p: SwitchButtonRenderProps) => <span>{p.isSelected ? "On" : "Off"}</span>}
        </SwitchButton>
      </SwitchField>
    ));
    expect(screen.getByText("Off")).toBeInTheDocument();
    await user.click(screen.getByRole("switch"));
    expect(screen.getByText("On")).toBeInTheDocument();
  });

  it("bridges description and error message to aria-describedby", () => {
    render(() => (
      <SwitchField aria-label="Sync" isInvalid description="Syncs across devices" errorMessage="Required">
        <SwitchButton>Enable</SwitchButton>
      </SwitchField>
    ));
    expect(describedText(screen.getByRole("switch"))).toBe("Syncs across devices Required");
  });

  it("sets data-required / data-disabled on the button", () => {
    render(() => (
      <SwitchField aria-label="Sync" isRequired isDisabled>
        <SwitchButton>Enable</SwitchButton>
      </SwitchField>
    ));
    const label = screen.getByRole("switch").closest("label")!;
    expect(label).toHaveAttribute("data-required");
    expect(label).toHaveAttribute("data-disabled");
  });

  it("has no a11y violations", async () => {
    const { container } = render(() => (
      <SwitchField aria-label="Sync" description="Syncs across devices">
        <SwitchButton>Enable</SwitchButton>
      </SwitchField>
    ));
    await assertNoA11yViolations(container);
    assertAriaIdIntegrity(container);
  });
});

describe("CheckboxField + CheckboxButton", () => {
  let user: ReturnType<typeof setupUser>;
  beforeEach(() => {
    user = setupUser();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a checkbox with the default field/button classes", () => {
    const { container } = render(() => (
      <CheckboxField aria-label="Terms">
        <CheckboxButton>Accept</CheckboxButton>
      </CheckboxField>
    ));
    const cb = screen.getByRole("checkbox");
    expect(cb).toBeInTheDocument();
    expect(container.querySelector(".solidaria-CheckboxField")).toBeInTheDocument();
    expect(cb.closest("label")).toHaveClass("solidaria-CheckboxButton");
  });

  it("toggles selection on click", async () => {
    render(() => (
      <CheckboxField aria-label="Terms">
        <CheckboxButton>Accept</CheckboxButton>
      </CheckboxField>
    ));
    const cb = screen.getByRole("checkbox");
    expect(cb).not.toBeChecked();
    await user.click(cb);
    expect(cb).toBeChecked();
  });

  it("exposes button render props (incl. isIndeterminate)", () => {
    render(() => (
      <CheckboxField aria-label="Terms" isIndeterminate>
        <CheckboxButton>
          {(p: CheckboxButtonRenderProps) => <span>{p.isIndeterminate ? "mixed" : "plain"}</span>}
        </CheckboxButton>
      </CheckboxField>
    ));
    expect(screen.getByText("mixed")).toBeInTheDocument();
  });

  it("bridges description and error message to aria-describedby", () => {
    render(() => (
      <CheckboxField aria-label="Terms" isInvalid description="You must accept" errorMessage="Required">
        <CheckboxButton>Accept</CheckboxButton>
      </CheckboxField>
    ));
    expect(describedText(screen.getByRole("checkbox"))).toBe("You must accept Required");
  });

  it("sets data-required / data-indeterminate on the button", () => {
    render(() => (
      <CheckboxField aria-label="Terms" isRequired isIndeterminate>
        <CheckboxButton>Accept</CheckboxButton>
      </CheckboxField>
    ));
    const label = screen.getByRole("checkbox").closest("label")!;
    expect(label).toHaveAttribute("data-required");
    expect(label).toHaveAttribute("data-indeterminate");
  });

  it("has no a11y violations", async () => {
    const { container } = render(() => (
      <CheckboxField aria-label="Terms" description="You must accept">
        <CheckboxButton>Accept</CheckboxButton>
      </CheckboxField>
    ));
    await assertNoA11yViolations(container);
    assertAriaIdIntegrity(container);
  });
});

describe("RadioField + RadioButton", () => {
  let user: ReturnType<typeof setupUser>;
  beforeEach(() => {
    user = setupUser();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders radios with the default field/button classes", () => {
    const { container } = render(() => (
      <RadioGroup aria-label="Choice">
        <RadioField value="a">
          <RadioButton>Option A</RadioButton>
        </RadioField>
        <RadioField value="b">
          <RadioButton>Option B</RadioButton>
        </RadioField>
      </RadioGroup>
    ));
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(container.querySelectorAll(".solidaria-RadioField")).toHaveLength(2);
    expect(screen.getAllByRole("radio")[0].closest("label")).toHaveClass("solidaria-RadioButton");
  });

  it("selects a radio on click", async () => {
    render(() => (
      <RadioGroup aria-label="Choice">
        <RadioField value="a">
          <RadioButton>Option A</RadioButton>
        </RadioField>
        <RadioField value="b">
          <RadioButton>Option B</RadioButton>
        </RadioField>
      </RadioGroup>
    ));
    const [a, b] = screen.getAllByRole("radio");
    expect(a).not.toBeChecked();
    await user.click(a);
    expect(a).toBeChecked();
    expect(b).not.toBeChecked();
  });

  it("exposes button render props", async () => {
    render(() => (
      <RadioGroup aria-label="Choice">
        <RadioField value="a">
          <RadioButton>
            {(p: RadioButtonRenderProps) => <span>{p.isSelected ? "A-on" : "A-off"}</span>}
          </RadioButton>
        </RadioField>
      </RadioGroup>
    ));
    expect(screen.getByText("A-off")).toBeInTheDocument();
    await user.click(screen.getByRole("radio"));
    expect(screen.getByText("A-on")).toBeInTheDocument();
  });

  it("bridges a per-option description to aria-describedby", () => {
    render(() => (
      <RadioGroup aria-label="Choice">
        <RadioField value="a" description="The first option">
          <RadioButton>Option A</RadioButton>
        </RadioField>
      </RadioGroup>
    ));
    expect(describedText(screen.getByRole("radio"))).toBe("The first option");
  });

  it("renders null when used outside a RadioGroup", () => {
    const { container } = render(() => (
      <RadioField value="a">
        <RadioButton>Orphan</RadioButton>
      </RadioField>
    ));
    expect(container.querySelector("input")).toBeNull();
  });

  it("has no a11y violations", async () => {
    const { container } = render(() => (
      <RadioGroup aria-label="Choice">
        <RadioField value="a" description="The first option">
          <RadioButton>Option A</RadioButton>
        </RadioField>
        <RadioField value="b">
          <RadioButton>Option B</RadioButton>
        </RadioField>
      </RadioGroup>
    ));
    await assertNoA11yViolations(container);
    assertAriaIdIntegrity(container);
  });
});
