/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Tooltip, TooltipTrigger, SimpleTooltip } from "../src/tooltip";
import { Button } from "../src/button";

describe("Tooltip (solid-spectrum)", () => {
  describe("legacy variant prop", () => {
    const variants = ["default", "neutral", "info"] as const;

    variants.forEach((variant) => {
      it(`accepts ${variant} without changing the S2 surface contract`, () => {
        render(() => (
          <TooltipTrigger isOpen>
            <Button>Trigger</Button>
            <Tooltip variant={variant}>Tip content</Tooltip>
          </TooltipTrigger>
        ));

        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toHaveTextContent("Tip content");
        expect(tooltip.className).not.toContain("bg-neutral-900");
        expect(tooltip.className).not.toContain("bg-blue-600");
      });
    });
  });

  describe("defaults", () => {
    it("uses the generated S2 tooltip class when none specified", () => {
      render(() => (
        <TooltipTrigger isOpen>
          <Button>Trigger</Button>
          <Tooltip>Tip content</Tooltip>
        </TooltipTrigger>
      ));

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip.className).toContain("-macro-dynamic");
      expect(tooltip.className).not.toContain("animate-in");
    });

    it("uses top placement by default", () => {
      render(() => (
        <TooltipTrigger isOpen>
          <Button>Trigger</Button>
          <Tooltip>Tip content</Tooltip>
        </TooltipTrigger>
      ));

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveAttribute("data-placement", "top");
    });

    it("renders the S2 arrow by default", () => {
      render(() => (
        <TooltipTrigger isOpen>
          <Button>Trigger</Button>
          <Tooltip>Tip content</Tooltip>
        </TooltipTrigger>
      ));

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip.querySelector("[data-rsp-slot='tooltip-arrow']")).toBeInTheDocument();
    });
  });

  describe("placement", () => {
    const placements = ["top", "bottom", "left", "right", "start", "end"] as const;

    placements.forEach((placement) => {
      it(`sets data-placement from TooltipTrigger placement="${placement}"`, () => {
        render(() => (
          <TooltipTrigger isOpen placement={placement}>
            <Button>Trigger</Button>
            <Tooltip>Tip</Tooltip>
          </TooltipTrigger>
        ));

        const tooltip = screen.getByRole("tooltip");
        const expected = placement === "start" ? "left" : placement === "end" ? "right" : placement;
        expect(tooltip).toHaveAttribute("data-placement", expected);
      });
    });

    it("preserves the legacy Tooltip placement prop", () => {
      render(() => (
        <TooltipTrigger isOpen>
          <Button>Trigger</Button>
          <Tooltip placement="bottom">Tip</Tooltip>
        </TooltipTrigger>
      ));

      expect(screen.getByRole("tooltip")).toHaveAttribute("data-placement", "bottom");
    });
  });

  describe("arrow", () => {
    it("renders the S2 arrow svg when showArrow={true}", () => {
      render(() => (
        <TooltipTrigger isOpen>
          <Button>Trigger</Button>
          <Tooltip showArrow>With arrow</Tooltip>
        </TooltipTrigger>
      ));

      const tooltip = screen.getByRole("tooltip");
      const arrow = tooltip.querySelector("[data-rsp-slot='tooltip-arrow']");
      const svg = tooltip.querySelector("svg");
      const path = tooltip.querySelector("path");
      expect(arrow).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox", "0 0 10 5");
      expect(path).toHaveAttribute(
        "d",
        "M4.29289 4.29289L0 0H10L5.70711 4.29289C5.31658 4.68342 4.68342 4.68342 4.29289 4.29289Z",
      );
    });

    it("does not render arrow when showArrow={false}", () => {
      render(() => (
        <TooltipTrigger isOpen>
          <Button>Trigger</Button>
          <Tooltip showArrow={false}>No arrow</Tooltip>
        </TooltipTrigger>
      ));

      const tooltip = screen.getByRole("tooltip");
      const arrow = tooltip.querySelector("[data-rsp-slot='tooltip-arrow']");
      expect(arrow).not.toBeInTheDocument();
    });

    it("uses generated S2 arrow classes instead of border triangles", () => {
      render(() => (
        <TooltipTrigger isOpen>
          <Button>Trigger</Button>
          <Tooltip>Content</Tooltip>
        </TooltipTrigger>
      ));

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip.querySelector(".border-4")).not.toBeInTheDocument();
      expect(tooltip.querySelector("svg")?.className.baseVal).toContain("-macro-dynamic");
    });
  });

  describe("class passthrough", () => {
    it("combines UNSAFE_className and class aliases with the S2 class", () => {
      render(() => (
        <TooltipTrigger isOpen>
          <Button>Trigger</Button>
          <Tooltip UNSAFE_className="unsafe-class" class="legacy-class">
            Styled
          </Tooltip>
        </TooltipTrigger>
      ));

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveClass("unsafe-class");
      expect(tooltip).toHaveClass("legacy-class");
      expect(tooltip.className).toContain("-macro-dynamic");
    });
  });

  describe("SimpleTooltip", () => {
    it("renders with vui-tooltip class", () => {
      const { container } = render(() => (
        <SimpleTooltip label="Help text">
          <button>Hover</button>
        </SimpleTooltip>
      ));

      expect(container.querySelector(".vui-tooltip")).toBeInTheDocument();
    });

    it("renders with default bottom position class", () => {
      const { container } = render(() => (
        <SimpleTooltip label="Help text">
          <button>Hover</button>
        </SimpleTooltip>
      ));

      expect(container.querySelector(".vui-tooltip__content--bottom")).toBeInTheDocument();
    });

    it("renders with top position class", () => {
      const { container } = render(() => (
        <SimpleTooltip label="Help text" position="top">
          <button>Hover</button>
        </SimpleTooltip>
      ));

      expect(container.querySelector(".vui-tooltip__content--top")).toBeInTheDocument();
    });

    it("renders label text", () => {
      render(() => (
        <SimpleTooltip label="Help text">
          <button>Hover</button>
        </SimpleTooltip>
      ));

      expect(screen.getByText("Help text")).toBeInTheDocument();
    });
  });
});
