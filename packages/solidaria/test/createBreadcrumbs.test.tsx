/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import {
  createBreadcrumbItem,
  createBreadcrumbs,
  type AriaBreadcrumbItemProps,
  type AriaBreadcrumbsProps,
} from "../src/breadcrumbs";

afterEach(() => cleanup());

function TestBreadcrumbsNav(props: AriaBreadcrumbsProps) {
  const { navProps } = createBreadcrumbs(props);
  return <nav data-testid="breadcrumbs-nav" {...navProps} />;
}

function TestBreadcrumbItem(props: AriaBreadcrumbItemProps) {
  const { itemProps, isPressed } = createBreadcrumbItem(props);
  return (
    <a data-testid="breadcrumb-item" data-pressed={isPressed() || undefined} {...itemProps}>
      Item
    </a>
  );
}

describe("createBreadcrumbs", () => {
  it("applies default aria-label when no label props are provided", () => {
    render(() => <TestBreadcrumbsNav />);
    expect(screen.getByTestId("breadcrumbs-nav")).toHaveAttribute("aria-label", "Breadcrumbs");
  });

  it("does not force default aria-label when aria-labelledby is provided", () => {
    render(() => (
      <div>
        <span id="crumb-label">Path</span>
        <TestBreadcrumbsNav aria-labelledby="crumb-label" />
      </div>
    ));

    const nav = screen.getByTestId("breadcrumbs-nav");
    expect(nav).toHaveAttribute("aria-labelledby", "crumb-label");
    expect(nav).not.toHaveAttribute("aria-label");
  });

  it("uses explicit aria-label when provided", () => {
    render(() => <TestBreadcrumbsNav aria-label="Breadcrumb trail" />);
    expect(screen.getByTestId("breadcrumbs-nav")).toHaveAttribute("aria-label", "Breadcrumb trail");
  });
});

describe("createBreadcrumbItem", () => {
  it("marks current item with aria-current and removes href", () => {
    render(() => <TestBreadcrumbItem isCurrent href="/products" />);
    const item = screen.getByTestId("breadcrumb-item");
    expect(item).toHaveAttribute("aria-current", "page");
    expect(item).not.toHaveAttribute("href");
  });

  it("forwards id and labeling props", () => {
    render(() => (
      <TestBreadcrumbItem
        id="crumb-products"
        href="/products"
        aria-labelledby="crumb-label"
        aria-describedby="crumb-description"
      />
    ));

    const item = screen.getByTestId("breadcrumb-item");
    expect(item).toHaveAttribute("id", "crumb-products");
    expect(item).toHaveAttribute("aria-labelledby", "crumb-label");
    expect(item).toHaveAttribute("aria-describedby", "crumb-description");
  });

  it("fires onPress for non-current breadcrumb items", () => {
    const onPress = vi.fn();
    render(() => <TestBreadcrumbItem href="/products" onPress={onPress} />);

    fireEvent.click(screen.getByTestId("breadcrumb-item"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress for current breadcrumb items", () => {
    const onPress = vi.fn();
    render(() => <TestBreadcrumbItem isCurrent href="/products" onPress={onPress} />);

    fireEvent.click(screen.getByTestId("breadcrumb-item"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("adds aria-disabled for disabled breadcrumbs", () => {
    render(() => <TestBreadcrumbItem href="/products" isDisabled />);
    expect(screen.getByTestId("breadcrumb-item")).toHaveAttribute("aria-disabled", "true");
  });
});
