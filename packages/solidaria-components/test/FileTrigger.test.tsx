/**
 * Tests for solidaria-components FileTrigger
 */
import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render, fireEvent, cleanup } from "@solidjs/testing-library";
import { createSignal, flush, Show, onCleanup } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Button, ButtonContext } from "../src/Button";
import { FileTrigger } from "../src/FileTrigger";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

describe("FileTrigger", () => {
  it("opens the hidden input when trigger is pressed", async () => {
    const user = setupUser();

    const { container } = render(() => (
      <FileTrigger>
        <button type="button">Upload</button>
      </FileTrigger>
    ));

    const clickSpy = vi.spyOn(container.querySelector("input")!, "click");
    await user.click(container.querySelector("button")!);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("calls onSelect when file input changes", () => {
    const onSelect = vi.fn();
    const { container } = render(() => (
      <FileTrigger onSelect={onSelect}>
        <button type="button">Upload</button>
      </FileTrigger>
    ));

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onSelect).toHaveBeenCalled();
    const files = onSelect.mock.calls[0][0] as FileList;
    expect(files[0]?.name).toBe("test.txt");
  });

  it("wires file input attributes", () => {
    const { container } = render(() => (
      <FileTrigger
        acceptedFileTypes={["image/png", "image/jpeg"]}
        allowsMultiple
        defaultCamera="environment"
        acceptDirectory
      >
        <button type="button">Upload</button>
      </FileTrigger>
    ));

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute("accept", "image/png,image/jpeg");
    expect(input).toHaveAttribute("multiple");
    expect(input).toHaveAttribute("capture", "environment");
    expect(input).toHaveAttribute("webkitdirectory");
  });

  it("does not open picker when disabled", async () => {
    const user = setupUser();

    const { container } = render(() => (
      <FileTrigger disabled>
        <button type="button">Upload</button>
      </FileTrigger>
    ));

    const clickSpy = vi.spyOn(container.querySelector("input")!, "click");
    await user.click(container.querySelector("button")!);
    expect(clickSpy).not.toHaveBeenCalled();

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it("stops the hidden input click from reaching an ancestor", () => {
    const onParentClick = vi.fn();
    const { container } = render(() => (
      <div>
        <FileTrigger>
          <button type="button">Upload</button>
        </FileTrigger>
      </div>
    ));
    const parent = container.firstElementChild as HTMLDivElement;
    parent.addEventListener("click", onParentClick);
    const button = parent.querySelector("button") as HTMLButtonElement;
    const input = parent.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.click(button);
    expect(onParentClick).toHaveBeenCalledTimes(1);

    onParentClick.mockClear();
    fireEvent.click(input);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("D21 owning controls", () => {
  for (const route of ["pointer", "Enter", "Space"] as const) {
    it(`delivers actual Button ${route} exactly once`, async () => {
      const user = setupUser();
      const own = vi.fn();
      const { container } = render(() => (
        <FileTrigger>
          <Button onPress={own}>Upload</Button>
        </FileTrigger>
      ));
      const button = container.querySelector("button")!;
      const input = container.querySelector("input")!;
      const click = vi.spyOn(input, "click");
      if (route === "pointer") await user.click(button);
      else {
        button.focus();
        await user.keyboard(route === "Enter" ? "{Enter}" : " ");
      }
      expect(own).toHaveBeenCalledTimes(1);
      expect(click).toHaveBeenCalledTimes(1);
    });
  }

  it("retains raw native button positive control", async () => {
    const user = setupUser();
    const { container } = render(() => (
      <FileTrigger>
        <button>Raw</button>
      </FileTrigger>
    ));
    const click = vi.spyOn(container.querySelector("input")!, "click");
    await user.click(container.querySelector("button")!);
    expect(click).toHaveBeenCalledTimes(1);
  });

  for (const focusable of [true, false]) {
    it(`blocks pending wrapper fallback with focusable=${focusable}`, async () => {
      const user = setupUser();
      const own = vi.fn();
      const { container } = render(() => (
        <FileTrigger>
          <Button isPending isPendingFocusable={focusable} onPress={own}>
            Pending
          </Button>
        </FileTrigger>
      ));
      const click = vi.spyOn(container.querySelector("input")!, "click");
      await user.click(container.querySelector("button")!);
      expect(own).not.toHaveBeenCalled();
      expect(click).not.toHaveBeenCalled();
    });
  }

  it("reads current base slot and own callbacks without remount", async () => {
    const user = setupUser();
    const calls: string[] = [];
    const [version, setVersion] = createSignal("A");
    const context = {
      get onPress() {
        const value = version();
        return () => {
          calls.push(`base-${value}`);
        };
      },
      slots: {
        upload: {
          get onPress() {
            const value = version();
            return () => {
              calls.push(`slot-${value}`);
            };
          },
        },
      },
    };
    const { container } = render(() => (
      <ButtonContext value={context}>
        <FileTrigger>
          <Button
            slot="upload"
            onPress={(() => {
              const value = version();
              return () => {
                calls.push(`own-${value}`);
              };
            })()}
          >
            Upload
          </Button>
        </FileTrigger>
      </ButtonContext>
    ));
    const button = container.querySelector("button")!;
    const input = container.querySelector("input")!;
    vi.spyOn(input, "click").mockImplementation(() => {
      calls.push("picker");
    });
    setVersion("B");
    flush();
    expect(calls).toEqual([]);
    expect(container.querySelector("button")).toBe(button);
    expect(container.querySelector("input")).toBe(input);
    await user.click(button);
    expect(calls.filter((call) => call !== "picker")).toEqual(["base-B", "slot-B", "own-B"]);
    expect(calls).toEqual(["base-B", "slot-B", "picker", "own-B"]);
  });
});

describe("D21 bridge boundaries", () => {
  for (const route of ["pointer", "Enter", "Space", "virtual"] as const) {
    for (const focusable of [true, false]) {
      it(`keeps pending ${focusable} ${route} registered and re-enables without remount`, async () => {
        const user = setupUser();
        const [pending, setPending] = createSignal(true);
        const own = vi.fn((event) => event.continuePropagation());
        const { container } = render(() => (
          <FileTrigger>
            <Button isPending={pending()} isPendingFocusable={focusable} onPress={own}>
              Upload
            </Button>
          </FileTrigger>
        ));
        const button = container.querySelector("button")!;
        const input = container.querySelector("input")!;
        const click = vi.spyOn(input, "click");
        const activate = async () => {
          if (route === "pointer") await user.click(button);
          else if (route === "virtual") fireEvent.click(button, { detail: 0 });
          else {
            button.focus();
            await user.keyboard(route === "Enter" ? "{Enter}" : " ");
          }
        };
        await activate();
        expect(own).toHaveBeenCalledTimes(0);
        expect(click).toHaveBeenCalledTimes(0);
        setPending(false);
        flush();
        expect(container.querySelector("button")).toBe(button);
        expect(container.querySelector("input")).toBe(input);
        await activate();
        expect(own).toHaveBeenCalledTimes(1);
        expect(click).toHaveBeenCalledTimes(1);
      });
    }
    it(`blocks disabled child ${route} and restores activation`, async () => {
      const user = setupUser();
      const [disabled, setDisabled] = createSignal(true);
      const own = vi.fn();
      const { container } = render(() => (
        <FileTrigger>
          <Button isDisabled={disabled()} onPress={own}>
            Upload
          </Button>
        </FileTrigger>
      ));
      const button = container.querySelector("button")!;
      const click = vi.spyOn(container.querySelector("input")!, "click");
      const activate = async () => {
        if (route === "pointer") await user.click(button);
        else if (route === "virtual") fireEvent.click(button, { detail: 0 });
        else {
          button.focus();
          await user.keyboard(route === "Enter" ? "{Enter}" : " ");
        }
      };
      await activate();
      expect(own).toHaveBeenCalledTimes(0);
      expect(click).toHaveBeenCalledTimes(0);
      setDisabled(false);
      flush();
      expect(container.querySelector("button")).toBe(button);
      await activate();
      expect(own).toHaveBeenCalledTimes(1);
      expect(click).toHaveBeenCalledTimes(1);
    });
  }

  it("guards live picker disability before reset despite explicitly enabled child", async () => {
    const user = setupUser();
    const [disabled, setDisabled] = createSignal(true);
    const own = vi.fn();
    const { container } = render(() => (
      <FileTrigger disabled={disabled()}>
        <Button isDisabled={false} onPress={own}>
          Upload
        </Button>
      </FileTrigger>
    ));
    const button = container.querySelector("button")!;
    const input = container.querySelector("input")!;
    let value = "previous-file";
    const reset = vi.fn((next: string) => {
      value = next;
    });
    Object.defineProperty(input, "value", { configurable: true, get: () => value, set: reset });
    const click = vi.spyOn(input, "click").mockImplementation(() => {
      expect(value).toBe("");
    });
    await user.click(button);
    expect(own).toHaveBeenCalledTimes(1);
    expect(reset).not.toHaveBeenCalled();
    expect(click).not.toHaveBeenCalled();
    setDisabled(false);
    flush();
    await user.click(button);
    expect(own).toHaveBeenCalledTimes(2);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    value = "selected-again";
    setDisabled(true);
    flush();
    await user.click(button);
    expect(own).toHaveBeenCalledTimes(3);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("selected-again");
    expect(container.querySelector("button")).toBe(button);
    expect(container.querySelector("input")).toBe(input);
  });

  it("keeps base slot own and selection additions replacements removals live with stable refs", async () => {
    const user = setupUser();
    const calls: string[] = [];
    const [version, setVersion] = createSignal<string | undefined>(undefined);
    const [pending, setPending] = createSignal(false);
    const ref = vi.fn();
    let mounts = 0;
    let disposals = 0;
    const callback = (name: string) => {
      const current = version();
      return current
        ? () => {
            calls.push(`${name}-${current}`);
          }
        : undefined;
    };
    const Child = () => {
      mounts++;
      onCleanup(() => {
        disposals++;
      });
      return (
        <Button slot="upload" onPress={callback("own")}>
          Upload
        </Button>
      );
    };
    const context = {
      get onPress() {
        return callback("base");
      },
      ref,
      get isPending() {
        return pending();
      },
      isPendingFocusable: true,
      slots: {
        upload: {
          get onPress() {
            return callback("slot");
          },
          "aria-label": "Slotted upload",
        },
        other: { "aria-label": "Other" },
      },
    };
    const { container } = render(() => (
      <ButtonContext value={context}>
        <FileTrigger onSelect={callback("select")}>
          <Child />
        </FileTrigger>
      </ButtonContext>
    ));
    const button = container.querySelector("button")!;
    const input = container.querySelector("input")!;
    vi.spyOn(input, "click").mockImplementation(() => {
      calls.push("picker");
    });
    expect(button).toHaveAttribute("aria-label", "Slotted upload");
    for (const value of ["A", "B", undefined, "C"]) {
      calls.length = 0;
      setVersion(value);
      flush();
      expect(calls).toEqual([]);
      expect(container.querySelector("button")).toBe(button);
      expect(container.querySelector("input")).toBe(input);
      await user.click(button);
      expect(calls).toEqual(
        value ? [`base-${value}`, `slot-${value}`, "picker", `own-${value}`] : ["picker"],
      );
      fireEvent.change(input, { target: { files: null } });
      expect(calls).toEqual(
        value
          ? [`base-${value}`, `slot-${value}`, "picker", `own-${value}`, `select-${value}`]
          : ["picker"],
      );
    }
    calls.length = 0;
    setPending(true);
    flush();
    await user.click(button);
    expect(calls).toEqual([]);
    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(button);
    expect(mounts).toBe(1);
    expect(disposals).toBe(0);
  });

  for (const route of ["pointer", "Enter", "Space", "virtual"] as const) {
    it(`continues ${route} once past wrapper without a second picker`, async () => {
      const user = setupUser();
      const own = vi.fn((event) => event.continuePropagation());
      const ancestor = vi.fn();
      const { container } = render(() => (
        <div
          onClick={route === "pointer" || route === "virtual" ? ancestor : undefined}
          onKeyUp={route === "Enter" || route === "Space" ? ancestor : undefined}
        >
          <FileTrigger>
            <Button onPress={own}>Upload</Button>
            <button data-raw>Raw</button>
          </FileTrigger>
        </div>
      ));
      const button = container.querySelector("button")!;
      const input = container.querySelector("input")!;
      const click = vi.spyOn(input, "click");
      if (route === "pointer") await user.click(button);
      else if (route === "virtual") fireEvent.click(button, { detail: 0 });
      else {
        button.focus();
        await user.keyboard(route === "Enter" ? "{Enter}" : " ");
      }
      expect(click).toHaveBeenCalledTimes(1);
      expect(own).toHaveBeenCalledTimes(1);
      expect(ancestor).toHaveBeenCalledTimes(1);
      await user.click(container.querySelector("[data-raw]")!);
      expect(click).toHaveBeenCalledTimes(2);
      expect(own).toHaveBeenCalledTimes(1);
    });
  }

  it("supports custom rendered roots and releases registration on replacement and disposal", async () => {
    const user = setupUser();
    const [alternate, setAlternate] = createSignal(false);
    const [visible, setVisible] = createSignal(true);
    const [pending, setPending] = createSignal(false);
    const own = vi.fn((event) => event.continuePropagation());
    const { container } = render(() => (
      <FileTrigger>
        <Show when={visible()}>
          <Button
            isPending={pending()}
            onPress={own}
            render={(props) => (
              <Show when={alternate()} fallback={<button {...props} data-first />}>
                <button {...props} data-second />
              </Show>
            )}
          >
            Upload
          </Button>
        </Show>
        <button data-raw>Raw</button>
      </FileTrigger>
    ));
    const input = container.querySelector("input")!;
    const click = vi.spyOn(input, "click");
    const first = container.querySelector("[data-first]")!;
    await user.click(first);
    expect(click).toHaveBeenCalledTimes(1);
    expect(own).toHaveBeenCalledTimes(1);
    // Pending strips the obsolete root's press handlers, making it a raw fallback
    // probe when reinserted after replacement (without nesting buttons).
    setPending(true);
    flush();
    setAlternate(true);
    flush();
    const wrapper = container.querySelector("[data-raw]")!.parentElement!;
    wrapper.append(first);
    fireEvent.click(first, { detail: 0 });
    expect(click).toHaveBeenCalledTimes(2);
    expect(own).toHaveBeenCalledTimes(1);
    const second = container.querySelector("[data-second]")!;
    fireEvent.click(second, { detail: 0 });
    expect(click).toHaveBeenCalledTimes(2);
    setVisible(false);
    flush();
    wrapper.append(second);
    fireEvent.click(second, { detail: 0 });
    expect(click).toHaveBeenCalledTimes(3);
    await user.click(container.querySelector("[data-raw]")!);
    expect(click).toHaveBeenCalledTimes(4);
    expect(own).toHaveBeenCalledTimes(1);
  });

  it("preserves raw custom descendants, modifiers and native receiver", () => {
    const seen = vi.fn();
    const data = { label: "bound" };
    const bound: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = [
      function (this: HTMLButtonElement, value, event) {
        seen(
          value,
          event.currentTarget,
          this,
          event.shiftKey,
          event.ctrlKey,
          event.altKey,
          event.metaKey,
        );
      },
      data,
    ];
    const Custom = () => (
      <button onClick={bound}>
        <span>Raw custom</span>
      </button>
    );
    const { container } = render(() => (
      <FileTrigger>
        <Button isPending>Pending</Button>
        <Custom />
      </FileTrigger>
    ));
    const raw = container.querySelectorAll("button")[1]!;
    const click = vi.spyOn(container.querySelector("input")!, "click");
    fireEvent.click(raw.firstElementChild!, {
      detail: 0,
      shiftKey: true,
      ctrlKey: true,
      altKey: true,
      metaKey: true,
    });
    expect(click).toHaveBeenCalledTimes(1);
    expect(seen).toHaveBeenCalledExactlyOnceWith(data, raw, raw, true, true, true, true);
  });

  it("resets synchronously for repeat selection, isolates input clicks and preserves null selection", async () => {
    const user = setupUser();
    const selected = vi.fn();
    const ancestor = vi.fn();
    const own = vi.fn();
    const { container } = render(() => (
      <div onClick={ancestor}>
        <FileTrigger onSelect={selected}>
          <Button onPress={own}>Upload</Button>
        </FileTrigger>
      </div>
    ));
    const input = container.querySelector("input")!;
    const button = container.querySelector("button")!;
    const click = vi.spyOn(input, "click");
    const file = new File(["content"], "same.txt");
    for (let count = 1; count <= 2; count++) {
      let value = "same.txt";
      Object.defineProperty(input, "value", {
        configurable: true,
        get: () => value,
        set: (next) => {
          value = next;
        },
      });
      const observed = vi.fn(() => {
        expect(input.value).toBe("");
      });
      input.addEventListener("click", observed, { once: true });
      await user.click(button);
      expect(observed).toHaveBeenCalledTimes(1);
      fireEvent.change(input, { target: { files: [file] } });
      expect(selected).toHaveBeenCalledTimes(count);
      expect(selected.mock.calls[count - 1][0][0]).toBe(file);
      expect(click).toHaveBeenCalledTimes(count);
      expect(own).toHaveBeenCalledTimes(count);
    }
    fireEvent.change(input, { target: { files: null } });
    expect(selected).toHaveBeenLastCalledWith(null);
    expect(ancestor).not.toHaveBeenCalled();
    expect(click).toHaveBeenCalledTimes(2);
  });
});

for (const route of ["pointer", "Enter", "Space", "virtual"] as const) {
  it(`registers an anchor custom Button root for pending and enabled ${route}`, async () => {
    const user = setupUser();
    const [pending, setPending] = createSignal(true);
    const own = vi.fn((event) => event.continuePropagation());
    const { container } = render(() => (
      <FileTrigger>
        <Button
          elementType="a"
          isPending={pending()}
          onPress={own}
          render={(props) => <a {...props}>Upload</a>}
        />
      </FileTrigger>
    ));
    const anchor = container.querySelector("a")!;
    const click = vi.spyOn(container.querySelector("input")!, "click");
    const activate = async () => {
      if (route === "pointer") await user.click(anchor);
      else if (route === "virtual") fireEvent.click(anchor, { detail: 0 });
      else {
        anchor.focus();
        await user.keyboard(route === "Enter" ? "{Enter}" : " ");
      }
    };
    await activate();
    expect(click).not.toHaveBeenCalled();
    expect(own).not.toHaveBeenCalled();
    setPending(false);
    flush();
    expect(container.querySelector("a")).toBe(anchor);
    await activate();
    expect(click).toHaveBeenCalledTimes(1);
    expect(own).toHaveBeenCalledTimes(1);
  });
}
