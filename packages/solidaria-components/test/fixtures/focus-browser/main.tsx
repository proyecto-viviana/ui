import { Picker, PickerItem, PickerContext } from "../../../../viviana-ui/src/picker/index";
import { Provider } from "../../../../viviana-ui/src/provider/index";
import { Text as StyledText } from "../../../../viviana-ui/src/text/index";
import { style } from "../../../../viviana-ui/src/style" with { type: "macro" };
import "../../../../viviana-ui/src/theme.css";
import { createSignal, createEffect, For, onCleanup, onSettled, untrack } from "solid-js";
import { Menu, MenuItem } from "../../../src/Menu";
import { Text } from "../../../src/Text";
import {
  mountReactMenu,
  mountReactPickers,
} from "../../../../../apps/comparison/e2e/fixtures/menu-react-control.js";
import { render } from "@solidjs/web";
import { createFocusWithin } from "../../../../solidaria/src/interactions/createFocusWithin";
import { DropZone } from "../../../src/DropZone";
import { FileTrigger } from "../../../src/FileTrigger";

import { Button } from "../../../src/Button";
import { Button as SpectrumButton } from "../../../../solid-spectrum/src/button/Button";
import { FileTrigger as SpectrumFileTrigger } from "../../../../solid-spectrum/src/filetrigger/index";

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
      <ChooserControl kind="headless" />
      <ChooserControl kind="styled" />
      <ChooserControl kind="raw" />
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

type ChooserKind = "headless" | "styled" | "raw";
type ChooserUpdate = {
  ownerDisabled?: boolean;
  childDisabled?: boolean;
  pending?: boolean;
  pendingFocusable?: boolean;
  callback?: "A" | "B" | "none";
  continuation?: boolean;
};
const initializeChoosers: Array<() => void> = [];
const chooserControls: Record<string, unknown> = {};
(window as unknown as { __chooserFixture: unknown }).__chooserFixture = chooserControls;
function ChooserControl(props: { kind: ChooserKind }) {
  const kind = props.kind;
  const [state, setState] = createSignal<Required<ChooserUpdate>>({
    ownerDisabled: false,
    childDisabled: false,
    pending: false,
    pendingFocusable: true,
    callback: "A",
    continuation: false,
  });
  const counts = { mounts: 0, cleanups: 0, child: 0, ancestor: 0, ancestorKeys: 0 };
  const selections: unknown[] = [];
  let originalRoot!: HTMLElement;
  let originalButton!: HTMLButtonElement;
  let originalInput!: HTMLInputElement;
  const snapshot = () => ({
    ...counts,
    selections: [...selections],
    sameRoot: document.getElementById(`chooser-${kind}`) === originalRoot,
    sameButton: document.getElementById(`chooser-${kind}-button`) === originalButton,
    sameInput: document.getElementById(`chooser-${kind}-input`) === originalInput,
    value: originalInput.value,
    files: Array.from(originalInput.files ?? []).map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    })),
  });
  const select = (generation: string) => (files: FileList | null) =>
    selections.push({
      generation,
      isFileList: files instanceof FileList,
      sameFiles: files === originalInput.files,
      length: files?.length,
      files: Array.from(files ?? []).map((f) => ({ name: f.name, type: f.type, size: f.size })),
    });
  const callbackA = select("A");
  const callbackB = select("B");
  const onSelect = () =>
    state().callback === "none" ? undefined : state().callback === "A" ? callbackA : callbackB;
  const childProps = {
    id: `chooser-${kind}-button`,
    get isDisabled() {
      return state().childDisabled;
    },
    get isPending() {
      return state().pending;
    },
    onPress(event: { continuePropagation(): void }) {
      counts.child++;
      if (state().continuation) event.continuePropagation();
    },
  };
  initializeChoosers.push(() => {
    counts.mounts++;
    originalRoot = required(`chooser-${kind}`);
    const button = required(`chooser-${kind}-button`);
    const input = required(`chooser-${kind}-input`);
    if (!(button instanceof HTMLButtonElement) || !(input instanceof HTMLInputElement))
      throw new Error("invalid chooser nodes");
    originalButton = button;
    originalInput = input;
    chooserControls[kind] = {
      snapshot,
      update: (patch: ChooserUpdate) => setState((s) => ({ ...s, ...patch })),
    };
  });
  onCleanup(() => counts.cleanups++);
  return (
    <div
      id={`chooser-${kind}`}
      onClick={() => counts.ancestor++}
      onKeyUp={(event) => {
        if (event.key === "Enter" || event.key === " ") counts.ancestorKeys++;
      }}
    >
      <button id={`chooser-${kind}-before`} type="button">
        Before {kind}
      </button>
      {kind === "styled" ? (
        <SpectrumFileTrigger
          id={`chooser-${kind}-input`}
          class="native-spectrum-wrapper"
          disabled={state().ownerDisabled}
          onSelect={onSelect()}
        >
          <SpectrumButton {...childProps}>Styled chooser</SpectrumButton>
        </SpectrumFileTrigger>
      ) : (
        <FileTrigger
          id={`chooser-${kind}-input`}
          disabled={state().ownerDisabled}
          onSelect={onSelect()}
        >
          {kind === "raw" ? (
            <button id={childProps.id} type="button" onClick={() => counts.child++}>
              Raw chooser
            </button>
          ) : (
            <Button {...childProps} isPendingFocusable={state().pendingFocusable}>
              Headless chooser
            </Button>
          )}
        </FileTrigger>
      )}
      <button id={`chooser-${kind}-after`} type="button">
        After {kind}
      </button>
    </div>
  );
}

function required(id: string): HTMLElement {
  const node = document.getElementById(id);
  if (!node) throw new Error(`missing ${id}`);
  return node;
}

function mountLegacy() {
  const root = document.getElementById("root");
  if (root) {
    render(() => <Page />, root);
    for (const initialize of initializeChoosers) initialize();
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
}

type PopupOption = { id: string; label: string };
type PopupField = "text-face" | "text-alignment" | "text-direction";
type PopupRecord = Record<string, unknown>;
const popupFields: Array<{
  field: PopupField;
  label: string;
  options: PopupOption[];
  initial: string;
}> = [
  {
    field: "text-face",
    label: "Face",
    initial: "",
    options: [
      { id: "", label: "Default (starter)" },
      ...[
        "LibreBaskerville-Regular",
        "Abel-Regular",
        "Acme-Regular",
        "Smokum-Regular",
        "GeistMono[wght]",
      ].map((label) => ({ id: label, label })),
    ],
  },
  {
    field: "text-alignment",
    label: "Align",
    initial: "left",
    options: [
      { id: "left", label: "Left" },
      { id: "center", label: "Center" },
      { id: "right", label: "Right" },
    ],
  },
  {
    field: "text-direction",
    label: "Direction",
    initial: "ltr",
    options: [
      { id: "ltr", label: "ltr" },
      { id: "rtl", label: "rtl" },
    ],
  },
];
const popupChoiceStyle = style({ width: "full", minWidth: 0 });
const popupLabelStyle = style({ overflowWrap: "anywhere" });
const popupSectionStyle = style({ display: "grid", gap: 8, minWidth: 0 });
const popupInputStyle = style({
  width: "full",
  minWidth: 0,
  padding: "[4px]",
  boxSizing: "border-box",
  font: "ui-sm",
  color: "[var(--text-primary)]",
  backgroundColor: "transparent",
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: "[var(--border-default)]",
  borderRadius: "[var(--radius-sm)]",
});

function mountPopup(implementation: "source" | "react") {
  const root = document.getElementById("root");
  if (!root) throw new Error("missing popup root");
  const theme = popupQuery.get("theme");
  const width = Number(popupQuery.get("width"));
  if ((theme !== "light" && theme !== "dark") || (width !== 220 && width !== 280))
    throw new Error("invalid popup parameters");
  const diagnostic = popupQuery.get("lane") === "diagnostic";
  document.documentElement.dataset.colorScheme = theme;
  const events: PopupRecord[] = [];
  const counts: Record<string, { mounts: number; cleanups: number }> = {};
  const accepted: Record<string, string> = {};
  const refs: Record<string, HTMLButtonElement> = {};
  let dropped = 0;
  function record(row: PopupRecord) {
    if (!diagnostic) return;
    if (events.length === 2048) {
      events.shift();
      dropped++;
    }
    events.push({ time: performance.now(), ...row });
  }
  function lifetime(name: string, phase: "mounts" | "cleanups") {
    const count = (counts[name] ??= { mounts: 0, cleanups: 0 });
    count[phase]++;
    record({ type: "fixture-lifetime", name, phase, ...count });
  }
  function retainRefs() {
    for (const { field } of popupFields) {
      const trigger = root!.querySelector(`[data-canvas-entry-field="${field}"] button`);
      if (!(trigger instanceof HTMLButtonElement))
        throw new Error(`missing original ${field} trigger`);
      if (!refs[field]) refs[field] = trigger;
      record({
        type: "original-ref",
        field,
        id: trigger.id,
        same: refs[field] === trigger,
        connected: trigger.isConnected,
      });
    }
    root!.dataset.popupReady = "true";
  }
  let disposeOwner: (() => void) | undefined;
  let disposed = false;
  function disposeFixture() {
    if (disposed || !disposeOwner) return;
    disposed = true;
    disposeOwner();
    lifetime("root", "cleanups");
  }
  const api = {
    dispose: disposeFixture,
    implementation,
    theme,
    width,
    diagnostic,
    events,
    counts,
    accepted,
    refs,
    snapshot: () => ({
      implementation,
      theme,
      width,
      diagnostic,
      events: [...events],
      counts: Object.fromEntries(
        Object.entries(counts).map(([name, value]) => [name, { ...value }]),
      ),
      accepted: { ...accepted },
      dropped,
      originalRefs: Object.fromEntries(
        Object.entries(refs).map(([field, ref]) => [
          field,
          {
            id: ref.id,
            connected: ref.isConnected,
            same: root!.querySelector(`[data-canvas-entry-field="${field}"] button`) === ref,
            focused: document.activeElement === ref,
          },
        ]),
      ),
      privatePickerPopoverFocusScope: "UNKNOWN: phase1 has no private instrumentation",
      reactCollectionRenderIsNativeMount: false,
    }),
  };
  (window as unknown as { __popup642: typeof api }).__popup642 = api;
  lifetime("root", "mounts");
  const context = {
    theme,
    width,
    fields: popupFields,
    record,
    lifetime,
    accepted,
    retainRefs,
    classes: {
      choice: popupChoiceStyle,
      label: popupLabelStyle,
      section: popupSectionStyle,
      input: popupInputStyle,
    },
  };
  if (implementation === "react") {
    void mountReactPickers(root, context).then((control) => {
      disposeOwner = control.dispose;
      window.addEventListener("pagehide", disposeFixture, { once: true });
    });
  } else {
    function Choice(props: { config: (typeof popupFields)[number] }) {
      const config = props.config;
      const [value, setValue] = createSignal(config.initial);
      accepted[config.field] = config.initial;
      let reported: string | undefined;
      onSettled(() => {
        lifetime(`committed-field:${config.field}`, "mounts");
        return () => lifetime(`committed-field:${config.field}`, "cleanups");
      });
      return (
        <Picker
          size="S"
          styles={popupChoiceStyle}
          label={<StyledText styles={popupLabelStyle}>{config.label}</StyledText>}
          data-canvas-entry-field={config.field}
          items={config.options}
          getKey={(option) => option.id}
          getTextValue={(option) => option.label}
          selectedKey={value()}
          onSelectionChange={(key) => {
            record({
              type: "callback",
              field: config.field,
              key,
              deduped: typeof key !== "string" || key === reported,
            });
            if (typeof key !== "string" || key === reported) return;
            reported = key;
            queueMicrotask(() => {
              reported = undefined;
            });
            // Synchronous external acceptance, matching the consumer DTO projection.
            accepted[config.field] = key;
            setValue(key);
            record({ type: "accepted", field: config.field, key });
          }}
        >
          {(option) => <PickerItem id={option.id}>{option.label}</PickerItem>}
        </Picker>
      );
    }
    function Owner() {
      onSettled(() => {
        lifetime("owner", "mounts");
        retainRefs();
        return () => lifetime("owner", "cleanups");
      });
      return (
        <Provider locale="en-US" colorScheme={theme} style={{ display: "contents" }}>
          <div data-editor-route-frame="true">
            <div
              data-canvas-entry-surface="true"
              tabindex={0}
              style={{
                position: "relative",
                isolation: "isolate",
                width: "100%",
                height: "900px",
                overflow: "hidden",
              }}
            >
              <aside
                data-canvas-entry-properties-dock="true"
                style={{ position: "absolute", right: "0", top: "64px", width: `${width}px` }}
              >
                <div
                  data-canvas-entry-properties-pane="true"
                  style={{ overflow: "auto", "min-width": "0", "min-height": "0" }}
                >
                  <div
                    id="canvas-entry-world-properties-panel"
                    data-canvas-entry-world-properties-panel="true"
                    role="region"
                    aria-label="Properties"
                    style={{ width: "100%", "min-width": "0", "box-sizing": "border-box" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        "flex-direction": "column",
                        padding: "8px",
                        gap: "4px",
                      }}
                    >
                      <section
                        data-canvas-entry-world-text-section="true"
                        class={popupSectionStyle}
                      >
                        <StyledText>Text</StyledText>
                        <label style={{ display: "grid", gap: "4px", "min-width": "0" }}>
                          <StyledText>Content</StyledText>
                          <input
                            class={popupInputStyle}
                            data-canvas-entry-field="text-content"
                            value="Hello"
                          />
                        </label>
                        <PickerContext value={{ menuWidth: 280 }}>
                          <Choice config={popupFields[0]} />
                        </PickerContext>
                        <label style={{ display: "grid", gap: "4px", "min-width": "0" }}>
                          <StyledText>Size</StyledText>
                          <input
                            class={popupInputStyle}
                            data-canvas-entry-field="text-font-size"
                            type="number"
                            min={1}
                            step={1}
                            value="16"
                          />
                        </label>
                        <Choice config={popupFields[1]} />
                        <Choice config={popupFields[2]} />
                      </section>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </Provider>
      );
    }
    const dispose = render(() => <Owner />, root);
    disposeOwner = dispose;
    window.addEventListener("pagehide", disposeFixture, { once: true });
  }
}

// #630 fixture-only sensitivity variants. Future controls replace only this value,
// save both final files, restore in finally and prove byte equality before replay.
const native630Variant: { name: string } = { name: "live" };
// Named alternatives: "snapshot-table-getters", "fresh-child-remount".
async function mountNative630(twin: "spectrum" | "viviana", host: "default" | "custom") {
  if (twin === "spectrum") await import("../../../../solid-spectrum/src/theme.css");
  const [cards, views, tables, fields, actions, menus, providers] =
    twin === "spectrum"
      ? await Promise.all([
          import("../../../../solid-spectrum/src/card/index"),
          import("../../../../solid-spectrum/src/cardview/index"),
          import("../../../../solid-spectrum/src/table/index"),
          import("../../../../solid-spectrum/src/textfield/index"),
          import("../../../../solid-spectrum/src/menu/ActionMenu"),
          import("../../../../solid-spectrum/src/menu/index"),
          import("../../../../solid-spectrum/src/provider/index"),
        ])
      : await Promise.all([
          import("../../../../viviana-ui/src/card/index"),
          import("../../../../viviana-ui/src/cardview/index"),
          import("../../../../viviana-ui/src/table/index"),
          import("../../../../viviana-ui/src/textfield/index"),
          import("../../../../viviana-ui/src/menu/ActionMenu"),
          import("../../../../viviana-ui/src/menu/index"),
          import("../../../../viviana-ui/src/provider/index"),
        ]);
  const { Card } = cards,
    { CardView } = views,
    { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } = tables,
    { TextField } = fields,
    { ActionMenu } = actions,
    { MenuItem: StyledMenuItem } = menus,
    { Provider: TwinProvider } = providers;
  const root = required("root");
  const counts = {
    table: { callbacks: 0, mounts: 0, owners: 0, effects: 0, effectCleanups: 0 },
    card: { callbacks: 0, mounts: 0, owners: 0, effects: 0, effectCleanups: 0 },
    root: { mounts: 0, owners: 0 },
    view: { callbacks: 0 },
  };
  const refs: Record<string, HTMLElement> = {};
  const events: {
    type: string;
    trusted: boolean;
    target: string;
    currentTarget: string;
    connected: boolean;
    original: boolean;
    currentTargetOriginal: boolean;
  }[] = [];
  let dropped = 0,
    disposed = false;
  let tableState:
    | { readonly isFocused: boolean; readonly isHovered: boolean; readonly isPressed: boolean }
    | undefined;
  function capture(event: Event) {
    if (events.length === 2048) {
      dropped++;
      return;
    }
    const target = event.target;
    events.push({
      type: event.type,
      trusted: event.isTrusted,
      target: target instanceof Element ? target.id : "",
      currentTarget: event.currentTarget instanceof Element ? event.currentTarget.id : "",
      connected: target instanceof Node && target.isConnected,
      original: Object.values(refs).includes(target as HTMLElement),
      currentTargetOriginal: Object.values(refs).includes(event.currentTarget as HTMLElement),
    });
  }
  function retain(name: string, node: HTMLElement) {
    if (!refs[name]) {
      refs[name] = node;
      for (const type of ["input", "click", "pointerdown", "pointerup", "keydown", "focusin"])
        node.addEventListener(type, capture);
    }
  }
  function Child(props: {
    kind: "table" | "card";
    state?: {
      readonly isFocused: boolean;
      readonly isHovered: boolean;
      readonly isPressed: boolean;
    };
  }) {
    const counter = counts[props.kind];
    counter.mounts++;
    const [local, setLocal] = createSignal(0);
    onCleanup(() => counter.owners++);
    createEffect(local, () => {
      counter.effects++;
      return () => {
        counter.effectCleanups++;
      };
    });
    return (
      <div id={`native630-${props.kind}-child`}>
        {props.kind === "card" ? (
          <span
            id="native630-card-surface"
            style={{ display: "block", width: "128px", height: "24px" }}
          >
            Card row surface
          </span>
        ) : null}
        {props.state ? (
          <span id="native630-live">{`focused=${props.state.isFocused};hovered=${props.state.isHovered};pressed=${props.state.isPressed}`}</span>
        ) : null}
        <TextField aria-label={`${props.kind} retained input`} />
        <button
          id={`native630-${props.kind}-local`}
          type="button"
          onClick={() => setLocal(local() + 1)}
        >
          Local {local()}
        </button>
        {props.kind === "card" ? (
          <ActionMenu id="native630-trigger" aria-label="Card actions">
            <StyledMenuItem id="retain" textValue="Retain">
              Retain
            </StyledMenuItem>
            <StyledMenuItem id="close" textValue="Close">
              Close
            </StyledMenuItem>
          </ActionMenu>
        ) : null}
      </div>
    );
  }
  const rows = [{ id: "row", label: "Native row" }];
  function Owner() {
    counts.root.mounts++;
    onCleanup(() => counts.root.owners++);
    onSettled(() => {
      for (const kind of ["table", "card"] as const) {
        const child = required(`native630-${kind}-child`);
        const input = child.querySelector("input");
        if (!(input instanceof HTMLInputElement)) throw new Error(`missing ${kind} input`);
        input.id = `native630-${kind}-input`;
        retain(`${kind}Input`, input);
        retain(`${kind}Button`, required(`native630-${kind}-local`));
      }
      const cell = refs.tableInput.closest("td");
      const card = refs.cardInput.closest('[role="row"]');
      if (!(cell instanceof HTMLElement) || !(card instanceof HTMLElement))
        throw new Error("missing original cell/card");
      retain("cell", cell);
      card.id = "native630-card-row";
      retain("card", card);
      retain("cardSurface", required("native630-card-surface"));
      retain("trigger", required("native630-trigger"));
      retain("live", required("native630-live"));
      root.dataset.native630Ready = "true";
    });
    return (
      <TwinProvider colorScheme="light">
        <button id="native630-outside" type="button">
          Outside
        </button>
        <Table
          aria-label="Native retention"
          items={rows}
          columns={[
            { id: "edit", name: "Edit" },
            { id: "adjacent", name: "Adjacent" },
            { id: "static", name: "Static" },
            { id: "accessor", name: "Accessor" },
          ]}
          getKey={(item) => item.id}
          selectionMode="single"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="edit">Edit</TableColumn>
                <TableColumn id="adjacent">Adjacent</TableColumn>
                <TableColumn id="static">Static</TableColumn>
                <TableColumn id="accessor">Accessor</TableColumn>
              </TableHeader>
              <TableBody>
                {(item) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell
                          id="edit"
                          render={host === "custom" ? (attrs) => <td {...attrs} /> : undefined}
                        >
                          {(state) => {
                            counts.table.callbacks++;
                            tableState = state;
                            const observed =
                              native630Variant.name === "snapshot-table-getters"
                                ? untrack(() => ({
                                    isFocused: state.isFocused,
                                    isHovered: state.isHovered,
                                    isPressed: state.isPressed,
                                  }))
                                : state;
                            return native630Variant.name === "fresh-child-remount" ? (
                              <For each={[state.isHovered]}>
                                {() => <Child kind="table" state={observed} />}
                              </For>
                            ) : (
                              <Child kind="table" state={observed} />
                            );
                          }}
                        </TableCell>
                        <TableCell id="adjacent">
                          {(state) => (
                            <span id="native630-adjacent">{`adjacent-hovered=${state.isHovered}`}</span>
                          )}
                        </TableCell>
                        <TableCell id="static">
                          <span id="native630-static">Static retained</span>
                        </TableCell>
                        <TableCell id="accessor">
                          {function accessor() {
                            if (arguments.length !== 0)
                              throw new Error("accessor received arguments");
                            return <span id="native630-accessor">Zero arguments</span>;
                          }}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
        <CardView
          aria-label="Native cards"
          items={rows}
          getKey={(item) => item.id}
          selectionMode="single"
        >
          {(item) => {
            counts.view.callbacks++;
            return (
              <Card id={item.id} textValue={item.label}>
                {(state) => {
                  counts.card.callbacks++;
                  if (Object.keys(state).some((key) => key !== "size"))
                    throw new Error("unexpected Card callback contract");
                  return <Child kind="card" />;
                }}
              </Card>
            );
          }}
        </CardView>
      </TwinProvider>
    );
  }
  const disposeOwner = render(() => <Owner />, root);
  function dispose() {
    if (disposed) return;
    disposed = true;
    disposeOwner();
    for (const node of Object.values(refs))
      for (const type of ["input", "click", "pointerdown", "pointerup", "keydown", "focusin"])
        node.removeEventListener(type, capture);
  }
  (window as unknown as { __native630: unknown }).__native630 = {
    refs,
    dispose,
    capturePopup() {
      const menu = document.querySelector('[role="menu"]');
      const item = menu?.querySelector('[role="menuitem"]');
      if (!(menu instanceof HTMLElement) || !(item instanceof HTMLElement))
        throw new Error("missing supported open popup/item");
      retain("menu", menu);
      retain("item", item);
    },
    snapshot: () => {
      if (!tableState) throw new Error("missing Table producer getters");
      return {
        counts: structuredClone(counts),
        events: [...events],
        dropped,
        disposed,
        state: {
          isFocused: tableState.isFocused,
          isHovered: tableState.isHovered,
          isPressed: tableState.isPressed,
        },
      };
    },
  };
  window.addEventListener("pagehide", dispose, { once: true });
}

// #642: select the implementation before the first mount. Legacy imperative
// mounts (including required()/mountReactMenu) run only in the default mode.
const popupQuery = new URLSearchParams(location.search);
const popupImplementation = popupQuery.get("ui642");
const native630Twin = popupQuery.get("ui630");
if (native630Twin !== null) {
  const host = popupQuery.get("host");
  if (
    popupImplementation !== null ||
    (native630Twin !== "spectrum" && native630Twin !== "viviana") ||
    (host !== "default" && host !== "custom")
  )
    throw new Error("invalid isolated #630 mode");
  await mountNative630(native630Twin, host);
} else if (popupImplementation === null) mountLegacy();
else if (popupImplementation === "source" || popupImplementation === "react") {
  mountPopup(popupImplementation);
} else throw new Error("unknown ui642 implementation");
