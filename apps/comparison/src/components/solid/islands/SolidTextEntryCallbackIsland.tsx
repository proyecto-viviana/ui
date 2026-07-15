/** @jsxImportSource solid-js */
import { createSignal, onMount, type JSX } from "solid-js";
import {
  Provider as SolidSpectrumProvider,
  TextArea,
  TextField,
} from "@proyecto-viviana/solid-spectrum";

type ContractCase =
  | "controlled-field"
  | "uncontrolled-field"
  | "controlled-area"
  | "uncontrolled-area";

interface CallbackState {
  count: () => number;
  type: () => string;
  value: () => string;
  record: (value: string) => void;
}

function createCallbackState(): CallbackState {
  const [count, setCount] = createSignal(0);
  const [type, setType] = createSignal("unset");
  const [value, setValue] = createSignal("");

  return {
    count,
    type,
    value,
    record(nextValue) {
      setCount((current) => current + 1);
      setType(typeof nextValue);
      setValue(nextValue);
    },
  };
}

function ContractRoot(props: { id: ContractCase; state: CallbackState; children: JSX.Element }) {
  return (
    <section
      data-callback-case={props.id}
      data-callback-count={String(props.state.count())}
      data-callback-type={props.state.type()}
      data-callback-value={props.state.value()}
    >
      {props.children}
    </section>
  );
}

export default function SolidTextEntryCallbackIsland() {
  const [hydrated, setHydrated] = createSignal(false);
  const [controlledFieldValue, setControlledFieldValue] = createSignal("field-initial");
  const [controlledAreaValue, setControlledAreaValue] = createSignal("area-initial");
  const controlledField = createCallbackState();
  const uncontrolledField = createCallbackState();
  const controlledArea = createCallbackState();
  const uncontrolledArea = createCallbackState();

  onMount(() => setHydrated(true));

  return (
    <SolidSpectrumProvider colorScheme="light" background="base">
      <div data-comparison-hydrated={hydrated() ? "true" : undefined}>
        <ContractRoot id="controlled-field" state={controlledField}>
          <TextField
            label="Controlled field"
            value={controlledFieldValue()}
            onChange={(value) => {
              controlledField.record(value);
              setControlledFieldValue(value);
            }}
          />
        </ContractRoot>
        <ContractRoot id="uncontrolled-field" state={uncontrolledField}>
          <TextField
            label="Uncontrolled field"
            defaultValue="field-initial"
            onChange={uncontrolledField.record}
          />
        </ContractRoot>
        <ContractRoot id="controlled-area" state={controlledArea}>
          <TextArea
            label="Controlled area"
            value={controlledAreaValue()}
            onChange={(value) => {
              controlledArea.record(value);
              setControlledAreaValue(value);
            }}
          />
        </ContractRoot>
        <ContractRoot id="uncontrolled-area" state={uncontrolledArea}>
          <TextArea
            label="Uncontrolled area"
            defaultValue="area-initial"
            onChange={uncontrolledArea.record}
          />
        </ContractRoot>
      </div>
    </SolidSpectrumProvider>
  );
}
