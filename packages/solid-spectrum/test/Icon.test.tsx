/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
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

  it("renders a UI icon size variant", () => {
    const { container } = render(() => <CrossIcon size="L" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "10");
    expect(svg).toHaveAttribute("height", "10");
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
      <IconContext.Provider value={{ slot: "icon" }}>
        <TestCreatedIcon />
      </IconContext.Provider>
    ));

    expect(container.querySelector("svg")).toHaveAttribute("data-slot", "icon");
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
      <IllustrationContext.Provider value={{ slot: "illustration" }}>
        <TestCreatedIllustration />
      </IllustrationContext.Provider>
    ));

    expect(container.querySelector("svg")).toHaveAttribute("data-slot", "illustration");
  });
});
