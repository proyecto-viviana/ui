/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { Icon, type IconRenderProps } from "../src/Icon";

describe("Icon", () => {
  describe("decorative (no label)", () => {
    it('should render with aria-hidden="true"', () => {
      const { container } = render(() => (
        <Icon>
          <span data-testid="svg">icon</span>
        </Icon>
      ));
      const span = container.querySelector("span.solidaria-Icon");
      expect(span).toBeInTheDocument();
      expect(span).toHaveAttribute("aria-hidden", "true");
    });

    it('should not have role="img"', () => {
      render(() => (
        <Icon>
          <span>icon</span>
        </Icon>
      ));
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("should not render as a button", () => {
      render(() => (
        <Icon>
          <span>icon</span>
        </Icon>
      ));
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should set data-decorative attribute", () => {
      const { container } = render(() => (
        <Icon>
          <span>icon</span>
        </Icon>
      ));
      const span = container.querySelector("span.solidaria-Icon");
      expect(span).toHaveAttribute("data-decorative");
    });
  });

  describe("informative (with aria-label)", () => {
    it('should render with role="img" and aria-label', () => {
      render(() => (
        <Icon aria-label="Search">
          <span>icon</span>
        </Icon>
      ));
      const img = screen.getByRole("img", { name: "Search" });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("aria-label", "Search");
    });

    it("should not have aria-hidden", () => {
      render(() => (
        <Icon aria-label="Search">
          <span>icon</span>
        </Icon>
      ));
      const img = screen.getByRole("img");
      expect(img).not.toHaveAttribute("aria-hidden");
    });

    it("should support aria-labelledby", () => {
      render(() => (
        <>
          <span id="icon-label">Icon label</span>
          <Icon aria-labelledby="icon-label">
            <span>icon</span>
          </Icon>
        </>
      ));
      // aria-labelledby makes it non-decorative
      const { container } = render(() => (
        <Icon aria-labelledby="icon-label">
          <span>icon</span>
        </Icon>
      ));
      const span = container.querySelector("span.solidaria-Icon");
      expect(span).toHaveAttribute("role", "img");
      expect(span).toHaveAttribute("aria-labelledby", "icon-label");
    });
  });

  describe("interactive (with onPress)", () => {
    it("should render as a button", () => {
      render(() => (
        <Icon onPress={() => {}} aria-label="Click me">
          <span>icon</span>
        </Icon>
      ));
      const button = screen.getByRole("button", { name: "Click me" });
      expect(button).toBeInTheDocument();
    });

    it("should call onPress when clicked", async () => {
      const user = setupUser();
      const onPress = vi.fn();

      render(() => (
        <Icon onPress={onPress} aria-label="Action">
          <span>icon</span>
        </Icon>
      ));

      const button = screen.getByRole("button", { name: "Action" });
      await user.click(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("should support keyboard activation via Enter", async () => {
      const user = setupUser();
      const onPress = vi.fn();

      render(() => (
        <Icon onPress={onPress} aria-label="Action">
          <span>icon</span>
        </Icon>
      ));

      const button = screen.getByRole("button", { name: "Action" });
      button.focus();
      await user.keyboard("{Enter}");
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("should support keyboard activation via Space", async () => {
      const user = setupUser();
      const onPress = vi.fn();

      render(() => (
        <Icon onPress={onPress} aria-label="Action">
          <span>icon</span>
        </Icon>
      ));

      const button = screen.getByRole("button", { name: "Action" });
      button.focus();
      await user.keyboard(" ");
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("should set data-interactive attribute", () => {
      render(() => (
        <Icon onPress={() => {}} aria-label="Action">
          <span>icon</span>
        </Icon>
      ));
      const button = screen.getByRole("button", { name: "Action" });
      expect(button).toHaveAttribute("data-interactive");
    });
  });

  describe("render props", () => {
    it("should expose isDecorative and isInteractive", () => {
      render(() => (
        <Icon>
          {(props: IconRenderProps) => (
            <span data-testid="content">
              {props.isDecorative ? "decorative" : "informative"}
              {props.isInteractive ? "-interactive" : "-static"}
            </span>
          )}
        </Icon>
      ));
      expect(screen.getByTestId("content")).toHaveTextContent("decorative-static");
    });

    it("should support function class", () => {
      const { container } = render(() => (
        <Icon class={(props: IconRenderProps) => (props.isDecorative ? "deco" : "info")}>
          <span>icon</span>
        </Icon>
      ));
      const span = container.querySelector("span.deco");
      expect(span).toBeInTheDocument();
    });
  });

  describe("DOM props", () => {
    it("should support id", () => {
      const { container } = render(() => (
        <Icon id="my-icon">
          <span>icon</span>
        </Icon>
      ));
      const span = container.querySelector("#my-icon");
      expect(span).toBeInTheDocument();
    });
  });
});
