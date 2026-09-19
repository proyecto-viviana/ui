import { createEffect, createSignal, onCleanup, type Setter } from "solid-js";

interface LifecycleProbe {
  eventType: string;
  onCleanup: () => void;
  onEvent: () => void;
  onEffect: () => void;
  receiveSetter: (setter: Setter<number>) => void;
}

export function HydrateOverSsrFixture(props: {
  lifecycle?: LifecycleProbe;
  mismatch?: boolean;
  structureMismatch?: boolean;
  throwDuringHydration?: Error;
}) {
  if (props.throwDuringHydration) throw props.throwDuringHydration;

  const content = props.mismatch ? (
    <section data-probe="ok">
      <button type="button">ok</button>
    </section>
  ) : props.structureMismatch ? (
    <div data-probe="ok">
      <span title={props.structureMismatch ? "mismatch" : "ok"}>ok</span>
    </div>
  ) : (
    <div data-probe="ok">
      <button type="button">ok</button>
    </div>
  );

  if (props.lifecycle) {
    const [value, setValue] = createSignal(0);
    const onEvent = () => {
      props.lifecycle!.onEvent();
      setValue((current) => current + 1);
    };
    props.lifecycle.receiveSetter(setValue);
    document.addEventListener(props.lifecycle.eventType, onEvent);
    createEffect(
      () => value(),
      () => {
        props.lifecycle!.onEffect();
      },
    );
    onCleanup(() => {
      document.removeEventListener(props.lifecycle!.eventType, onEvent);
      props.lifecycle!.onCleanup();
    });
  }

  return content;
}
