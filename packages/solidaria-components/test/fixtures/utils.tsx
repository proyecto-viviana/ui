import {
  createContext,
  createSignal,
  createUniqueId,
  onCleanup,
  Show,
  useContext,
  type Context,
} from "solid-js";
import { ElementTag } from "../../src/ElementTag";
import {
  ClientOnly,
  OptionContent,
  Provider,
  useIsHydrated,
  useRenderProps,
} from "../../src/utils";

const LabelContext = createContext("outside");
const SuffixContext = createContext("missing");

export interface DynamicControls {
  update: () => void;
  reveal: (visible: boolean) => void;
  retag: (tag: string) => void;
}

interface DynamicProbe {
  controls?: (controls: DynamicControls) => void;
  constructed?: (kind: string) => void;
  disposed?: (kind: string) => void;
  ref?: (element: HTMLElement) => void;
}

function ContextChild(props: DynamicProbe & { kind: string; label: string }) {
  props.constructed?.(props.kind);
  onCleanup(() => props.disposed?.(props.kind));
  const label = useContext(LabelContext);
  const suffix = useContext(SuffixContext);
  const id = createUniqueId();
  return (
    <span id={id}>
      {label}:{props.label}:{suffix}
    </span>
  );
}

/** Nested contexts, a reactive spread, and an element first created after hydration. */
export function DynamicFixture(props: DynamicProbe) {
  const [label, setLabel] = createSignal("first");
  const [tag, setTag] = createSignal("button");
  const [visible, setVisible] = createSignal(false);
  const [clicks, setClicks] = createSignal(0);
  props.controls?.({
    update: () => setLabel("second"),
    reveal: setVisible,
    retag: setTag,
  });
  return (
    <Provider
      values={
        [
          [LabelContext, "inner"],
          [LabelContext, "outer"],
          [SuffixContext, "context"],
        ] as Array<[Context<unknown>, unknown]>
      }
    >
      <section>
        <ElementTag
          {...{ tag: tag(), title: label(), class: `label-${label()}` }}
          data-fixture="dynamic"
          component="forwarded"
          tabIndex={0}
          ref={props.ref}
          onClick={() => setClicks((count) => count + 1)}
        >
          <ContextChild {...props} kind="initial" label={label()} />
        </ElementTag>
        <output data-fixture="clicks">{clicks()}</output>
        <Show when={visible()} fallback={<p data-fixture="fallback">Waiting</p>}>
          <ElementTag tag={tag()} data-fixture="delayed" title={label()}>
            <ContextChild {...props} kind="delayed" label={label()} />
          </ElementTag>
        </Show>
        <ElementTag tag="mark" data-fixture="unlisted">
          Unlisted tag
        </ElementTag>
      </section>
    </Provider>
  );
}

export interface RenderControls {
  update: () => void;
  reveal: (visible: boolean) => void;
}

interface RenderProbe {
  controls?: (controls: RenderControls) => void;
  rendered?: () => void;
}

/** Render-prop and zero-argument children retain their owning context and bindings. */
export function RenderPropsFixture(props: RenderProbe) {
  const [selected, setSelected] = createSignal(false);
  const [label, setLabel] = createSignal("first");
  const [visible, setVisible] = createSignal(true);
  props.controls?.({
    update: () => {
      setSelected(true);
      setLabel("second");
    },
    reveal: setVisible,
  });
  const renderProps = useRenderProps(
    {
      children: (state: { selected: boolean }) => {
        props.rendered?.();
        const context = useContext(LabelContext);
        return (
          <ElementTag tag="span" data-fixture="render-prop" data-selected={String(state.selected)}>
            {context}:{label()}
          </ElementTag>
        );
      },
    },
    () => ({ selected: selected() }),
  );
  const accessor = useRenderProps({ children: () => label() }, () => ({}));
  return (
    <Provider values={[[LabelContext, "render-context"]] as Array<[Context<unknown>, unknown]>}>
      <section>
        <OptionContent render={renderProps.renderChildrenStable} labelProps={{ id: "unused" }} />
        <p data-fixture="accessor">
          <OptionContent
            render={accessor.renderChildrenStable}
            labelProps={{ id: "also-unused" }}
          />
        </p>
        <Show when={visible()} fallback={<p data-fixture="render-fallback">Hidden</p>}>
          <ElementTag tag="span" data-fixture="conditional">
            {label()}
          </ElementTag>
        </Show>
      </section>
    </Provider>
  );
}

export interface HydrationGateProbe {
  controls?: (controls: RenderControls) => void;
  state?: (hydrated: boolean) => void;
  constructed?: (kind: string, id: string) => void;
  disposed?: (kind: string) => void;
  ref?: (kind: string, element: HTMLSpanElement) => void;
}

function GateContent(props: HydrationGateProbe & { kind: string; label: string }) {
  const id = createUniqueId();
  const context = useContext(LabelContext);
  props.constructed?.(props.kind, id);
  onCleanup(() => props.disposed?.(props.kind));
  return (
    <span id={id} data-gate={props.kind} ref={(element) => props.ref?.(props.kind, element)}>
      {context}:{props.label}
    </span>
  );
}

function HookGate(props: HydrationGateProbe & { label: string }) {
  const hydrated = useIsHydrated();
  const id = createUniqueId();
  props.constructed?.("hook-following", id);
  onCleanup(() => props.disposed?.("hook-following"));
  props.state?.(hydrated());
  return (
    <>
      <Show when={hydrated()} fallback={<GateContent {...props} kind="hook-fallback" />}>
        <GateContent {...props} kind="hook-child" />
      </Show>
      <span
        id={id}
        data-gate="hook-following"
        ref={(element) => props.ref?.("hook-following", element)}
      >
        Hook sibling
      </span>
    </>
  );
}

/** Fallbacks must be adopted before client-only children mount, without shifting sibling IDs. */
export function HydrationGateFixture(props: HydrationGateProbe) {
  const [label, setLabel] = createSignal("first");
  const [visible, setVisible] = createSignal(true);
  props.controls?.({ update: () => setLabel("second"), reveal: setVisible });
  return (
    <Provider values={[[LabelContext, "gate-context"]] as Array<[Context<unknown>, unknown]>}>
      <section>
        <Show when={visible()}>
          <ClientOnly
            fallback={<GateContent {...props} kind="component-fallback" label={label()} />}
          >
            <GateContent {...props} kind="component-child" label={label()} />
          </ClientOnly>
          <ClientOnly>
            <GateContent {...props} kind="empty-child" label={label()} />
          </ClientOnly>
          <HookGate {...props} label={label()} />
        </Show>
        <GateContent {...props} kind="following" label={label()} />
      </section>
    </Provider>
  );
}
