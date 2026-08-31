/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { ProgressBar } from "../src/ProgressBar";
import {
  assertNoA11yViolations,
  assertAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

describe("ProgressBar", () => {
  it("should render with default class", () => {
    render(() => (
      <ProgressBar value={25} aria-label="Progress">
        Loading...
      </ProgressBar>
    ));
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass("solidaria-ProgressBar");
  });

  it("should render with custom class", () => {
    render(() => (
      <ProgressBar value={25} class="test" aria-label="Progress">
        Loading...
      </ProgressBar>
    ));
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass("test");
  });

  it("should have correct aria attributes", () => {
    render(() => <ProgressBar value={25} aria-label="Progress" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "25");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("should support render props", () => {
    render(() => (
      <ProgressBar value={25} aria-label="Progress">
        {(renderProps) => (
          <>
            <span class="value">{renderProps.valueText}</span>
            <div class="bar" style={{ width: `${renderProps.percentage}%` }} />
          </>
        )}
      </ProgressBar>
    ));

    const progressbar = screen.getByRole("progressbar");
    const value = progressbar.querySelector(".value");
    // The format may vary by locale (e.g., "25%" or "25 %")
    expect(value?.textContent).toMatch(/25\s?%/);

    const bar = progressbar.querySelector(".bar") as HTMLElement;
    expect(bar.style.width).toBe("25%");
  });

  it("should support indeterminate state", () => {
    render(() => (
      <ProgressBar
        isIndeterminate
        aria-label="Progress"
        class={(renderProps) => `progressbar ${renderProps.isIndeterminate ? "indeterminate" : ""}`}
      >
        Loading...
      </ProgressBar>
    ));

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass("indeterminate");
    expect(progressbar).not.toHaveAttribute("aria-valuenow");
  });

  it("should support label", () => {
    render(() => <ProgressBar value={50} label="Loading..." />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-labelledby");
  });

  it("should support aria-label", () => {
    render(() => <ProgressBar value={50} aria-label="Download progress" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-label", "Download progress");
  });

  it("should support slot prop", () => {
    render(() => <ProgressBar value={50} slot="test" aria-label="Progress" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("slot", "test");
  });

  it("should calculate percentage correctly", () => {
    render(() => (
      <ProgressBar value={5} minValue={0} maxValue={10} aria-label="Progress">
        {(renderProps) => <span class="percentage">{renderProps.percentage}</span>}
      </ProgressBar>
    ));

    const progressbar = screen.getByRole("progressbar");
    const percentage = progressbar.querySelector(".percentage");
    expect(percentage).toHaveTextContent("50");
  });

  it("should clamp value to min/max range", () => {
    render(() => (
      <ProgressBar value={150} minValue={0} maxValue={100} aria-label="Progress">
        {(renderProps) => <span class="percentage">{renderProps.percentage}</span>}
      </ProgressBar>
    ));

    const progressbar = screen.getByRole("progressbar");
    const percentage = progressbar.querySelector(".percentage");
    expect(percentage).toHaveTextContent("100");
  });

  it("should handle zero progress", () => {
    render(() => (
      <ProgressBar value={0} aria-label="Progress">
        {(renderProps) => <span class="percentage">{renderProps.percentage}</span>}
      </ProgressBar>
    ));

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
    const percentage = progressbar.querySelector(".percentage");
    expect(percentage).toHaveTextContent("0");
  });

  it("should handle full progress", () => {
    render(() => (
      <ProgressBar value={100} aria-label="Progress">
        {(renderProps) => <span class="percentage">{renderProps.percentage}</span>}
      </ProgressBar>
    ));

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "100");
    const percentage = progressbar.querySelector(".percentage");
    expect(percentage).toHaveTextContent("100");
  });

  it("should support custom min and max values", () => {
    render(() => <ProgressBar value={50} minValue={0} maxValue={200} aria-label="Progress" />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "200");
  });

  it("should handle equal min and max without NaN percentage", () => {
    render(() => (
      <ProgressBar value={10} minValue={10} maxValue={10} aria-label="Progress">
        {(renderProps) => <span class="percentage">{renderProps.percentage}</span>}
      </ProgressBar>
    ));

    const progressbar = screen.getByRole("progressbar");
    const percentage = progressbar.querySelector(".percentage");
    expect(percentage).toHaveTextContent("0");
  });

  it("should support style as a function", () => {
    render(() => (
      <ProgressBar
        value={75}
        aria-label="Progress"
        style={(renderProps) => ({
          opacity: renderProps.isIndeterminate ? "0.5" : "1",
        })}
      >
        Loading
      </ProgressBar>
    ));

    const progressbar = screen.getByRole("progressbar") as HTMLElement;
    expect(progressbar.style.opacity).toBe("1");
  });

  it("should support class as a function for determinate state", () => {
    render(() => (
      <ProgressBar
        value={50}
        aria-label="Progress"
        class={(renderProps) =>
          `progress ${renderProps.isIndeterminate ? "loading" : "determinate"}`
        }
      >
        Loading
      </ProgressBar>
    ));

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass("determinate");
  });

  it("should render as div element", () => {
    render(() => <ProgressBar value={50} aria-label="Progress" />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.tagName).toBe("DIV");
  });

  describe("a11y validation", () => {
    it("axe: determinate", async () => {
      const { container } = render(() => <ProgressBar value={50} aria-label="Upload progress" />);
      await assertNoA11yViolations(container);
    });

    it("axe: indeterminate", async () => {
      const { container } = render(() => <ProgressBar isIndeterminate aria-label="Loading" />);
      await assertNoA11yViolations(container);
    });

    it("axe: with aria-label", async () => {
      const { container } = render(() => <ProgressBar value={75} aria-label="Uploading files" />);
      await assertNoA11yViolations(container);
    });

    it("ARIA ID: no dangling refs", () => {
      render(() => <ProgressBar value={50} aria-label="Loading" />);
      assertAriaIdIntegrity(document.body);
    });

    it("DOM: data-testid forwards", () => {
      render(() => <ProgressBar value={50} aria-label="Progress" data-testid="progress" />);
      expect(screen.getByTestId("progress")).toBeInTheDocument();
    });
  });
});
