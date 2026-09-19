/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test"; import { render, screen } from "@solidjs/testing-library"; import { createSignal, flush, type Component } from "solid-js";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import {
  Icon,
  IconContext,
  IllustrationContext,
  createIcon,
  createIllustration,
} from "../src/icon";
import { GitHubIcon } from "../src/icon/icons/GitHubIcon";
import CrossIcon from "../src/icon/ui-icons/Cross";
import Checkmark from "../src/icon/ui-icons/Checkmark";
import { BellIcon } from "../src/icon/s2wf-icons/BellIcon";

const TestCreatedIcon = createIcon((props) => (
  <svg viewBox="0 0 20 20" {...props}>
    <path d="M4 9h12v2H4z" />
  </svg>
));

const TestCreatedIllustration = createIllustration(({ size, ...props }) => (
  <svg viewBox="0 0 48 48" data-size-prop={size} {...props}>
    <rect x="4" y="4" width="40" height="40" rx="8" />
  </svg>
));

type ProbeIcon = Component<{ size?: string | number; color?: string }>;

function ProbeA(_props: { size?: string | number; color?: string }) {
  return <span data-testid="icon-a">A</span>;
}

function ProbeB(_props: { size?: string | number; color?: string }) {
  return <span data-testid="icon-b">B</span>;
}

describe("Icon (solid-spectrum)", () => {
  it("renders as non-interactive content by default", () => {
    const { container } = render(() => <Icon icon={GitHubIcon} />);
    const span = container.querySelector("span.vui-icon");
    expect(span).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it('decorative icon has aria-hidden="true"', () => {
    const { container } = render(() => <Icon icon={GitHubIcon} />);
    const span = container.querySelector("span.vui-icon");
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  it("renders as a semantic button when onPress is provided", async () => {
    const user = setupUser();
    const onPress = vi.fn();

    render(() => <Icon icon={GitHubIcon} onPress={onPress} aria-label="Open GitHub" />);

    const button = screen.getByRole("button", { name: "Open GitHub" });
    await user.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("interactive icon supports keyboard activation", async () => {
    const user = setupUser();
    const onPress = vi.fn();

    render(() => <Icon icon={GitHubIcon} onPress={onPress} aria-label="Open GitHub" />);

    const button = screen.getByRole("button", { name: "Open GitHub" });
    button.focus();
    await user.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("applies shadow class when withShadow is true", () => {
    const { container } = render(() => <Icon icon={GitHubIcon} withShadow />);
    const span = container.querySelector("span.vui-icon");
    expect(span).toHaveClass("vui-icon--with-shadow");
  });

  it("applies custom class", () => {
    const { container } = render(() => <Icon icon={GitHubIcon} class="custom" />);
    const span = container.querySelector("span.vui-icon");
    expect(span).toHaveClass("custom");
  });

  it("renders an updated icon after mount", () => {
    let setIcon!: (next: ProbeIcon) => void;

    const { container } = render(() => {
      const [icon, updateIcon] = createSignal<{ current: ProbeIcon }>({ current: ProbeA });
      setIcon = (next) => updateIcon({ current: next });
      return <Icon icon={icon().current} />;
    });

    expect(screen.getByTestId("icon-a")).toBeInTheDocument();
    expect(container.querySelector('[data-testid="icon-b"]')).not.toBeInTheDocument();

    setIcon(ProbeB);
    flush();

    expect(screen.queryByTestId("icon-a")).not.toBeInTheDocument();
    expect(screen.getByTestId("icon-b")).toBeInTheDocument();
  });

  it("updates the shadow copy when icon changes after mount", () => {
    let setIcon!: (next: ProbeIcon) => void;

    const { container } = render(() => {
      const [icon, updateIcon] = createSignal<{ current: ProbeIcon }>({ current: ProbeA });
      setIcon = (next) => updateIcon({ current: next });
      return <Icon icon={icon().current} withShadow />;
    });

    expect(container.querySelectorAll('[data-testid="icon-a"]')).toHaveLength(2);

    setIcon(ProbeB);
    flush();

    expect(container.querySelector('[data-testid="icon-a"]')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid="icon-b"]')).toHaveLength(2);
    expect(container.querySelector(".vui-icon__shadow [data-testid='icon-b']")).toBeInTheDocument();
    expect(container.querySelector(".vui-icon__main [data-testid='icon-b']")).toBeInTheDocument();
  });

  it("renders a UI icon size variant", () => {
    const { container } = render(() => <CrossIcon size="L" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "10");
    expect(svg).toHaveAttribute("height", "10");
  });

  it("applies S2 Checkmark token size styles on a bare svg", () => {
    const s = render(() => <Checkmark size="S" />).container.querySelector("svg");
    const m = render(() => <Checkmark size="M" />).container.querySelector("svg");
    const l = render(() => <Checkmark size="L" />).container.querySelector("svg");
    expect(s).toBeInTheDocument();
    expect(s).not.toHaveAttribute("focusable", "false");
    expect(s).not.toHaveAttribute("role");
    const sClass = s?.getAttribute("class") ?? "";
    const mClass = m?.getAttribute("class") ?? "";
    const lClass = l?.getAttribute("class") ?? "";
    expect(sClass.length).toBeGreaterThan(0);
    expect(sClass).toBe(mClass);
    expect(lClass).not.toBe(sClass);
  });

  it("updates a ui-icon class after mount", () => {
    const [cls, setCls] = createSignal("first");
    const { container } = render(() => <Checkmark class={cls()} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class") ?? "").toContain("first");
    setCls("second");
    flush();
    expect(svg?.getAttribute("class") ?? "").toContain("second");
    expect(svg?.getAttribute("class") ?? "").not.toContain("first");
  });

  it("renders a workflow icon directly", () => {
    const { container } = render(() => <BellIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("role", "img");
  });

  it("createIcon mirrors React Spectrum SVG accessibility attributes", () => {
    const { container } = render(() => (
      <>
        <TestCreatedIcon aria-label="Create" data-testid="labelled" />
        <TestCreatedIcon data-testid="decorative" />
        <TestCreatedIcon slot="icon" data-testid="slotted" />
      </>
    ));

    const labelled = container.querySelector('[data-testid="labelled"]');
    const decorative = container.querySelector('[data-testid="decorative"]');
    const slotted = container.querySelector('[data-testid="slotted"]');

    expect(labelled).toHaveAttribute("role", "img");
    expect(labelled).toHaveAttribute("aria-label", "Create");
    expect(labelled).not.toHaveAttribute("aria-hidden");
    expect(labelled).toHaveAttribute("focusable", "false");
    expect(labelled).not.toHaveAttribute("data-slot");

    expect(decorative).toHaveAttribute("role", "img");
    expect(decorative).not.toHaveAttribute("aria-label");
    expect(decorative).toHaveAttribute("aria-hidden", "true");
    expect(decorative).toHaveAttribute("focusable", "false");
    expect(decorative).not.toHaveAttribute("data-slot");

    expect(slotted).toHaveAttribute("data-slot", "icon");
  });

  it("createIcon inherits slot context used by component compositions", () => {
    const { container } = render(() => (
      <IconContext value={{ slot: "icon" }}>
        <TestCreatedIcon />
      </IconContext>
    ));

    expect(container.querySelector("svg")).toHaveAttribute("data-slot", "icon");
  });

  it("createIcon still wraps with IconContext.render", () => {
    const { container } = render(() => (
      <IconContext
        value={{
          slot: "icon",
          render: (icon) => <div data-testid="workflow-icon-wrap">{icon}</div>,
        }}
      >
        <TestCreatedIcon />
      </IconContext>
    ));

    const wrap = container.querySelector('[data-testid="workflow-icon-wrap"]');
    expect(wrap).toBeInTheDocument();
    expect(wrap?.querySelector("svg")).toHaveAttribute("data-slot", "icon");
  });

  it("createUIIcon does not consume IconContext render, slot, or styles", () => {
    const { container } = render(() => (
      <IconContext
        value={{
          slot: "icon",
          render: (icon) => <div data-testid="ui-icon-wrap">{icon}</div>,
        }}
      >
        <Checkmark />
      </IconContext>
    ));

    expect(container.querySelector('[data-testid="ui-icon-wrap"]')).not.toBeInTheDocument();
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveAttribute("data-slot");
    expect(svg?.parentElement?.getAttribute("data-testid")).not.toBe("ui-icon-wrap");
  });

  it("createIllustration mirrors React Spectrum SVG size and accessibility attributes", () => {
    const { container } = render(() => (
      <>
        <TestCreatedIllustration aria-label="Plan" size="L" data-testid="labelled" />
        <TestCreatedIllustration size="S" data-testid="decorative" />
        <TestCreatedIllustration slot="icon" data-testid="slotted" />
      </>
    ));

    const labelled = container.querySelector('[data-testid="labelled"]');
    const decorative = container.querySelector('[data-testid="decorative"]');
    const slotted = container.querySelector('[data-testid="slotted"]');

    expect(labelled).toHaveAttribute("role", "img");
    expect(labelled).toHaveAttribute("aria-label", "Plan");
    expect(labelled).not.toHaveAttribute("aria-hidden");
    expect(labelled).toHaveAttribute("focusable", "false");
    expect(labelled).not.toHaveAttribute("data-slot");
    expect(labelled).not.toHaveAttribute("size");
    expect(labelled).toHaveAttribute("data-size-prop", "L");

    expect(decorative).toHaveAttribute("role", "img");
    expect(decorative).toHaveAttribute("aria-hidden", "true");
    expect(decorative).toHaveAttribute("focusable", "false");
    expect(decorative).not.toHaveAttribute("data-slot");
    expect(decorative).not.toHaveAttribute("size");
    expect(decorative).toHaveAttribute("data-size-prop", "S");

    expect(slotted).toHaveAttribute("data-slot", "icon");
  });

  it("createIllustration inherits slot context used by component compositions", () => {
    const { container } = render(() => (
      <IllustrationContext value={{ slot: "illustration" }}>
        <TestCreatedIllustration />
      </IllustrationContext>
    ));

    expect(container.querySelector("svg")).toHaveAttribute("data-slot", "illustration");
  });
});
