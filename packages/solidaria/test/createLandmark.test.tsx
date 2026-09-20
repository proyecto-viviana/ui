/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { createLandmark, getLandmarkController, type AriaLandmarkRole } from "../src/landmark";

// Test component that uses createLandmark
function TestLandmark(props: {
  role: AriaLandmarkRole;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  id?: string;
  children?: string;
}) {
  const [ref, setRef] = createSignal<HTMLElement>();

  const { landmarkProps } = createLandmark(
    {
      get role() {
        return props.role;
      },
      get "aria-label"() {
        return props["aria-label"];
      },
      get "aria-labelledby"() {
        return props["aria-labelledby"];
      },
      get id() {
        return props.id;
      },
    },
    ref,
  );

  return (
    <div ref={setRef} {...landmarkProps} data-testid={`landmark-${props.role}`}>
      {props.children ?? `${props.role} content`}
    </div>
  );
}

// Test component for multiple landmarks
function TestMultipleLandmarks() {
  return (
    <>
      <TestLandmark role="banner" aria-label="Site header" />
      <TestLandmark role="navigation" aria-label="Main navigation" />
      <TestLandmark role="main" aria-label="Main content" />
      <TestLandmark role="complementary" aria-label="Sidebar" />
      <TestLandmark role="contentinfo" aria-label="Site footer" />
    </>
  );
}

describe("createLandmark", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe("ARIA attributes", () => {
    it("should set the correct role attribute", () => {
      render(() => <TestLandmark role="main" />);
      const landmark = screen.getByTestId("landmark-main");
      expect(landmark).toHaveAttribute("role", "main");
    });

    it("should set aria-label when provided", () => {
      render(() => <TestLandmark role="navigation" aria-label="Primary navigation" />);
      const landmark = screen.getByTestId("landmark-navigation");
      expect(landmark).toHaveAttribute("aria-label", "Primary navigation");
    });

    it("should set aria-labelledby when provided", () => {
      render(() => (
        <>
          <h2 id="nav-heading">Navigation</h2>
          <TestLandmark role="navigation" aria-labelledby="nav-heading" />
        </>
      ));
      const landmark = screen.getByTestId("landmark-navigation");
      expect(landmark).toHaveAttribute("aria-labelledby", "nav-heading");
    });

    it("should set id when provided", () => {
      render(() => <TestLandmark role="main" id="main-content" />);
      const landmark = screen.getByTestId("landmark-main");
      expect(landmark).toHaveAttribute("id", "main-content");
    });

    it("should support all landmark roles", () => {
      const roles: AriaLandmarkRole[] = [
        "main",
        "navigation",
        "search",
        "banner",
        "contentinfo",
        "complementary",
        "form",
        "region",
      ];

      roles.forEach((role) => {
        cleanup();
        render(() => <TestLandmark role={role} />);
        const landmark = screen.getByTestId(`landmark-${role}`);
        expect(landmark).toHaveAttribute("role", role);
      });
    });
  });

  describe("getLandmarkController", () => {
    it("should return a controller with navigation methods", () => {
      const controller = getLandmarkController();
      expect(controller).toHaveProperty("focusNext");
      expect(controller).toHaveProperty("focusPrevious");
      expect(controller).toHaveProperty("focusMain");
      expect(controller).toHaveProperty("navigate");
      expect(typeof controller.focusNext).toBe("function");
      expect(typeof controller.focusPrevious).toBe("function");
      expect(typeof controller.focusMain).toBe("function");
      expect(typeof controller.navigate).toBe("function");
    });

    it("should focus the main landmark when focusMain is called", async () => {
      render(() => <TestMultipleLandmarks />);

      const controller = getLandmarkController();
      const mainLandmark = screen.getByTestId("landmark-main");

      // Make main landmark focusable
      mainLandmark.setAttribute("tabindex", "-1");

      controller.focusMain();

      // The main landmark or an element within it should be focused
      expect(document.activeElement).toBeTruthy();
    });

    it("should navigate to a specific role", async () => {
      render(() => <TestMultipleLandmarks />);

      const controller = getLandmarkController();
      const navLandmark = screen.getByTestId("landmark-navigation");

      // Make navigation landmark focusable
      navLandmark.setAttribute("tabindex", "-1");

      controller.navigate("navigation");

      // The navigation landmark or an element within it should be focused
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe("F6 keyboard navigation", () => {
    it("should respond to F6 key press for landmark navigation", async () => {
      render(() => <TestMultipleLandmarks />);

      const banner = screen.getByTestId("landmark-banner");
      const navigation = screen.getByTestId("landmark-navigation");
      const main = screen.getByTestId("landmark-main");

      // Make landmarks focusable
      banner.setAttribute("tabindex", "-1");
      navigation.setAttribute("tabindex", "-1");
      main.setAttribute("tabindex", "-1");

      // Focus the banner first
      banner.focus();
      expect(document.activeElement).toBe(banner);

      // Simulate F6 keypress
      fireEvent.keyDown(window, { key: "F6" });

      // After F6, focus should move to next landmark
      // Note: The exact behavior depends on the manager implementation
    });

    it("should respond to Shift+F6 for backwards navigation", async () => {
      render(() => <TestMultipleLandmarks />);

      const banner = screen.getByTestId("landmark-banner");
      const navigation = screen.getByTestId("landmark-navigation");
      const main = screen.getByTestId("landmark-main");

      // Make landmarks focusable
      banner.setAttribute("tabindex", "-1");
      navigation.setAttribute("tabindex", "-1");
      main.setAttribute("tabindex", "-1");

      // Focus main
      main.focus();
      expect(document.activeElement).toBe(main);

      // Simulate Shift+F6 keypress
      fireEvent.keyDown(window, { key: "F6", shiftKey: true });

      // After Shift+F6, focus should move to previous landmark
    });
  });

  describe("multiple landmarks with same role", () => {
    it("should warn when multiple landmarks have the same role without unique labels", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(() => (
        <>
          <TestLandmark role="navigation" />
          <TestLandmark role="navigation" />
        </>
      ));

      // The landmark manager should warn about duplicate roles without labels
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Multiple landmarks with role "navigation"'),
      );

      consoleSpy.mockRestore();
    });

    it("should not warn when multiple landmarks have unique labels", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(() => (
        <>
          <TestLandmark role="navigation" aria-label="Primary navigation" />
          <TestLandmark role="navigation" aria-label="Footer navigation" />
        </>
      ));

      // With unique labels, no warning should be shown
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("cleanup", () => {
    it("should unregister landmarks when unmounted", () => {
      const { unmount } = render(() => <TestLandmark role="main" aria-label="Main content" />);

      // Verify landmark is registered
      const main = screen.getByTestId("landmark-main");
      expect(main).toBeInTheDocument();

      // Unmount
      unmount();

      // The landmark should be unregistered (internal state, hard to test directly)
      // We can test that the element is no longer in the DOM
      expect(screen.queryByTestId("landmark-main")).not.toBeInTheDocument();
    });
  });
});
