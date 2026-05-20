import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { Image, ImageContext, ImageCoordinator, Provider } from "../src";

describe("Image", () => {
  it("renders the S2 wrapper and native image attributes", async () => {
    const { container } = render(() => (
      <Image
        src="/preview.png"
        alt="Preview"
        width={160}
        height={90}
        crossOrigin="anonymous"
        decoding="async"
        fetchPriority="high"
        loading="lazy"
        referrerPolicy="no-referrer"
        itemProp="thumbnail"
      />
    ));

    const wrapper = container.firstElementChild;
    const img = screen.getByRole("img", { name: "Preview" });

    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.tagName).toBe("DIV");
    expect(img).toHaveAttribute("src", "/preview.png");
    expect(img).toHaveAttribute("width", "160");
    expect(img).toHaveAttribute("height", "90");
    expect(img).toHaveAttribute("crossorigin", "anonymous");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveAttribute("fetchpriority", "high");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(img).toHaveAttribute("itemprop", "thumbnail");

    fireEvent.load(img);
    await waitFor(() => expect(img.className).not.toBe(""));
  });

  it("matches S2 wrapper prop boundaries and unsafe escape hatches", () => {
    const onClick = vi.fn();
    render(() => (
      <Image
        {...({
          class: "local-image",
          id: "image-id",
          "data-testid": "image",
          "aria-label": "Ignored",
          onClick,
        } as Record<string, unknown>)}
        src="/preview.png"
        alt="Preview"
        UNSAFE_className="unsafe-image"
        UNSAFE_style={{ margin: "2px" }}
      />
    ));

    const wrapper = screen.getByRole("img", { name: "Preview" }).parentElement as HTMLElement;
    wrapper.click();

    expect(wrapper).not.toHaveAttribute("id");
    expect(wrapper).not.toHaveAttribute("data-testid");
    expect(wrapper).not.toHaveAttribute("aria-label");
    expect(onClick).not.toHaveBeenCalled();
    expect(wrapper).not.toHaveClass("local-image");
    expect(wrapper).toHaveClass("unsafe-image");
    expect(wrapper).toHaveStyle({ margin: "2px" });
  });

  it("exposes the S2 wrapper ref", () => {
    const callbackRef = vi.fn();
    const objectRef: { current: HTMLDivElement | null } = { current: null };

    render(() => (
      <>
        <Image src="/callback.png" alt="Callback ref" ref={callbackRef} />
        <Image src="/object.png" alt="Object ref" ref={objectRef} />
      </>
    ));

    const callbackWrapper = screen.getByRole("img", { name: "Callback ref" }).parentElement;
    const objectWrapper = screen.getByRole("img", { name: "Object ref" }).parentElement;
    expect(callbackRef).toHaveBeenCalledWith(callbackWrapper);
    expect(objectRef.current).toBe(objectWrapper);
  });

  it("warns when alt text is omitted in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      render(() => <Image src="/preview.png" />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("alt"));
    } finally {
      warn.mockRestore();
    }
  });

  it("renders custom error content when the image fails", async () => {
    render(() => (
      <Image
        src="/missing.png"
        alt="Missing preview"
        renderError={() => <span>Error loading image</span>}
      />
    ));

    fireEvent.error(screen.getByRole("img", { name: "Missing preview" }));

    await waitFor(() => {
      expect(screen.getByText("Error loading image")).toBeInTheDocument();
    });
  });

  it("renders conditional sources according to provider color scheme", () => {
    const { container } = render(() => (
      <Provider colorScheme="dark">
        <Image
          alt="Conditional preview"
          src={[
            { colorScheme: "light", srcSet: "/light.png" },
            {
              colorScheme: "dark",
              srcSet: "/dark.png 1x",
              media: "(min-width: 1px)",
              sizes: "100vw",
              type: "image/png",
              width: 320,
              height: 180,
            },
          ]}
        />
      </Provider>
    ));

    const source = container.querySelector("source");
    expect(container.querySelectorAll("source")).toHaveLength(1);
    expect(source).toHaveAttribute("srcset", "/dark.png 1x");
    expect(source).toHaveAttribute("media", "(min-width: 1px)");
    expect(source).toHaveAttribute("sizes", "100vw");
    expect(source).toHaveAttribute("type", "image/png");
    expect(source).toHaveAttribute("width", "320");
    expect(source).toHaveAttribute("height", "180");
  });

  it("coordinates image reveal until all images in the group load", async () => {
    const { container } = render(() => (
      <ImageCoordinator>
        <Image src="/first.png" alt="First" />
        <Image src="/second.png" alt="Second" />
      </ImageCoordinator>
    ));

    const first = screen.getByRole("img", { name: "First" });
    const second = screen.getByRole("img", { name: "Second" });
    const firstWrapper = first.parentElement;
    const initialClass = firstWrapper?.className;

    fireEvent.load(first);
    await Promise.resolve();
    expect(firstWrapper?.className).toBe(initialClass);

    fireEvent.load(second);
    await waitFor(() => expect(firstWrapper?.className).not.toBe(initialClass));
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });

  it("applies ImageContext hidden and style props", () => {
    const { container } = render(() => (
      <ImageContext.Provider
        value={{
          hidden: true,
          UNSAFE_className: "context-image",
        }}
      >
        <Image src="/hidden.png" alt="Hidden" />
      </ImageContext.Provider>
    ));

    expect(screen.queryByRole("img", { name: "Hidden" })).toBeNull();
    expect(container.firstElementChild).toBeNull();
  });

  it("applies ImageContext styles and lets local unsafe props override class props", () => {
    render(() => (
      <ImageContext.Provider
        value={{
          UNSAFE_className: "context-image",
          UNSAFE_style: { margin: "2px", padding: "1px" },
          styles: "context-generated-image" as never,
        }}
      >
        <Image
          src="/context.png"
          alt="Context"
          UNSAFE_className="local-image"
          UNSAFE_style={{ margin: "4px" }}
          styles={"local-generated-image" as never}
        />
      </ImageContext.Provider>
    ));

    const wrapper = screen.getByRole("img", { name: "Context" }).parentElement as HTMLElement;
    expect(wrapper).toHaveClass("local-image");
    expect(wrapper).not.toHaveClass("context-image");
    expect(wrapper).toHaveClass("local-generated-image");
    expect(wrapper).toHaveClass("context-generated-image");
    expect(wrapper).toHaveStyle({ margin: "4px", padding: "1px" });
  });
});
