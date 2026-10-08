import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { Image, ImageContext, ImageCoordinator, Provider } from "../src";
import { Provider as UIProvider } from "../../viviana-ui/src/provider";
import {
  DEV,
  createContext,
  createRoot,
  createSignal,
  createEffect,
  flush,
  For,
  Show,
} from "solid-js";

import {
  Image as UIImage,
  ImageCoordinator as UICoordinator,
  ImageContext as UIContext,
} from "../../viviana-ui/src/image";

describe("Image lifecycle runtime", () => {
  it("uses client development reactivity", () => {
    expect(DEV, "Image lifecycle proof requires the client development runtime").toBeDefined();
    let dispose = () => {};
    let setValue!: (value: number) => void;
    const observed: number[] = [];
    createRoot((cleanup) => {
      dispose = cleanup;
      const [value, write] = createSignal(0);
      setValue = write;
      createEffect(value, (next) => {
        observed.push(next);
      });
    });
    try {
      flush();
      setValue(1);
      flush();
      expect(observed).toEqual([0, 1]);
    } finally {
      dispose();
    }
  });
});

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
      <ImageContext
        value={{
          hidden: true,
          UNSAFE_className: "context-image",
        }}
      >
        <Image src="/hidden.png" alt="Hidden" />
      </ImageContext>
    ));

    expect(screen.queryByRole("img", { name: "Hidden" })).toBeNull();
    expect(container.firstElementChild).toBeNull();
  });

  it("applies ImageContext styles and lets local unsafe props override class props", () => {
    render(() => (
      <ImageContext
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
      </ImageContext>
    ));

    const wrapper = screen.getByRole("img", { name: "Context" }).parentElement as HTMLElement;
    expect(wrapper).toHaveClass("local-image");
    expect(wrapper).not.toHaveClass("context-image");
    expect(wrapper).toHaveClass("local-generated-image");
    expect(wrapper).toHaveClass("context-generated-image");
    expect(wrapper).toHaveStyle({ margin: "4px", padding: "1px" });
  });
});

for (const [name, TwinImage, Coordinator, Context, TwinProvider] of [
  ["Spectrum", Image, ImageCoordinator, ImageContext, Provider],
  ["UI", UIImage, UICoordinator, UIContext, UIProvider],
] as const) {
  describe(`${name} Image lifecycle`, () => {
    async function drain() {
      await Promise.resolve();
      expect(() => flush()).not.toThrow();
      await Promise.resolve();
    }
    function change(action: () => void) {
      expect(() => {
        action();
        flush();
      }).not.toThrow();
    }
    function img(alt: string) {
      return screen.getByRole("img", { name: alt });
    }

    for (const loadedFirst of [false, true]) {
      it(`removes a pending keyed row with survivor loaded=${loadedFirst}`, async () => {
        expect(DEV).toBeDefined();
        const [rows, setRows] = createSignal(["survivor", "removed"]);
        const view = render(() => (
          <Coordinator>
            <For each={rows()}>
              {(row) => <TwinImage src={`/${name}-${loadedFirst}-${row}.png`} alt={row} />}
            </For>
          </Coordinator>
        ));
        await drain();
        const survivor = img("survivor");
        const wrapper = survivor.parentElement!;
        const pending = wrapper.className;
        if (loadedFirst) {
          fireEvent.load(survivor);
          await drain();
        }
        expect(wrapper.className).toBe(pending);
        change(() => setRows(["survivor"]));
        expect(screen.queryByRole("img", { name: "removed" })).toBeNull();
        expect(img("survivor")).toBe(survivor);
        if (!loadedFirst) {
          expect(wrapper.className).toBe(pending);
          fireEvent.load(survivor);
        }
        await drain();
        expect(wrapper.className).not.toBe(pending);
        change(() => setRows([]));
        expect(view.container.querySelectorAll("img")).toHaveLength(0);
        view.unmount();
        await drain();
      });
    }

    it.each(["group", "root"])("disposes the whole %s after registration", async (kind) => {
      const [open, setOpen] = createSignal(true);
      const view = render(() => (
        <Show when={open()}>
          <Coordinator>
            <TwinImage src={`/${name}-${kind}-one.png`} alt="one" />
            <TwinImage src={`/${name}-${kind}-two.png`} alt="two" />
          </Coordinator>
        </Show>
      ));
      await drain();
      expect(view.container.querySelectorAll("img")).toHaveLength(2);
      change(() => (kind === "group" ? setOpen(false) : view.unmount()));
      expect(view.container.querySelectorAll("img")).toHaveLength(0);
      if (kind === "group") view.unmount();
      await drain();
    });

    it("replaces source A with B without stale membership or premature reveal", async () => {
      const [src, setSrc] = createSignal(`/${name}-source-A.png`);
      const view = render(() => (
        <Coordinator>
          <TwinImage src={src()} alt="changing" />
          <TwinImage src={`/${name}-source-sibling.png`} alt="sibling" />
        </Coordinator>
      ));
      await drain();
      const original = img("changing");
      const wrapper = original.parentElement!;
      const pending = wrapper.className;
      const sibling = img("sibling");
      const siblingPending = sibling.parentElement!.className;
      fireEvent.load(sibling);
      await drain();
      expect(sibling.parentElement!.className).toBe(siblingPending);
      change(() => setSrc(`/${name}-source-B.png`));
      expect(img("changing")).toBe(original);
      expect(img("changing")).toHaveAttribute("src", `/${name}-source-B.png`);
      expect(sibling.parentElement!.className).toBe(siblingPending);
      expect(img("changing").parentElement).toBe(wrapper);
      expect(wrapper.className).toBe(pending);
      fireEvent.load(img("changing"));
      await drain();
      expect(wrapper.className).not.toBe(pending);
      expect(sibling.parentElement!.className).not.toBe(siblingPending);
      view.unmount();
      await drain();
    });

    it.each(["hidden", "disposed"])("ignores retained events after owner is %s", (ending) => {
      const value = { revealAll: true, register: vi.fn(), unregister: vi.fn(), load: vi.fn() };
      const group = createContext(value);
      const [hidden, setHidden] = createSignal(false);
      const view = render(() => (
        <Context
          value={{
            get hidden() {
              return hidden();
            },
          }}
        >
          <TwinImage group={group} src={`/${name}-ending.png`} alt="ending" />
        </Context>
      ));
      const retained = img("ending");
      change(() => (ending === "hidden" ? setHidden(true) : view.unmount()));
      const unregisters = value.unregister.mock.calls.length;
      fireEvent.load(retained);
      fireEvent.error(retained);
      flush();
      expect(value.load).not.toHaveBeenCalled();
      expect(value.unregister).toHaveBeenCalledTimes(unregisters);
      if (ending === "hidden") view.unmount();
    });

    it("accepts the active image in a detached container and loads once", () => {
      const value = { revealAll: true, register: vi.fn(), unregister: vi.fn(), load: vi.fn() };
      const group = createContext(value);
      const container = document.createElement("div");
      const [src, setSrc] = createSignal(`/${name}-detached-A.png`);
      const view = render(() => <TwinImage group={group} src={src()} alt="active" />, {
        container,
      });
      const active = container.querySelector("img")!;
      expect(active.isConnected).toBe(false);
      change(() => setSrc(`/${name}-detached-B.png`));
      expect(container.querySelector("img")).toBe(active);
      fireEvent.load(active);
      fireEvent.load(active);
      flush();
      expect(value.load).toHaveBeenCalledExactlyOnceWith(`/${name}-detached-B.png`);
      view.unmount();
    });

    it("updates picture sources and provider color scheme reactively", () => {
      const [scheme, setScheme] = createSignal<"light" | "dark" | "light dark">("dark");
      const [suffix, setSuffix] = createSignal("A");
      const view = render(() => (
        <TwinProvider colorScheme={scheme()}>
          <TwinImage
            alt="picture"
            src={[
              { colorScheme: "light", srcSet: `/light-${suffix()}.png` },
              {
                colorScheme: "dark",
                srcSet: `/dark-${suffix()}.png`,
                media: "(min-width: 1px)",
                sizes: "100vw",
                type: "image/png",
                width: 320,
                height: 180,
              },
            ]}
          />
        </TwinProvider>
      ));
      expect(view.container.querySelectorAll("source")).toHaveLength(1);
      expect(view.container.querySelector("source")).toHaveAttribute("srcset", "/dark-A.png");
      change(() => setSuffix("B"));
      expect(view.container.querySelector("source")).toHaveAttribute("srcset", "/dark-B.png");
      expect(view.container.querySelector("source")).toHaveAttribute("sizes", "100vw");
      expect(view.container.querySelector("source")).toHaveAttribute("width", "320");
      change(() => setScheme("light"));
      expect(view.container.querySelector("source")).toHaveAttribute("srcset", "/light-B.png");
      change(() => setScheme("light dark"));
      expect(view.container.querySelectorAll("source")).toHaveLength(2);
      expect(view.container.querySelectorAll("source")[1]).toHaveAttribute(
        "media",
        "(min-width: 1px) and (prefers-color-scheme: dark)",
      );
      view.unmount();
    });

    it.each(["load", "error"])(
      "ignores detached scalar %s after switching to picture",
      async (event) => {
        const [src, setSrc] = createSignal<string | { srcSet: string }[]>(`/${name}-old.png`);
        const view = render(() => (
          <Coordinator>
            <TwinImage src={src()} alt="changing" renderError={() => <span>obsolete error</span>} />
            <TwinImage src={`/${name}-survivor.png`} alt="survivor" />
          </Coordinator>
        ));
        await drain();
        const old = img("changing");
        const wrapper = old.parentElement!;
        const survivor = img("survivor");
        const pending = survivor.parentElement!.className;
        fireEvent.load(survivor);
        await drain();
        change(() => setSrc([{ srcSet: `/${name}-picture.png` }]));
        const current = img("changing");
        expect(current).not.toBe(old);
        expect(old.isConnected).toBe(false);
        expect(current.parentElement?.tagName).toBe("PICTURE");
        expect(current.parentElement?.parentElement).toBe(wrapper);
        expect(view.container.querySelector("source")).toHaveAttribute(
          "srcset",
          `/${name}-picture.png`,
        );
        // JSDOM does not fetch picture sources; inspect event writes before its empty-image cached task.
        fireEvent[event](old);
        flush();
        expect(screen.queryByText("obsolete error")).toBeNull();
        expect(survivor.parentElement!.className).toBe(pending);
        fireEvent.load(current);
        await drain();
        expect(survivor.parentElement!.className).not.toBe(pending);
        change(() => setSrc(`/${name}-recovered.png`));
        fireEvent.error(img("changing"));
        await drain();
        expect(screen.getByText("obsolete error")).toBeInTheDocument();
        change(() => setSrc(`/${name}-recovery.png`));
        fireEvent.load(img("changing"));
        await drain();
        expect(screen.queryByText("obsolete error")).toBeNull();
        view.unmount();
      },
    );

    it.each(["B", "B-to-A"])(
      "invalidates queued cached completion across A-to-%s",
      async (next) => {
        const queued: VoidFunction[] = [];
        const queue = vi
          .spyOn(globalThis, "queueMicrotask")
          .mockImplementation((task) => queued.push(task));
        const [src, setSrc] = createSignal("");
        let view: ReturnType<typeof render> | undefined;
        try {
          view = render(() => (
            <TwinImage src={src()} alt="cached" renderError={() => <span>cached error</span>} />
          ));
          flush();
          const cached = img("cached") as HTMLImageElement;
          expect(cached.complete).toBe(true);
          expect(cached.naturalWidth).toBe(0);
          expect(queued.length).toBeGreaterThan(0);
          const tasks = queued.splice(0);
          change(() => setSrc(`/${name}-pending.png`));
          if (next === "B-to-A") change(() => setSrc(""));
          const pending = img("cached").parentElement!.className;
          tasks.forEach((task) => task());
          flush();
          expect(screen.queryByText("cached error")).toBeNull();
          expect(img("cached").parentElement!.className).toBe(pending);
          fireEvent.load(img("cached"));
          flush();
          expect(img("cached").parentElement!.className).not.toBe(pending);
        } finally {
          view?.unmount();
          queue.mockRestore();
        }
        await drain();
      },
    );

    it("accepts current cached empty-source error", async () => {
      const view = render(() => (
        <TwinImage src="" alt="cached" renderError={() => <span>current cached error</span>} />
      ));
      await drain();
      expect(screen.getByText("current cached error")).toBeInTheDocument();
      view.unmount();
    });

    it("unregisters hidden rows and registers their visible loading return", async () => {
      const [hidden, setHidden] = createSignal(false);
      const view = render(() => (
        <Coordinator>
          <Context
            value={{
              get hidden() {
                return hidden();
              },
            }}
          >
            <TwinImage src={`/${name}-hidden.png`} alt="toggle" />
          </Context>
          <TwinImage src={`/${name}-hidden-sibling.png`} alt="sibling" />
        </Coordinator>
      ));
      await drain();
      const before = img("toggle");
      const pending = before.parentElement!.className;
      const sibling = img("sibling");
      const siblingPending = sibling.parentElement!.className;
      fireEvent.load(sibling);
      await drain();
      expect(sibling.parentElement!.className).toBe(siblingPending);
      change(() => setHidden(true));
      expect(screen.queryByRole("img", { name: "toggle" })).toBeNull();
      expect(sibling.parentElement!.className).not.toBe(siblingPending);
      change(() => setHidden(false));
      const returned = img("toggle");
      expect(returned.parentElement!.className).toBe(pending);
      fireEvent.load(returned);
      await drain();
      expect(returned.parentElement!.className).not.toBe(pending);
      view.unmount();
      await drain();
    });

    it("registers an initially hidden image when it becomes visible", async () => {
      const [hidden, setHidden] = createSignal(true);
      const view = render(() => (
        <Coordinator>
          <Context
            value={{
              get hidden() {
                return hidden();
              },
            }}
          >
            <TwinImage src={`/${name}-initial-hidden.png`} alt="initially hidden" />
          </Context>
          <TwinImage src={`/${name}-initial-hidden-sibling.png`} alt="sibling" />
        </Coordinator>
      ));
      await drain();
      expect(screen.queryByRole("img", { name: "initially hidden" })).toBeNull();
      const sibling = img("sibling");
      const pending = sibling.parentElement!.className;
      change(() => setHidden(false));
      const visible = img("initially hidden");
      const visiblePending = visible.parentElement!.className;
      fireEvent.load(sibling);
      await drain();
      expect(sibling.parentElement!.className).toBe(pending);
      expect(visible.parentElement!.className).toBe(visiblePending);
      fireEvent.load(visible);
      await drain();
      expect(sibling.parentElement!.className).not.toBe(pending);
      expect(visible.parentElement!.className).not.toBe(visiblePending);
      view.unmount();
      await drain();
    });

    it("unregisters errors and permits subsequent registrations", async () => {
      const [rows, setRows] = createSignal(["failed", "survivor"]);
      const view = render(() => (
        <Coordinator>
          <For each={rows()}>
            {(row) => (
              <TwinImage
                src={`/${name}-error-${row}.png`}
                alt={row}
                renderError={() => <span>image failure</span>}
              />
            )}
          </For>
        </Coordinator>
      ));
      await drain();
      const survivor = img("survivor");
      const pending = survivor.parentElement!.className;
      fireEvent.load(survivor);
      await drain();
      expect(survivor.parentElement!.className).toBe(pending);
      fireEvent.error(img("failed"));
      await drain();
      expect(screen.getByText("image failure")).toBeInTheDocument();
      expect(survivor.parentElement!.className).not.toBe(pending);
      change(() => setRows(["survivor", "new"]));
      const added = img("new");
      const addedPending = added.parentElement!.className;
      fireEvent.load(added);
      await drain();
      expect(added.parentElement!.className).not.toBe(addedPending);
      view.unmount();
      await drain();
    });

    it("delays unchanged groups until the configured timeout", async () => {
      vi.useFakeTimers();
      try {
        const view = render(() => (
          <Coordinator timeout={100}>
            <TwinImage src={`/${name}-timeout-one.png`} alt="one" />
            <TwinImage src={`/${name}-timeout-two.png`} alt="two" />
          </Coordinator>
        ));
        await drain();
        const one = img("one");
        const pending = one.parentElement!.className;
        fireEvent.load(one);
        await drain();
        expect(one.parentElement!.className).toBe(pending);
        change(() => vi.advanceTimersByTime(99));
        expect(one.parentElement!.className).toBe(pending);
        change(() => vi.advanceTimersByTime(1));
        expect(one.parentElement!.className).not.toBe(pending);
        view.unmount();
        await drain();
      } finally {
        vi.useRealTimers();
      }
    });

    it.each(["plain", "standalone"])(
      "removes %s keyed images without a coordinator",
      async (kind) => {
        const [rows, setRows] = createSignal(["one", "two"]);
        const view = render(() => (
          <For each={rows()}>
            {(row) =>
              kind === "plain" ? (
                <img src={`/${name}-plain-${row}.png`} alt={row} />
              ) : (
                <TwinImage src={`/${name}-standalone-${row}.png`} alt={row} />
              )
            }
          </For>
        ));
        await drain();
        const survivor = img("one");
        change(() => setRows(["one"]));
        expect(img("one")).toBe(survivor);
        expect(screen.queryByRole("img", { name: "two" })).toBeNull();
        change(() => setRows([]));
        view.unmount();
        await drain();
      },
    );
  });
}
