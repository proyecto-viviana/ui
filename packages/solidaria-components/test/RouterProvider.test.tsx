import { describe, it, expect, vi } from "vite-plus/test";
import { render } from "@solidjs/testing-library";
import { RouterProvider, RouterContext, useRouter } from "../src/RouterProvider";

describe("RouterProvider", () => {
  it("renders children", () => {
    const { getByTestId } = render(() => (
      <RouterProvider navigate={() => {}}>
        <div data-testid="child">Hello</div>
      </RouterProvider>
    ));
    expect(getByTestId("child")).toBeDefined();
    expect(getByTestId("child").textContent).toBe("Hello");
  });

  it("provides navigate function via context", () => {
    const navigate = vi.fn();
    let routerValue: ReturnType<typeof useRouter> | undefined;

    function Consumer() {
      routerValue = useRouter();
      return <div data-testid="consumer">{routerValue.isNative ? "native" : "custom"}</div>;
    }

    const { getByTestId } = render(() => (
      <RouterProvider navigate={navigate}>
        <Consumer />
      </RouterProvider>
    ));

    expect(routerValue).toBeDefined();
    expect(routerValue!.isNative).toBe(false);
    expect(getByTestId("consumer").textContent).toBe("custom");
  });

  it("defaults to identity useHref", () => {
    let routerValue: ReturnType<typeof useRouter> | undefined;

    function Consumer() {
      routerValue = useRouter();
      return <div />;
    }

    render(() => (
      <RouterProvider navigate={() => {}}>
        <Consumer />
      </RouterProvider>
    ));

    expect(routerValue!.useHref("/test")).toBe("/test");
  });

  it("uses custom useHref when provided", () => {
    let routerValue: ReturnType<typeof useRouter> | undefined;

    function Consumer() {
      routerValue = useRouter();
      return <div />;
    }

    render(() => (
      <RouterProvider navigate={() => {}} useHref={(href) => `/base${href}`}>
        <Consumer />
      </RouterProvider>
    ));

    expect(routerValue!.useHref("/test")).toBe("/base/test");
  });

  it("provides native router by default (no provider)", () => {
    let routerValue: ReturnType<typeof useRouter> | undefined;

    function Consumer() {
      routerValue = useRouter();
      return <div />;
    }

    render(() => <Consumer />);

    expect(routerValue!.isNative).toBe(true);
  });
});
