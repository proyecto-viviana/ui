/** @jsxImportSource solid-js */
import { Show, createSignal, onCleanup, onMount, type Component, type JSX } from "solid-js";
import { Button } from "@proyecto-viviana/geist/components/button";
import {
  GEIST_BUTTON_FIXTURE_DEFAULTS,
  GEIST_BUTTON_SHAPES,
  GEIST_BUTTON_SIZES,
  GEIST_BUTTON_VARIANTS,
  GEIST_COLOR_MODES,
  GEIST_FIXTURE_STATE_EVENT,
  isGeistButtonFixtureState,
  type GeistButtonFixtureState,
  type GeistButtonShape,
  type GeistButtonSize,
  type GeistButtonVariant,
} from "@comparison/data/geist-button-fixture";

const PlusIcon: Component = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
  >
    <path d="M8 3v10M3 8h10" />
  </svg>
);

interface FixtureButtonProps {
  id: string;
  label: string;
  variant?: GeistButtonVariant;
  size?: GeistButtonSize;
  shape?: GeistButtonShape;
  prefix?: boolean;
  svgOnly?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function FixtureButton(props: FixtureButtonProps) {
  return (
    <Show
      when={props.svgOnly}
      fallback={
        <Button
          data-fixture-state={props.id}
          disabled={props.disabled}
          prefix={props.prefix ? () => <PlusIcon /> : undefined}
          loading={props.loading}
          onClick={props.onClick}
          shape={props.shape}
          size={props.size}
          variant={props.variant}
        >
          {props.label}
        </Button>
      }
    >
      <Button
        data-fixture-state={props.id}
        aria-label={props.label}
        disabled={props.disabled}
        loading={props.loading}
        onClick={props.onClick}
        shape={props.shape}
        size={props.size}
        svgOnly
        variant={props.variant}
      >
        <PlusIcon />
      </Button>
    </Show>
  );
}

function FixtureGroup(props: { label: string; children: JSX.Element }) {
  return (
    <section class="geist-fixture-group">
      <h2>{props.label}</h2>
      <div class="geist-fixture-row">{props.children}</div>
    </section>
  );
}

function recordFormResult(event: Event) {
  event.preventDefault();
  const submitEvent = event as SubmitEvent;
  const form = submitEvent.currentTarget as HTMLFormElement;
  const data = new FormData(form, submitEvent.submitter ?? undefined);
  return JSON.stringify(Object.fromEntries(data.entries()));
}

export default function GeistButtonFixture() {
  const [state, setState] = createSignal<GeistButtonFixtureState>(GEIST_BUTTON_FIXTURE_DEFAULTS);
  const [pressCount, setPressCount] = createSignal(0);
  const [formResult, setFormResult] = createSignal("idle");
  const [hydrated, setHydrated] = createSignal(false);

  onMount(() => {
    setHydrated(true);
    const updateState = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (isGeistButtonFixtureState(detail)) setState(detail);
    };

    window.addEventListener(GEIST_FIXTURE_STATE_EVENT, updateState);
    onCleanup(() => window.removeEventListener(GEIST_FIXTURE_STATE_EVENT, updateState));
  });

  return (
    <main
      class="geist-fixture-root"
      data-framework="solid"
      data-fixture-variant={state().variant}
      data-fixture-size={state().size}
      data-fixture-shape={state().shape}
      data-mode={state().mode}
      data-theme="geist"
      data-hydrated={hydrated() ? "true" : undefined}
    >
      <FixtureGroup label="Shared control">
        <FixtureButton
          id="controlled"
          label={state().svgOnly ? "Deploy Project" : "Deploy Project"}
          variant={state().variant}
          size={state().size}
          shape={state().shape}
          prefix={state().prefix}
          svgOnly={state().svgOnly}
          loading={state().loading}
          disabled={state().disabled}
          onClick={() => setPressCount((count) => count + 1)}
        />
        <output data-fixture-output="press-count" aria-live="polite">
          Activated {pressCount()} times
        </output>
      </FixtureGroup>

      <FixtureGroup label="Variants">
        {GEIST_BUTTON_VARIANTS.map((variant) => (
          <FixtureButton id={`variant-${variant}`} label={variant} variant={variant} />
        ))}
      </FixtureGroup>

      <FixtureGroup label="Sizes">
        {GEIST_BUTTON_SIZES.map((size) => (
          <FixtureButton id={`size-${size}`} label={size} size={size} />
        ))}
      </FixtureGroup>

      <FixtureGroup label="Shapes">
        {GEIST_BUTTON_SHAPES.map((shape) => (
          <FixtureButton id={`shape-${shape}`} label={shape} shape={shape} />
        ))}
      </FixtureGroup>

      <FixtureGroup label="Prefix and svgOnly">
        <FixtureButton id="state-prefix" label="With Prefix" prefix />
        <FixtureButton id="shape-square-svg" label="Square Icon" shape="square" svgOnly />
        <FixtureButton id="shape-circle-svg" label="Circle Icon" shape="circle" svgOnly />
        <FixtureButton id="shape-rounded-svg" label="Rounded Icon" shape="rounded" svgOnly />
      </FixtureGroup>

      <FixtureGroup label="System states">
        <FixtureButton id="state-loading" label="Deploying" loading />
        <FixtureButton id="state-disabled" label="Disabled" disabled />
      </FixtureGroup>

      <FixtureGroup label="Form participation">
        <form
          id="geist-native-form-solid"
          class="geist-fixture-form"
          data-fixture-form="native"
          onSubmit={(event) => setFormResult(recordFormResult(event))}
        >
          <input type="hidden" name="project" value="next" />
          <Button data-fixture-state="form-default">Do not submit</Button>
          <Button data-fixture-state="form-submit" name="intent" type="submit" value="deploy">
            Submit form
          </Button>
          <Button
            data-fixture-state="form-ref"
            ref={(element) => {
              if (element) element.setAttribute("data-ref-attached", "true");
            }}
          >
            Callback ref
          </Button>
        </form>
        <Button
          data-fixture-state="form-associate"
          form="geist-native-form-solid"
          name="intent"
          type="submit"
          value="associate"
        >
          Associate
        </Button>
        <output data-fixture-output="form-result">{formResult()}</output>
      </FixtureGroup>

      <FixtureGroup label="Pinned color modes">
        {GEIST_COLOR_MODES.map((mode) => (
          <div
            class="geist-fixture-mode-swatch"
            data-fixture-mode={mode}
            data-mode={mode}
            data-theme="geist"
          >
            <span>{mode}</span>
            <FixtureButton id={`mode-${mode}-default`} label="Deploy" variant="default" />
            <FixtureButton id={`mode-${mode}-secondary`} label="Cancel" variant="secondary" />
            <FixtureButton id={`mode-${mode}-error`} label="Delete" variant="error" />
          </div>
        ))}
      </FixtureGroup>
    </main>
  );
}
