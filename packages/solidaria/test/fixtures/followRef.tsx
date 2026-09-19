import { createContext, createSignal, onCleanup, useContext, type Accessor } from "solid-js";
import { followRef } from "../../src/utils/refs";

const LabelContext = createContext("fallback");

interface Probe {
  onConstruct?: () => void;
  onDispose?: () => void;
  receiveRef?: (ref: Accessor<HTMLButtonElement | null | undefined>) => void;
}

function RefChild(props: Probe) {
  props.onConstruct?.();
  onCleanup(() => props.onDispose?.());
  const label = useContext(LabelContext);
  const [ref, setRef] = createSignal<HTMLButtonElement | null>(null);
  const first = followRef(ref);
  const second = followRef(() => first() ?? null);
  props.receiveRef?.(second);
  const [count, setCount] = createSignal(0);
  return (
    <button ref={(element) => setRef(() => element)} onClick={() => setCount((value) => value + 1)}>
      {label}: {count()}
    </button>
  );
}

export function FollowRefFixture(props: Probe) {
  return (
    <LabelContext value="Nested refs">
      <RefChild {...props} />
    </LabelContext>
  );
}
