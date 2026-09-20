import {
  createContext,
  createMemo,
  createSignal,
  createUniqueId,
  Loading,
  onCleanup,
  Show,
  useContext,
  type Context,
} from "solid-js";
import { OptionContent, Provider, useRenderProps } from "../../src/utils";

const StreamContext = createContext("outside");

export interface StreamingProbe {
  load: () => Promise<string>;
  controls?: (controls: { update: () => void; reveal: (visible: boolean) => void }) => void;
  constructed?: (kind: string, token: symbol, id: string) => void;
  disposed?: (token: symbol) => void;
  ref?: (kind: string, element: HTMLSpanElement) => void;
}

function StreamNode(props: StreamingProbe & { kind: string; label: string }) {
  const id = createUniqueId();
  const context = useContext(StreamContext);
  const token = Symbol(props.kind);
  props.constructed?.(props.kind, token, id);
  onCleanup(() => props.disposed?.(token));
  return (
    <span id={id} data-stream={props.kind} ref={(element) => props.ref?.(props.kind, element)}>
      {context}:{props.label}
    </span>
  );
}

function StreamContent(props: StreamingProbe & { value: string; label: string }) {
  const renderProps = useRenderProps(
    {
      children: (state: { value: string }) => (
        <StreamNode {...props} kind="resolved" label={`${state.value}:${props.label}`} />
      ),
    },
    () => ({ value: props.value }),
  );
  return <OptionContent render={renderProps.renderChildrenStable} labelProps={{ id: "unused" }} />;
}

/** A genuinely pending Loading boundary, then conditional/provider-owned render props. */
export function StreamingFixture(props: StreamingProbe) {
  const data = createMemo<string>(() => props.load());
  const [label, setLabel] = createSignal("first");
  const [visible, setVisible] = createSignal(true);
  props.controls?.({
    update: () => setLabel((value) => (value === "first" ? "second" : "first")),
    reveal: setVisible,
  });
  return (
    <Provider values={[[StreamContext, "stream-context"]] as Array<[Context<unknown>, unknown]>}>
      <section data-stream-root>
        <Loading fallback={<StreamNode {...props} kind="fallback" label="waiting" />}>
          <Show when={data()}>
            {(value) => (
              <Show when={visible()}>
                <StreamContent {...props} value={value()} label={label()} />
              </Show>
            )}
          </Show>
        </Loading>
        <StreamNode {...props} kind="following" label={label()} />
      </section>
    </Provider>
  );
}

function extractStreamingScripts(container: ParentNode): string[] {
  const scripts = [...container.querySelectorAll("script")];
  for (const script of scripts) {
    if (
      script.hasAttribute("src") ||
      (script.type && !["text/javascript", "application/javascript"].includes(script.type))
    ) {
      throw new Error("Streaming fixture supports only generated classic inline scripts");
    }
  }
  return scripts.map((script) => {
    const text = script.textContent ?? "";
    script.remove();
    return text;
  });
}

/** Replay only trusted, locally generated classic inline SSR scripts in the same realm. */
export function runStreamingScripts(container: ParentNode): void {
  for (const text of extractStreamingScripts(container)) window.eval(text);
}

/** Append the emitted tail, exposing its exact template nodes before Solid moves them. */
export function deliverStreamingTail(
  container: HTMLElement,
  tail: string,
  inspect?: (fragment: DocumentFragment) => void,
): void {
  const parser = document.createElement("template");
  parser.innerHTML = tail;
  const scripts = extractStreamingScripts(parser.content);
  inspect?.(parser.content);
  container.appendChild(parser.content);
  for (const text of scripts) window.eval(text);
}
