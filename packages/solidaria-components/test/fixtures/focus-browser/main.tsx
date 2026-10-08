import { createSignal, onCleanup } from "solid-js";
import { Menu, MenuItem } from "../../../src/Menu";
import { Text } from "../../../src/Text";
import { mountReactMenu } from "../../../../../apps/comparison/e2e/fixtures/menu-react-control.js";
import { render } from "@solidjs/web";
import { createFocusWithin } from "../../../../solidaria/src/interactions/createFocusWithin";
import { DropZone } from "../../../src/DropZone";
import { FileTrigger } from "../../../src/FileTrigger";

function Page() {
  return (
    <>
      <div
        id="scroller"
        style={{
          height: "180px",
          overflow: "auto",
          position: "relative",
          border: "1px solid black",
        }}
      >
        <div style={{ height: "600px" }} />
        <div id="pair">
          <DropZone>
            <FileTrigger>
              <button id="upload" type="button">
                Upload
              </button>
            </FileTrigger>
            <p id="hint">Drop files</p>
          </DropZone>
        </div>
      </div>
      <div id="focus-mount" />
      <button id="outside" type="button">
        Outside
      </button>
      <button id="outside-next" type="button">
        Next outside
      </button>
      <SolidMenuControl />
      <div id="plain-root">
        <div id="plain-menu" role="menu" aria-label="Plain identity">
          <div id="plain-item" role="menuitem" tabindex={0}>
            <span id="plain-label">Plain label</span>
          </div>
        </div>
      </div>
      <div id="react-root" />
    </>
  );
}

type FocusRecord =
  | {
      type: string;
      target: string | null;
      currentTarget: string | null;
      relatedTarget: string | null;
      path: string[];
    }
  | { type: "change"; value: boolean };

const focusEvents: FocusRecord[] = [];
function recordFocus(event: FocusEvent) {
  // Read during native dispatch: currentTarget and composedPath expire afterward.
  focusEvents.push({
    type: event.type,
    target: event.target instanceof Element ? event.target.id : null,
    currentTarget: event.currentTarget instanceof Element ? event.currentTarget.id : null,
    relatedTarget: event.relatedTarget instanceof Element ? event.relatedTarget.id : null,
    path: event
      .composedPath()
      .filter((node): node is Element => node instanceof Element)
      .map((node) => node.id),
  });
}

function FocusOwner(props: { disabled?: boolean; id: string }) {
  const { focusWithinProps } = createFocusWithin({
    isDisabled: props.disabled,
    onFocusWithin: recordFocus,
    onBlurWithin: recordFocus,
    onFocusWithinChange: (value) => focusEvents.push({ type: "change", value }),
  });
  return (
    <div id={props.id} tabindex={-1} {...focusWithinProps}>
      <button id={`${props.id}-a`} type="button">
        A
      </button>
      <button id={`${props.id}-b`} type="button">
        B
      </button>
    </div>
  );
}

const solidCounts = {
  mounts: 0,
  cleanups: 0,
  actions: [] as string[],
  closes: 0,
  sequence: [] as string[],
};
let updateSolid!: () => void;
function SolidChild() {
  const [value] = createSignal("retained child state");
  solidCounts.mounts++;
  onCleanup(() => solidCounts.cleanups++);
  return <span id="solid-child">{value()}</span>;
}
function SolidMenuControl() {
  const [label, setLabel] = createSignal("Solid original");
  const [latest, setLatest] = createSignal(false);
  updateSolid = () => {
    setLabel("Solid updated");
    setLatest(true);
  };
  return (
    <Menu id="solid-menu" aria-label="Solid identity" onClose={() => solidCounts.closes++}>
      <MenuItem
        id="solid-item"
        textValue="Solid item"
        onAction={
          latest()
            ? () => solidCounts.actions.push("latest")
            : () => solidCounts.actions.push("initial")
        }
      >
        {(state) => (
          <div>
            <Text slot="label">
              <span id="solid-label">{label()}</span>
            </Text>
            <Text slot="description">Solid description</Text>
            <span
              id="solid-live"
              data-live-pressed={String(state.isPressed)}
              data-live-hovered={String(state.isHovered)}
              data-live-focused={String(state.isFocused)}
            >
              Live state
            </span>
            <SolidChild />
          </div>
        )}
      </MenuItem>
    </Menu>
  );
}

const root = document.getElementById("root");
if (root) {
  render(() => <Page />, root);
}

const focusMount = document.getElementById("focus-mount");
if (!focusMount) throw new Error("missing focus mount");
const disposeFocus = render(
  () => (
    <>
      <FocusOwner id="owner" />
      <FocusOwner id="disabled-owner" disabled />
    </>
  ),
  focusMount,
);
(
  window as unknown as { __focusFixture: { events: FocusRecord[]; dispose: () => void } }
).__focusFixture = {
  events: focusEvents,
  dispose: disposeFocus,
};

function required(id: string): HTMLElement {
  const node = document.getElementById(id);
  if (!node) throw new Error(`missing ${id}`);
  return node;
}
const reactControl = mountReactMenu(required("react-root"));
const plainCounts = {
  mounts: 1,
  cleanups: 0,
  actions: [] as string[],
  closes: 0,
  sequence: [] as string[],
};
required("plain-item").addEventListener("pointerdown", () => {
  plainCounts.sequence.push("managed");
  required("plain-item").setAttribute("data-pressed", "true");
});
required("plain-item").addEventListener("pointerup", () =>
  required("plain-item").removeAttribute("data-pressed"),
);

// Retain nodes once, before input. Observers are native bubble listeners at the
// actual framework root, registered after render/createRoot installs delegation.
function arm(kind: "solid" | "react" | "plain") {
  const frameworkRoot = required(kind === "solid" ? "root" : `${kind}-root`);
  const label = required(`${kind}-label`);
  const menuRoot = label.closest('[role="menu"]');
  if (!(menuRoot instanceof HTMLElement)) throw new Error("missing menu root");
  const item = label.closest('[role="menuitem"]');
  if (!(item instanceof HTMLElement)) throw new Error("missing menuitem");
  const child = kind === "plain" ? label : required(`${kind}-child`);
  const counts =
    kind === "solid" ? solidCounts : kind === "react" ? reactControl.counts : plainCounts;
  let captured: Event | undefined;
  const capture: unknown[] = [];
  const boundary: unknown[] = [];
  const bubble: unknown[] = [];
  const snapshot = (event?: Event) => ({
    sameEvent: event === undefined || event === captured,
    sameTarget: event === undefined || event.target === label,
    sameLabel: document.getElementById(`${kind}-label`) === label,
    sameChild: kind === "plain" || document.getElementById(`${kind}-child`) === child,
    targetConnected: label.isConnected,
    menuConnected: menuRoot.isConnected,
    frameworkConnected: frameworkRoot.isConnected,
    menuContains: menuRoot.contains(label),
    frameworkContains: frameworkRoot.contains(label),
    pressed: item.hasAttribute("data-pressed"),
    hovered: item.hasAttribute("data-hovered"),
    focused: document.activeElement === item,
    livePressed:
      kind === "plain" ? null : required(`${kind}-live`).getAttribute("data-live-pressed"),
    mounts: counts.mounts,
    cleanups: counts.cleanups,
    actions: [...counts.actions],
    closes: counts.closes,
    sequence: [...counts.sequence],
    path: event
      ? event
          .composedPath()
          .filter((node): node is HTMLElement => node instanceof HTMLElement)
          .map((node) => node.id)
      : [],
  });
  const onCapture = (event: Event) => {
    if (event.target !== label) return;
    captured = event;
    counts.sequence.push("capture");
    capture.push(snapshot(event));
  };
  const onBoundary = (event: Event) => {
    if (event !== captured) return;
    counts.sequence.push("boundary");
    boundary.push(snapshot(event));
  };
  const onBubble = (event: Event) => {
    if (event !== captured) return;
    counts.sequence.push("document-bubble");
    bubble.push(snapshot(event));
  };
  document.addEventListener("pointerdown", onCapture, true);
  document.addEventListener("pointerdown", onBubble);
  frameworkRoot.addEventListener("pointerdown", onBoundary);
  return {
    capture,
    boundary,
    bubble,
    snapshot,
    dispose() {
      document.removeEventListener("pointerdown", onCapture, true);
      document.removeEventListener("pointerdown", onBubble);
      frameworkRoot.removeEventListener("pointerdown", onBoundary);
    },
  };
}
(window as unknown as { __menuFixture: unknown }).__menuFixture = {
  arm,
  updateSolid,
  updateReact: reactControl.update,
  solidCounts,
  reactCounts: reactControl.counts,
  disposeReact: reactControl.dispose,
};
window.addEventListener("pagehide", () => reactControl.dispose(), { once: true });
