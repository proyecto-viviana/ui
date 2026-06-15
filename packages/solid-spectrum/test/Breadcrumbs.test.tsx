/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { Breadcrumb, BreadcrumbItem, Breadcrumbs, BreadcrumbsContext } from "../src/breadcrumbs";
import * as BreadcrumbsSubpath from "../src/Breadcrumbs";

afterEach(() => cleanup());

interface CrumbItem {
  id: string;
  label: string;
  href?: string;
}

const crumbItems: CrumbItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "react-spectrum", label: "React Spectrum", href: "/react-spectrum" },
  { id: "breadcrumbs", label: "Breadcrumbs" },
];

const overflowItems: CrumbItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "files", label: "Files", href: "/files" },
  { id: "projects", label: "Projects", href: "/files/projects" },
  { id: "reports", label: "Reports", href: "/files/projects/reports" },
  { id: "annual", label: "Annual report" },
];

describe("Breadcrumbs (solid-spectrum)", () => {
  it("mirrors the public S2 Breadcrumbs subpath exports", () => {
    expect(BreadcrumbsSubpath.Breadcrumbs).toBe(Breadcrumbs);
    expect(BreadcrumbsSubpath.Breadcrumb).toBe(Breadcrumb);
    expect(BreadcrumbsSubpath.BreadcrumbItem).toBe(BreadcrumbItem);
    expect(BreadcrumbsSubpath.BreadcrumbsContext).toBe(BreadcrumbsContext);
  });

  it("supports the documented static Breadcrumbs/Breadcrumb composition", () => {
    render(() => (
      <Breadcrumbs aria-label="Static breadcrumbs">
        <Breadcrumb href="/">Home</Breadcrumb>
        <Breadcrumb href="/react-spectrum">React Spectrum</Breadcrumb>
        <Breadcrumb>Breadcrumbs</Breadcrumb>
      </Breadcrumbs>
    ));

    expect(screen.getByRole("navigation", { name: "Static breadcrumbs" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    const current = screen.getByText("Breadcrumbs");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.tagName).toBe("DIV");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("supports dynamic collections and forwards onAction keys", async () => {
    const user = setupUser();
    const onAction = vi.fn();
    render(() => (
      <Breadcrumbs
        items={crumbItems}
        getKey={(item) => item.id}
        onAction={onAction}
        aria-label="Collection breadcrumbs"
      >
        {(item) => <Breadcrumb href={item.href}>{item.label}</Breadcrumb>}
      </Breadcrumbs>
    ));

    await user.click(screen.getByText("React Spectrum"));
    expect(onAction).toHaveBeenCalledWith("react-spectrum");
  });

  it("passes render props through Breadcrumb children", () => {
    render(() => (
      <Breadcrumbs
        items={crumbItems}
        getKey={(item) => item.id}
        aria-label="Render prop breadcrumbs"
      >
        {(item) => (
          <Breadcrumb href={item.href}>
            {(renderProps) => `${item.label}-${renderProps.isCurrent ? "current" : "link"}`}
          </Breadcrumb>
        )}
      </Breadcrumbs>
    ));

    expect(screen.getByText("Home-link")).toBeInTheDocument();
    expect(screen.getByText("Breadcrumbs-current")).toBeInTheDocument();
  });

  it("applies disabled state from Breadcrumbs to items", async () => {
    const user = setupUser();
    const onAction = vi.fn();
    render(() => (
      <Breadcrumbs
        items={crumbItems}
        getKey={(item) => item.id}
        isDisabled
        onAction={onAction}
        aria-label="Disabled breadcrumbs"
      >
        {(item) => <Breadcrumb href={item.href}>{item.label}</Breadcrumb>}
      </Breadcrumbs>
    ));

    expect(screen.getByRole("navigation")).toHaveAttribute("data-disabled");
    expect(screen.getByText("Home")).toHaveAttribute("data-disabled");

    await user.click(screen.getByText("Home"));
    expect(onAction).not.toHaveBeenCalled();
  });

  it("uses S2 size values and keeps legacy size aliases compatible", () => {
    render(() => (
      <div>
        <Breadcrumbs
          items={crumbItems}
          getKey={(item) => item.id}
          size="L"
          aria-label="Large breadcrumbs"
        >
          {(item) => <Breadcrumb href={item.href}>{item.label}</Breadcrumb>}
        </Breadcrumbs>
        <Breadcrumbs
          items={crumbItems}
          getKey={(item) => item.id}
          size="lg"
          aria-label="Legacy large breadcrumbs"
        >
          {(item) => <Breadcrumb href={item.href}>{item.label}</Breadcrumb>}
        </Breadcrumbs>
      </div>
    ));

    const large = screen.getByRole("navigation", { name: "Large breadcrumbs" });
    const legacyLarge = screen.getByRole("navigation", { name: "Legacy large breadcrumbs" });
    expect(large.className).toBeTruthy();
    expect(legacyLarge.className).toBeTruthy();
    expect(large.className).toBe(legacyLarge.className);
  });

  it("collapses collection overflow into a breadcrumb menu", async () => {
    const user = setupUser();
    const onAction = vi.fn();
    render(() => (
      <Breadcrumbs
        items={overflowItems}
        getKey={(item) => item.id}
        onAction={onAction}
        aria-label="Overflow breadcrumbs"
      >
        {(item) => <Breadcrumb href={item.href}>{item.label}</Breadcrumb>}
      </Breadcrumbs>
    ));

    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.queryByText("Files")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "More items" }));
    const menu = await screen.findByRole("menu", { name: "More items" });
    await user.click(within(menu).getByRole("menuitem", { name: "Files" }));

    expect(onAction).toHaveBeenCalledWith("files");
  });
});
