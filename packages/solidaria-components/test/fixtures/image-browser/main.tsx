import { DEV, createMemo, createSignal, flush, For } from "solid-js";
import { render } from "@solidjs/web";
import "../../../../viviana-ui/src/theme.css";
import * as Spectrum from "../../../../solid-spectrum/src/image/index.tsx";
import * as UI from "../../../../viviana-ui/src/image/index.tsx";
import { mountReactImage } from "../../../../../apps/comparison/e2e/fixtures/image-react-control.js";

type State = { rows: string[]; hidden: boolean; source: string; prefix: string; target: string };
const retained: {
  label: string;
  wrapper: Element;
  image: HTMLImageElement;
  animations: Animation[];
}[] = [];
let dispose: (() => void) | undefined;
let update: ((state: State) => void) | undefined;
let state: State;
let root: HTMLElement;
const events: object[] = [];
for (const type of ["load", "error"])
  document.addEventListener(
    type,
    (event) => {
      if (event.target instanceof HTMLImageElement)
        events.push({
          type,
          time: performance.now(),
          src: event.target.currentSrc,
          connected: event.target.isConnected,
        });
    },
    true,
  );

function mount(kind: string, initial: State) {
  dispose?.();
  retained.length = 0;
  events.length = 0;
  state = initial;
  root = document.getElementById(
    kind === "react" ? "react-root" : kind === "plain" ? "plain-root" : "solid-root",
  )!;
  if (kind === "react") {
    const control = mountReactImage(root, state);
    update = control.update;
    dispose = control.dispose;
  } else if (kind === "plain") {
    update = (next) => {
      for (const child of [...root.children])
        if (!next.rows.includes(child.getAttribute("data-row")!)) child.remove();
      for (const id of next.rows) {
        let row = root.querySelector(`[data-row="${id}"]`);
        if (!row) {
          row = document.createElement("section");
          row.setAttribute("data-row", id);
          root.append(row);
        }
        if (next.hidden && id === next.target) {
          row.replaceChildren();
          continue;
        }
        let img = row.querySelector("img");
        if (!img) {
          img = document.createElement("img");
          img.alt = id;
          img.width = 80;
          img.height = 60;
          const wrapper = document.createElement("div");
          wrapper.append(img);
          row.append(wrapper);
        }
        const src = `${next.prefix}/${id}-${id === next.target ? next.source : "A"}.png`;
        if (img.getAttribute("src") !== src) img.src = src;
      }
    };
    update(state);
    dispose = () => root.replaceChildren();
  } else {
    const twin = kind === "spectrum" ? Spectrum : UI;
    const [current, setCurrent] = createSignal(state);
    update = (next) => {
      setCurrent(next);
      flush();
    };
    dispose = render(
      () => (
        <twin.ImageCoordinator timeout={120000}>
          <For each={current().rows}>
            {(id) => {
              const hidden = createMemo(() => id === current().target && current().hidden);
              const src = createMemo(
                () =>
                  `${current().prefix}/${id}-${id === current().target ? current().source : "A"}.png`,
              );
              return (
                <section data-row={id}>
                  <twin.ImageContext
                    value={{
                      get hidden() {
                        return hidden();
                      },
                    }}
                  >
                    <twin.Image src={src()} alt={id} width={80} height={60} />
                  </twin.ImageContext>
                </section>
              );
            }}
          </For>
        </twin.ImageCoordinator>
      ),
      root,
    );
    flush();
  }
}
function snapshot() {
  const describe = (wrapper: Element, image: HTMLImageElement) => {
    const css = getComputedStyle(wrapper);
    const pseudo = getComputedStyle(wrapper, "::after");
    return {
      connected: wrapper.isConnected,
      imageConnected: image.isConnected,
      src: image.getAttribute("src"),
      currentSrc: image.currentSrc,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      opacity: getComputedStyle(image).opacity,
      visibility: getComputedStyle(image).visibility,
      backgroundImage: css.backgroundImage,
      pseudoBackgroundImage: pseudo.backgroundImage,
      pseudoAnimationName: pseudo.animationName,
      pseudoMaskImage: pseudo.maskImage,
      width: wrapper.getBoundingClientRect().width,
      height: wrapper.getBoundingClientRect().height,
      backgroundPosition: css.backgroundPosition,
      backgroundSize: css.backgroundSize,
      overflow: css.overflow,
      animations: wrapper.getAnimations().map((a) => ({
        state: a.playState,
        type: a.constructor.name,
        pseudoElement: (a.effect as KeyframeEffect)?.pseudoElement,
        targetSame: (a.effect as KeyframeEffect)?.target === wrapper,
      })),
    };
  };
  return {
    time: performance.now(),
    events: [...events],
    rows: [...root.querySelectorAll<HTMLImageElement>("img")].map((img) => ({
      id: img.alt,
      ...describe(img.parentElement!, img),
      retainedImage: retained.findIndex((r) => r.image === img),
      retainedWrapper: retained.findIndex((r) => r.wrapper === img.parentElement),
    })),
    retained: retained.map((r) => ({
      label: r.label,
      ...describe(r.wrapper, r.image),
      capturedAnimations: r.animations.map((a) => ({
        state: a.playState,
        type: a.constructor.name,
        pseudoElement: (a.effect as KeyframeEffect)?.pseudoElement,
        targetSame: (a.effect as KeyframeEffect)?.target === r.wrapper,
        targetConnected: ((a.effect as KeyframeEffect)?.target as Element)?.isConnected,
        currentTime: a.currentTime,
      })),
    })),
  };
}
window.imageProof = {
  identity: {
    dev: !!DEV,
    mode: import.meta.env.MODE,
    source: import.meta.url,
    animate: Element.prototype.animate.toString(),
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  },
  mount,
  change(patch: Partial<State>) {
    state = { ...state, ...patch };
    update!(state);
  },
  dispose() {
    dispose!();
    dispose = undefined;
    flush();
  },
  capture(id: string, label: string) {
    const image = root.querySelector<HTMLImageElement>(`img[alt="${id}"]`);
    if (!image) throw new Error(`Missing image ${id}`);
    for (const type of ["load", "error"])
      image.addEventListener(
        type,
        (event) => {
          events.push({
            listener: "retained-image",
            label,
            type,
            time: performance.now(),
            operation: window.imageOperation,
            trusted: event.isTrusted,
            src: image.currentSrc,
            connected: image.isConnected,
          });
        },
        { passive: true },
      );
    retained.push({
      label,
      image,
      wrapper: image.parentElement!,
      animations: image.parentElement!.getAnimations(),
    });
    return snapshot();
  },
  snapshot,
};
declare global {
  interface Window {
    imageProof: {
      identity: object;
      mount: typeof mount;
      change: (patch: Partial<State>) => void;
      dispose: () => void;
      capture: (id: string, label: string) => ReturnType<typeof snapshot>;
      snapshot: typeof snapshot;
    };
  }
}
