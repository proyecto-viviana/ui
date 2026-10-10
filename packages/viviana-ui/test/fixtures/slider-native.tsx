import { createSignal } from "solid-js";
import { Provider } from "../../src/provider";
import { Slider, RangeSlider } from "../../src/slider";

/** Same authored owner tree compiled independently by SSR and hydrate configs. */
export function SliderNativeFixture(props: {
  onScalarChange?: (value: number) => void;
  onRangeChange?: (value: { start: number; end: number }) => void;
  onScalarChangeEnd?: (value: number) => void;
  onRangeChangeEnd?: (value: { start: number; end: number }) => void;
  shouldEchoChange?: () => boolean;
}) {
  const [scalar, setScalar] = createSignal(40);
  const [range, setRange] = createSignal({ start: 20, end: 80 });
  return (
    <Provider locale="en-US" colorScheme="light">
      <form id="slider-proof-form">
        <button
          type="button"
          onClick={() => {
            setScalar(55);
            setRange({ start: 30, end: 70 });
          }}
        >
          Update controlled sliders
        </button>
      </form>
      <p id="scalar-help">Scalar help</p>
      <p id="range-help">Range help</p>
      <Slider
        id="scalar-proof"
        label="Volume"
        name="volume"
        form="slider-proof-form"
        aria-describedby="scalar-help"
        minValue={0}
        maxValue={100}
        step={5}
        defaultValue={40}
        value={scalar()}
        onChange={(value) => {
          props.onScalarChange?.(value);
          if (props.shouldEchoChange?.() !== false) setScalar(value);
        }}
        onChangeEnd={props.onScalarChangeEnd}
      />
      <RangeSlider
        id="range-proof"
        label="Price"
        startName="minimum"
        endName="maximum"
        form="slider-proof-form"
        aria-describedby="range-help"
        minValue={0}
        maxValue={100}
        step={5}
        defaultValue={{ start: 20, end: 80 }}
        value={range()}
        onChange={(value) => {
          props.onRangeChange?.(value);
          if (props.shouldEchoChange?.() !== false) setRange(value);
        }}
        onChangeEnd={props.onRangeChangeEnd}
      />
    </Provider>
  );
}
