import { createMemo, createSignal, createUniqueId, Errored, onCleanup } from "solid-js";
import type { JSX } from "@solidjs/web";

export function IslandFixture(props: {
  label: string;
  optional?: string;
  children?: JSX.Element;
  namedSlot?: JSX.Element;
  onDispose?: () => void;
  onBubble?: () => void;
}) {
  const id = createUniqueId();
  const [count, setCount] = createSignal(0);
  onCleanup(() => props.onDispose?.());
  return (
    <section onClick={() => props.onBubble?.()}>
      <button id={id} data-optional={props.optional} onClick={() => setCount((value) => value + 1)}>
        {props.label}:{count()}
      </button>
      <div aria-labelledby={id}>
        {props.children}
        {props.namedSlot}
      </div>
    </section>
  );
}

export function AsyncFixture(props: { load: () => Promise<string> }) {
  const value = createMemo(() => props.load());
  return <p>{value()}</p>;
}

export function InputFixture() {
  const [value, setValue] = createSignal("initial");
  return (
    <section>
      <input value={value()} onInput={(event) => setValue(event.currentTarget.value)} />
      <output>{value()}</output>
    </section>
  );
}

function ThrowingChild(props: { failure: unknown }): JSX.Element {
  throw props.failure;
}

export function HandledFailureFixture(props: { failure: unknown }) {
  return (
    <Errored fallback={(_error) => <p>handled fallback</p>}>
      <ThrowingChild failure={props.failure} />
    </Errored>
  );
}
