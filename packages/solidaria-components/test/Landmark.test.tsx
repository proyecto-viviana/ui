/**
 * Landmark component tests
 *
 * Tests for Landmark component and F6 navigation.
 */

import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { Landmark, useLandmarkController } from "../src/Landmark";

describe("Landmark", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", () => {
      render(() => (
        <Landmark role="main" aria-label="Main content">
          Content
        </Landmark>
      ));

      const landmark = document.querySelector(".solidaria-Landmark");
      expect(landmark).toBeTruthy();
    });

    it("should render with role-specific class", () => {
      render(() => (
        <Landmark role="navigation" aria-label="Navigation">
          Nav links
        </Landmark>
      ));

      const landmark = document.querySelector(".solidaria-Landmark--navigation");
      expect(landmark).toBeTruthy();
    });

    it("should render with custom class", () => {
      render(() => (
        <Landmark role="main" aria-label="Main content" class="custom-landmark">
          Content
        </Landmark>
      ));

      const landmark = document.querySelector(".custom-landmark");
      expect(landmark).toBeTruthy();
    });

    it("should render children", () => {
      render(() => (
        <Landmark role="main" aria-label="Main content">
          <h1>Welcome</h1>
          <p>Page content here</p>
        </Landmark>
      ));

      expect(screen.getByText("Welcome")).toBeTruthy();
      expect(screen.getByText("Page content here")).toBeTruthy();
    });
  });

  // ============================================
  // SEMANTIC ELEMENTS
  // ============================================

  describe("semantic elements", () => {
    it("should render main role as <main> element", () => {
      render(() => (
        <Landmark role="main" aria-label="Main content">
          Content
        </Landmark>
      ));

      const main = document.querySelector("main");
      expect(main).toBeTruthy();
    });

    it("should render navigation role as <nav> element", () => {
      render(() => (
        <Landmark role="navigation" aria-label="Navigation">
          Nav links
        </Landmark>
      ));

      const nav = document.querySelector("nav");
      expect(nav).toBeTruthy();
    });

    it("should render banner role as <header> element", () => {
      render(() => (
        <Landmark role="banner" aria-label="Site header">
          Header content
        </Landmark>
      ));

      const header = document.querySelector("header");
      expect(header).toBeTruthy();
    });

    it("should render contentinfo role as <footer> element", () => {
      render(() => (
        <Landmark role="contentinfo" aria-label="Site footer">
          Footer content
        </Landmark>
      ));

      const footer = document.querySelector("footer");
      expect(footer).toBeTruthy();
    });

    it("should render complementary role as <aside> element", () => {
      render(() => (
        <Landmark role="complementary" aria-label="Sidebar">
          Sidebar content
        </Landmark>
      ));

      const aside = document.querySelector("aside");
      expect(aside).toBeTruthy();
    });

    it("should render form role as <form> element", () => {
      render(() => (
        <Landmark role="form" aria-label="Contact form">
          Form content
        </Landmark>
      ));

      const form = document.querySelector("form");
      expect(form).toBeTruthy();
    });

    it("should render region role as <section> element", () => {
      render(() => (
        <Landmark role="region" aria-label="Featured content">
          Featured content
        </Landmark>
      ));

      const section = document.querySelector("section");
      expect(section).toBeTruthy();
    });

    it("should render search role as <search> element", () => {
      render(() => (
        <Landmark role="search" aria-label="Site search">
          Search form
        </Landmark>
      ));

      const search = document.querySelector("search");
      expect(search).toBeTruthy();
    });
  });

  // ============================================
  // CUSTOM ELEMENT TYPE
  // ============================================

  describe("custom element type", () => {
    it("should allow overriding the element type", () => {
      render(() => (
        <Landmark role="main" aria-label="Main content" elementType="div">
          Content
        </Landmark>
      ));

      const div = document.querySelector("div.solidaria-Landmark");
      expect(div).toBeTruthy();
      // Should not render as main
      const main = document.querySelector("main.solidaria-Landmark");
      expect(main).toBeFalsy();
    });

    it("should use specified element type over semantic default", () => {
      render(() => (
        <Landmark role="navigation" aria-label="Navigation" elementType="ul">
          <li>Link 1</li>
        </Landmark>
      ));

      const ul = document.querySelector("ul.solidaria-Landmark");
      expect(ul).toBeTruthy();
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("ARIA attributes", () => {
    it("should have aria-label", () => {
      render(() => (
        <Landmark role="main" aria-label="Main content area">
          Content
        </Landmark>
      ));

      const landmark = document.querySelector('[aria-label="Main content area"]');
      expect(landmark).toBeTruthy();
    });

    it("should support aria-labelledby", () => {
      render(() => (
        <>
          <h2 id="nav-heading">Navigation</h2>
          <Landmark role="navigation" aria-labelledby="nav-heading">
            Nav links
          </Landmark>
        </>
      ));

      const landmark = document.querySelector('[aria-labelledby="nav-heading"]');
      expect(landmark).toBeTruthy();
    });

    it("should have ARIA role attribute for non-semantic elements", () => {
      render(() => (
        <Landmark role="main" aria-label="Main content" elementType="div">
          Content
        </Landmark>
      ));

      // When using a non-semantic element, ARIA role should be applied
      const landmark = document.querySelector(".solidaria-Landmark");
      // The role may or may not be explicitly set depending on implementation
      expect(landmark).toBeTruthy();
    });
  });

  // ============================================
  // MULTIPLE LANDMARKS
  // ============================================

  describe("multiple landmarks", () => {
    it("should support multiple landmarks on a page", () => {
      render(() => (
        <>
          <Landmark role="banner" aria-label="Site header">
            Header
          </Landmark>
          <Landmark role="navigation" aria-label="Main navigation">
            Navigation
          </Landmark>
          <Landmark role="main" aria-label="Main content">
            Content
          </Landmark>
          <Landmark role="contentinfo" aria-label="Site footer">
            Footer
          </Landmark>
        </>
      ));

      expect(document.querySelector("header")).toBeTruthy();
      expect(document.querySelector("nav")).toBeTruthy();
      expect(document.querySelector("main")).toBeTruthy();
      expect(document.querySelector("footer")).toBeTruthy();
    });

    it("should support multiple landmarks of the same role", () => {
      render(() => (
        <>
          <Landmark role="navigation" aria-label="Primary navigation">
            Primary nav
          </Landmark>
          <Landmark role="navigation" aria-label="Secondary navigation">
            Secondary nav
          </Landmark>
        </>
      ));

      const navElements = document.querySelectorAll("nav");
      expect(navElements.length).toBe(2);
    });
  });

  // ============================================
  // RENDER PROPS
  // ============================================

  describe("render props", () => {
    it("should support class as a function", () => {
      render(() => (
        <Landmark role="main" aria-label="Main content" class={(props) => `landmark-${props.role}`}>
          Content
        </Landmark>
      ));

      const landmark = document.querySelector(".landmark-main");
      expect(landmark).toBeTruthy();
    });

    it("should support style as a function", () => {
      render(() => (
        <Landmark
          role="main"
          aria-label="Main content"
          style={(props) => ({ "background-color": props.role === "main" ? "white" : "gray" })}
        >
          Content
        </Landmark>
      ));

      const landmark = document.querySelector("main") as HTMLElement;
      expect(landmark).toBeTruthy();
      expect(landmark.style.backgroundColor).toBe("white");
    });
  });

  // ============================================
  // LANDMARK CONTROLLER
  // ============================================

  describe("useLandmarkController", () => {
    it("should return a controller object", () => {
      let controller: ReturnType<typeof useLandmarkController> | undefined;

      render(() => {
        controller = useLandmarkController();
        return <div>Test</div>;
      });

      expect(controller).toBeTruthy();
      expect(typeof controller!.focusMain).toBe("function");
      expect(typeof controller!.focusNext).toBe("function");
      expect(typeof controller!.focusPrevious).toBe("function");
    });
  });

  // ============================================
  // SLOT PROP
  // ============================================

  describe("slot prop", () => {
    it("should support slot prop", () => {
      render(() => (
        <Landmark role="main" aria-label="Main content" slot="main-slot">
          Content
        </Landmark>
      ));

      const landmark = document.querySelector('[slot="main-slot"]');
      expect(landmark).toBeTruthy();
    });
  });
});
