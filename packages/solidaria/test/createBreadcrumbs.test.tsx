/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import {
  createBreadcrumbItem,
  createBreadcrumbs,
  type AriaBreadcrumbItemProps,
  type AriaBreadcrumbsProps,
} from "../src/breadcrumbs";

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

function TestBreadcrumbHeading(props: AriaBreadcrumbItemProps) {
  const { itemProps } = createBreadcrumbItem(props);
  return (
    <h2 data-testid="breadcrumb-heading" {...itemProps}>
      Section
    </h2>
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

  it("uses the catalog label when aria-label is empty", () => {
    render(() => <TestBreadcrumbsNav aria-label="" />);
    expect(screen.getByTestId("breadcrumbs-nav")).toHaveAttribute("aria-label", "Breadcrumbs");
  });
});

describe("createBreadcrumbItem", () => {
  it("marks current item with aria-current and removes href", () => {
    render(() => <TestBreadcrumbItem isCurrent href="/products" />);
    const item = screen.getByTestId("breadcrumb-item");
    expect(item).toHaveAttribute("aria-current", "page");
    expect(item).not.toHaveAttribute("href");
  });

  it("uses page when a current item's aria-current is empty or false", () => {
    const { unmount } = render(() => <TestBreadcrumbItem isCurrent aria-current="" />);
    expect(screen.getByTestId("breadcrumb-item")).toHaveAttribute("aria-current", "page");
    unmount();

    render(() => <TestBreadcrumbItem isCurrent aria-current={false} />);
    expect(screen.getByTestId("breadcrumb-item")).toHaveAttribute("aria-current", "page");
  });

  it("keeps a current item's aria-current token", () => {
    render(() => <TestBreadcrumbItem isCurrent aria-current="step" />);
    expect(screen.getByTestId("breadcrumb-item")).toHaveAttribute("aria-current", "step");
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

  it("gives a current item tabIndex -1 when autoFocus is set", () => {
    render(() => <TestBreadcrumbItem isCurrent autoFocus />);
    expect(screen.getByTestId("breadcrumb-item")).toHaveAttribute("tabindex", "-1");
  });

  it("does not expose a heading breadcrumb as a link", () => {
    const onPress = vi.fn();
    render(() => <TestBreadcrumbHeading elementType="h2" href="/section" onPress={onPress} />);
    const item = screen.getByTestId("breadcrumb-heading");
    expect(item).not.toHaveAttribute("role");
    expect(item).not.toHaveAttribute("tabindex");
    fireEvent.click(item);
    expect(onPress).not.toHaveBeenCalled();
  });
});
