import { afterEach, describe, expect, it } from "vite-plus/test";
import { createRoot, createSignal, flush } from "solid-js";
import { followRef } from "../src/utils/refs";

const disposers: Array<() => void> = [];

function owned<T>(fn: () => T): T {
  return createRoot((dispose) => {
    disposers.push(dispose);
    return fn();
  });
}

afterEach(() => {
  disposers.splice(0).forEach((dispose) => dispose());
});

describe("followRef", () => {
  it("immediately preserves existing, null, undefined, and function-valued refs", () => {
    const element = document.createElement("button");
    const callback = () => "value";
    owned(() => {
      expect(followRef(() => element)()).toBe(element);
      expect(followRef(() => null)()).toBeNull();
      expect(followRef(() => undefined)()).toBeUndefined();
      const followedCallback = followRef(() => callback);
      expect(followedCallback()).toBe(callback);
      flush();
      expect(followedCallback()).toBe(callback);
    });
  });

  it("follows reactive replacement and removal through nested refs", () => {
    const first = document.createElement("button");
    const second = document.createElement("input");
    const { followed, setRef } = owned(() => {
      const [ref, setRef] = createSignal<HTMLElement | null | undefined>(first);
      const intermediate = followRef(ref);
      return { followed: followRef(intermediate), setRef };
    });
    expect(followed()).toBe(first);
    for (const next of [second, null, undefined, first]) {
      setRef(next);
      flush();
      expect(followed()).toBe(next);
    }
  });

  it("picks up a plain let ref assigned before the initial commit", () => {
    const element = document.createElement("button");
    const followed = owned(() => {
      let ref: HTMLButtonElement | null = null;
      const followed = followRef(() => ref);
      expect(followed()).toBeNull();
      ref = element;
      return followed;
    });
    flush();
    expect(followed()).toBe(element);
  });

  it("stops observing ref changes when its owner is disposed", () => {
    const element = document.createElement("button");
    const [ref, setRef] = createSignal<HTMLElement | null>(null);
    let reads = 0;
    owned(() =>
      followRef(() => {
        reads++;
        return ref();
      }),
    );
    flush();
    disposers.splice(0).forEach((dispose) => dispose());
    const readsAtDisposal = reads;
    setRef(element);
    flush();
    expect(reads).toBe(readsAtDisposal);
  });
});
