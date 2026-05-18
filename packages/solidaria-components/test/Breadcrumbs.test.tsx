/**
 * Breadcrumbs tests - Port of React Aria's Breadcrumbs.test.tsx
 *
 * Tests for Breadcrumbs component functionality including:
 * - Rendering
 * - Navigation structure
 * - Current item
 * - Disabled state
 * - Links/navigation
 * - ARIA attributes
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { Breadcrumbs, BreadcrumbItem } from "../src/Breadcrumbs";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

// Sample breadcrumb items for testing
const breadcrumbItems = [
  { id: "home", label: "Home", href: "/" },
  { id: "products", label: "Products", href: "/products" },
  { id: "category", label: "Category", href: "/products/category" },
];

describe("Breadcrumbs", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const breadcrumbs = document.querySelector(".solidaria-Breadcrumbs");
      expect(breadcrumbs).toBeInTheDocument();
    });

    it("should render navigation element", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });

    it("should render list", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
    });

    it("should render all items", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Category")).toBeInTheDocument();
    });

    it("should render static breadcrumb children", () => {
      render(() => (
        <Breadcrumbs aria-label="Static breadcrumbs">
          <BreadcrumbItem id="home" href="/">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem id="products" href="/products">
            Products
          </BreadcrumbItem>
          <BreadcrumbItem id="category">Category</BreadcrumbItem>
        </Breadcrumbs>
      ));

      expect(screen.getByRole("navigation", { name: "Static breadcrumbs" })).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
      expect(screen.getByText("Category")).toHaveAttribute("aria-current", "page");
    });

    it("should render with custom class", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id} class="my-breadcrumbs">
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const breadcrumbs = document.querySelector(".my-breadcrumbs");
      expect(breadcrumbs).toBeInTheDocument();
    });
  });

  // ============================================
  // BREADCRUMB ITEMS
  // ============================================

  describe("breadcrumb items", () => {
    it("should render BreadcrumbItem with default class", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const items = document.querySelectorAll(".solidaria-BreadcrumbItem");
      expect(items).toHaveLength(3);
    });

    it("should render links", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const links = screen.getAllByRole("link");
      // Last breadcrumb is current by default and therefore non-interactive.
      expect(links).toHaveLength(2);
    });

    it("should have correct href on links", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const homeLink = screen.getByText("Home");
      expect(homeLink).toHaveAttribute("href", "/");

      const productsLink = screen.getByText("Products");
      expect(productsLink).toHaveAttribute("href", "/products");
    });
  });

  // ============================================
  // CURRENT ITEM
  // ============================================

  describe("current item", () => {
    it("should mark last item as current by default", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const currentItem = screen.getByText("Category");
      expect(currentItem).toHaveAttribute("aria-current", "page");
    });

    it("should mark last item as current", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => (
            <BreadcrumbItem href={item.href} isCurrent={item.id === "category"}>
              {item.label}
            </BreadcrumbItem>
          )}
        </Breadcrumbs>
      ));

      const currentItem = screen.getByText("Category");
      expect(currentItem).toHaveAttribute("data-current");
    });

    it("should have aria-current on current item", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => (
            <BreadcrumbItem href={item.href} isCurrent={item.id === "category"}>
              {item.label}
            </BreadcrumbItem>
          )}
        </Breadcrumbs>
      ));

      const currentItem = screen.getByText("Category");
      expect(currentItem).toHaveAttribute("aria-current", "page");
    });

    it("should not have aria-current on non-current items", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => (
            <BreadcrumbItem href={item.href} isCurrent={item.id === "category"}>
              {item.label}
            </BreadcrumbItem>
          )}
        </Breadcrumbs>
      ));

      const homeLink = screen.getByText("Home");
      expect(homeLink).not.toHaveAttribute("aria-current");
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should support isDisabled on Breadcrumbs", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id} isDisabled>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const breadcrumbs = document.querySelector(".solidaria-Breadcrumbs");
      expect(breadcrumbs).toHaveAttribute("data-disabled");
    });

    it("should support isDisabled on BreadcrumbItem", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => (
            <BreadcrumbItem href={item.href} isDisabled={item.id === "products"}>
              {item.label}
            </BreadcrumbItem>
          )}
        </Breadcrumbs>
      ));

      const productsLink = screen.getByText("Products");
      expect(productsLink).toHaveAttribute("data-disabled");
    });
  });

  // ============================================
  // INTERACTION
  // ============================================

  describe("interaction", () => {
    it("should call onPress when clicking a breadcrumb", async () => {
      const onPress = vi.fn();
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => (
            <BreadcrumbItem href={item.href} onPress={item.id === "home" ? onPress : undefined}>
              {item.label}
            </BreadcrumbItem>
          )}
        </Breadcrumbs>
      ));

      const homeLink = screen.getByText("Home");
      await user.click(homeLink);

      expect(onPress).toHaveBeenCalled();
    });

    it("should call onAction with item key when clicking a breadcrumb", async () => {
      const onAction = vi.fn();
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id} onAction={onAction}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      await user.click(screen.getByText("Products"));
      expect(onAction).toHaveBeenCalledWith("products");
    });

    it("should call onAction using custom getKey", async () => {
      const onAction = vi.fn();
      render(() => (
        <Breadcrumbs
          items={breadcrumbItems}
          getKey={(item) => `${item.id}-key`}
          onAction={onAction}
        >
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      await user.click(screen.getByText("Home"));
      expect(onAction).toHaveBeenCalledWith("home-key");
    });

    it("should call onAction for static children using BreadcrumbItem ids", async () => {
      const onAction = vi.fn();
      render(() => (
        <Breadcrumbs onAction={onAction} aria-label="Static action breadcrumbs">
          <BreadcrumbItem id="home" href="/">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem id="products" href="/products">
            Products
          </BreadcrumbItem>
          <BreadcrumbItem id="category">Category</BreadcrumbItem>
        </Breadcrumbs>
      ));

      await user.click(screen.getByText("Products"));
      expect(onAction).toHaveBeenCalledWith("products");
    });

    it("should not call onAction for current breadcrumb item", async () => {
      const onAction = vi.fn();
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id} onAction={onAction}>
          {(item) => (
            <BreadcrumbItem href={item.href} isCurrent={item.id === "category"}>
              {item.label}
            </BreadcrumbItem>
          )}
        </Breadcrumbs>
      ));

      await user.click(screen.getByText("Category"));
      expect(onAction).not.toHaveBeenCalled();
    });

    it("should not call onAction for disabled breadcrumb item", async () => {
      const onAction = vi.fn();
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id} onAction={onAction}>
          {(item) => (
            <BreadcrumbItem href={item.href} isDisabled={item.id === "products"}>
              {item.label}
            </BreadcrumbItem>
          )}
        </Breadcrumbs>
      ));

      await user.click(screen.getByText("Products"));
      expect(onAction).not.toHaveBeenCalled();
    });

    it("should expose focused and hovered state data attributes", async () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const homeLink = screen.getByText("Home");
      homeLink.focus();
      expect(homeLink).toHaveAttribute("data-focused");

      await user.hover(homeLink);
      expect(homeLink).toHaveAttribute("data-hovered");
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have navigation role", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });

    it("should have aria-label when provided", () => {
      render(() => (
        <Breadcrumbs
          items={breadcrumbItems}
          getKey={(item) => item.id}
          aria-label="Breadcrumb navigation"
        >
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Breadcrumb navigation");
    });

    it("should support aria-labelledby without forcing aria-label", () => {
      render(() => (
        <div>
          <h2 id="crumb-title">Breadcrumb path</h2>
          <Breadcrumbs
            items={breadcrumbItems}
            getKey={(item) => item.id}
            aria-labelledby="crumb-title"
          >
            {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
          </Breadcrumbs>
        </div>
      ));

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-labelledby", "crumb-title");
      expect(nav).not.toHaveAttribute("aria-label");
    });

    it("should have list role for ol element", () => {
      render(() => (
        <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
          {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const list = screen.getByRole("list");
      expect(list.tagName.toLowerCase()).toBe("ol");
    });
  });

  // ============================================
  // EMPTY STATE
  // ============================================

  describe("empty state", () => {
    it("should render empty breadcrumbs", () => {
      render(() => (
        <Breadcrumbs items={[]} getKey={(item: { id: string }) => item.id}>
          {(item: { id: string; label: string }) => <BreadcrumbItem>{item.label}</BreadcrumbItem>}
        </Breadcrumbs>
      ));

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();

      const items = document.querySelectorAll(".solidaria-BreadcrumbItem");
      expect(items).toHaveLength(0);
    });
  });

  // ============================================
  // RTL (Right-to-Left) SUPPORT
  // ============================================

  describe("RTL support", () => {
    it("should render breadcrumbs correctly within RTL context", () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
            {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
          </Breadcrumbs>
        </I18nProvider>
      ));

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();

      // All items should render
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Category")).toBeInTheDocument();
    });

    it("should maintain correct aria-current in RTL", () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
            {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
          </Breadcrumbs>
        </I18nProvider>
      ));

      // Last item should still be current in RTL
      const currentItem = screen.getByText("Category");
      expect(currentItem).toHaveAttribute("aria-current", "page");
    });

    it("should maintain link functionality in RTL", async () => {
      const onAction = vi.fn();
      render(() => (
        <I18nProvider locale="ar-AE">
          <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id} onAction={onAction}>
            {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
          </Breadcrumbs>
        </I18nProvider>
      ));

      await user.click(screen.getByText("Home"));
      expect(onAction).toHaveBeenCalledWith("home");
    });

    it("links should preserve correct href in RTL", () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <Breadcrumbs items={breadcrumbItems} getKey={(item) => item.id}>
            {(item) => <BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>}
          </Breadcrumbs>
        </I18nProvider>
      ));

      const homeLink = screen.getByText("Home");
      expect(homeLink).toHaveAttribute("href", "/");

      const productsLink = screen.getByText("Products");
      expect(productsLink).toHaveAttribute("href", "/products");
    });
  });
});
