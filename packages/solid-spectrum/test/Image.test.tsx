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
        fetchPriority="high"
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
    expect(img).toHaveAttribute("fetchpriority", "high");
    expect(img).toHaveAttribute("itemprop", "thumbnail");

    fireEvent.load(img);
    await waitFor(() => expect(img.className).not.toBe(""));
  });

  it("matches S2 wrapper prop boundaries and unsafe escape hatches", () => {
    const onClick = vi.fn();
    render(() => (
      <Image
        src="/preview.png"
        alt="Preview"
        id="image-id"
        data-testid="image"
        aria-label="Ignored"
        onClick={onClick}
        class="local-image"
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
    expect(wrapper).toHaveClass("local-image");
    expect(wrapper).toHaveClass("unsafe-image");
    expect(wrapper).toHaveStyle({ margin: "2px" });
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
            { colorScheme: "dark", srcSet: "/dark.png", media: "(min-width: 1px)" },
          ]}
        />
      </Provider>
    ));

    const source = container.querySelector("source");
    expect(container.querySelectorAll("source")).toHaveLength(1);
    expect(source).toHaveAttribute("srcset", "/dark.png");
    expect(source).toHaveAttribute("media", "(min-width: 1px)");
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
});
