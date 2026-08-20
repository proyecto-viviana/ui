/**
 * Meter tests - Port of React Aria's Meter.test.tsx
 *
 * Tests for Meter component functionality including:
 * - Rendering
 * - Value display
 * - Min/max constraints
 * - Percentage calculation
 * - ARIA attributes
 * - Labels
 */

import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { Meter } from "../src/Meter";
import {
  assertNoA11yViolations,
  assertAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

describe("Meter", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", () => {
      render(() => <Meter aria-label="Test Meter" value={50} />);

      const meter = document.querySelector(".solidaria-Meter");
      expect(meter).toBeInTheDocument();
    });

    it("should render with meter role", () => {
      render(() => <Meter aria-label="Test Meter" value={50} />);

      const meter = screen.getByRole("meter");
      expect(meter).toBeInTheDocument();
    });

    it("should render with custom class", () => {
      render(() => <Meter aria-label="Test Meter" value={50} class="my-meter" />);

      const meter = document.querySelector(".my-meter");
      expect(meter).toBeInTheDocument();
    });

    it("should render children", () => {
      render(() => (
        <Meter aria-label="Test Meter" value={50}>
          {() => <span>Meter Content</span>}
        </Meter>
      ));

      expect(screen.getByText("Meter Content")).toBeInTheDocument();
    });
  });

  // ============================================
  // VALUE
  // ============================================

  describe("value", () => {
    it("should display value", () => {
      render(() => <Meter aria-label="Test Meter" value={75} />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuenow", "75");
    });

    it("should default to 0 if value not provided", () => {
      render(() => <Meter aria-label="Test Meter" />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuenow", "0");
    });
  });

  // ============================================
  // MIN/MAX
  // ============================================

  describe("min/max", () => {
    it("should have default minValue of 0", () => {
      render(() => <Meter aria-label="Test Meter" value={50} />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuemin", "0");
    });

    it("should have default maxValue of 100", () => {
      render(() => <Meter aria-label="Test Meter" value={50} />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuemax", "100");
    });

    it("should support custom minValue", () => {
      render(() => <Meter aria-label="Test Meter" value={50} minValue={10} />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuemin", "10");
    });

    it("should support custom maxValue", () => {
      render(() => <Meter aria-label="Test Meter" value={50} maxValue={200} />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuemax", "200");
    });
  });

  // ============================================
  // PERCENTAGE
  // ============================================

  describe("percentage", () => {
    it("should calculate percentage correctly", () => {
      let percentage: number | undefined;
      render(() => (
        <Meter aria-label="Test Meter" value={50} minValue={0} maxValue={100}>
          {(props) => {
            percentage = props.percentage;
            return null;
          }}
        </Meter>
      ));

      expect(percentage).toBe(50);
    });

    it("should calculate percentage with custom min/max", () => {
      let percentage: number | undefined;
      render(() => (
        <Meter aria-label="Test Meter" value={75} minValue={50} maxValue={100}>
          {(props) => {
            percentage = props.percentage;
            return null;
          }}
        </Meter>
      ));

      // (75 - 50) / (100 - 50) * 100 = 50%
      expect(percentage).toBe(50);
    });

    it("should clamp value to min", () => {
      let percentage: number | undefined;
      render(() => (
        <Meter aria-label="Test Meter" value={-10} minValue={0} maxValue={100}>
          {(props) => {
            percentage = props.percentage;
            return null;
          }}
        </Meter>
      ));

      expect(percentage).toBe(0);
    });

    it("should clamp value to max", () => {
      let percentage: number | undefined;
      render(() => (
        <Meter aria-label="Test Meter" value={150} minValue={0} maxValue={100}>
          {(props) => {
            percentage = props.percentage;
            return null;
          }}
        </Meter>
      ));

      expect(percentage).toBe(100);
    });

    it("should handle equal min and max without NaN percentage", () => {
      let percentage: number | undefined;
      render(() => (
        <Meter aria-label="Test Meter" value={10} minValue={10} maxValue={10}>
          {(props) => {
            percentage = props.percentage;
            return null;
          }}
        </Meter>
      ));

      expect(percentage).toBe(0);
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have meter role", () => {
      render(() => <Meter aria-label="Test Meter" value={50} />);

      const meter = screen.getByRole("meter");
      expect(meter).toBeInTheDocument();
      expect(meter).toHaveAttribute("role", "meter");
    });

    it("should have aria-label when provided", () => {
      render(() => <Meter aria-label="Storage Usage" value={50} />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-label", "Storage Usage");
    });

    it("should have aria-valuenow", () => {
      render(() => <Meter aria-label="Test Meter" value={42} />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuenow", "42");
    });

    it("should have aria-valuemin", () => {
      render(() => <Meter aria-label="Test Meter" value={50} minValue={10} />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuemin", "10");
    });

    it("should have aria-valuemax", () => {
      render(() => <Meter aria-label="Test Meter" value={50} maxValue={200} />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuemax", "200");
    });

    it("should have aria-valuetext when valueLabel provided", () => {
      render(() => <Meter aria-label="Test Meter" value={50} valueLabel="50 percent" />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuetext", "50 percent");
    });
  });

  // ============================================
  // LABELS
  // ============================================

  describe("labels", () => {
    it("should support valueLabel", () => {
      render(() => (
        <Meter aria-label="Test Meter" value={75} valueLabel="75% used">
          {(props) => <span>{props.valueText}</span>}
        </Meter>
      ));

      expect(screen.getByText("75% used")).toBeInTheDocument();
    });

    it("should format value with formatOptions", () => {
      render(() => (
        <Meter
          aria-label="Test Meter"
          value={0.75}
          minValue={0}
          maxValue={1}
          formatOptions={{ style: "percent" }}
        >
          {(props) => <span>{props.valueText}</span>}
        </Meter>
      ));

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuetext");
    });
  });

  // ============================================
  // RENDER PROPS
  // ============================================

  describe("render props", () => {
    it("should provide percentage to render function", () => {
      render(() => (
        <Meter aria-label="Test Meter" value={25}>
          {(props) => <div data-testid="bar" style={{ width: `${props.percentage}%` }} />}
        </Meter>
      ));

      const bar = screen.getByTestId("bar");
      expect(bar).toHaveStyle({ width: "25%" });
    });

    it("should provide valueText to render function", () => {
      render(() => (
        <Meter aria-label="Test Meter" value={50} valueLabel="Half full">
          {(props) => <span data-testid="value">{props.valueText}</span>}
        </Meter>
      ));

      expect(screen.getByTestId("value")).toHaveTextContent("Half full");
    });
  });

  describe("a11y validation", () => {
    it("axe: default", async () => {
      const { container } = render(() => <Meter aria-label="Storage" value={50} />);
      await assertNoA11yViolations(container);
    });

    it("axe: custom min/max", async () => {
      const { container } = render(() => (
        <Meter aria-label="CPU" value={75} minValue={0} maxValue={200} />
      ));
      await assertNoA11yViolations(container);
    });

    it("axe: with valueLabel", async () => {
      const { container } = render(() => (
        <Meter aria-label="Disk" value={80} valueLabel="80% used" />
      ));
      await assertNoA11yViolations(container);
    });

    it("ARIA ID: no dangling refs", () => {
      render(() => <Meter aria-label="Memory" value={60} />);
      assertAriaIdIntegrity(document.body);
    });

    it("DOM: data-testid forwards", () => {
      render(() => <Meter aria-label="Meter" value={50} data-testid="my-meter" />);
      expect(screen.getByTestId("my-meter")).toBeInTheDocument();
    });
  });
});
