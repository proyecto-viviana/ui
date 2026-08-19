import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@cloudflare/kumo/components/button";
import {
  KUMO_BUTTON_FIXTURE_DEFAULTS,
  KUMO_BUTTON_SIZES,
  KUMO_BUTTON_VARIANTS,
  KUMO_COLOR_MODES,
  KUMO_FIXTURE_STATE_EVENT,
  isKumoButtonFixtureState,
  type KumoButtonFixtureState,
  type KumoButtonShape,
  type KumoButtonSize,
  type KumoButtonVariant,
} from "@comparison/data/kumo-button-fixture";

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

interface FixtureButtonProps {
  id: string;
  label: string;
  variant?: KumoButtonVariant;
  size?: KumoButtonSize;
  shape?: KumoButtonShape;
  icon?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function FixtureButton(props: FixtureButtonProps) {
  const common = {
    "data-fixture-state": props.id,
    disabled: props.disabled,
    icon: props.icon ? <PlusIcon /> : undefined,
    loading: props.loading,
    onClick: props.onClick,
    size: props.size,
    variant: props.variant,
  };

  if (props.shape === "square" || props.shape === "circle") {
    return <Button {...common} aria-label={props.label} shape={props.shape} />;
  }

  return <Button {...common}>{props.label}</Button>;
}

function FixtureGroup(props: { label: string; children: ReactNode }) {
  return (
    <section className="kumo-fixture-group">
      <h2>{props.label}</h2>
      <div className="kumo-fixture-row">{props.children}</div>
    </section>
  );
}

function recordFormResult(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const submitter = (event.nativeEvent as SubmitEvent).submitter;
  const data = new FormData(event.currentTarget, submitter ?? undefined);
  return JSON.stringify(Object.fromEntries(data.entries()));
}

export default function KumoButtonFixture() {
  const [state, setState] = useState<KumoButtonFixtureState>(KUMO_BUTTON_FIXTURE_DEFAULTS);
  const [pressCount, setPressCount] = useState(0);
  const [formResult, setFormResult] = useState("idle");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const updateState = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (isKumoButtonFixtureState(detail)) setState(detail);
    };

    window.addEventListener(KUMO_FIXTURE_STATE_EVENT, updateState);
    return () => window.removeEventListener(KUMO_FIXTURE_STATE_EVENT, updateState);
  }, []);

  return (
    <main
      className="kumo-fixture-root"
      data-framework="react"
      data-fixture-variant={state.variant}
      data-fixture-size={state.size}
      data-fixture-shape={state.shape}
      data-mode={state.mode}
      data-theme="kumo"
      data-hydrated={hydrated ? "true" : undefined}
    >
      <FixtureGroup label="Shared control">
        <FixtureButton
          id="controlled"
          label="Deploy Worker"
          variant={state.variant}
          size={state.size}
          shape={state.shape}
          icon={state.withIcon || state.shape !== "base"}
          loading={state.loading}
          disabled={state.disabled}
          onClick={() => setPressCount((count) => count + 1)}
        />
        <output data-fixture-output="press-count" aria-live="polite">
          Activated {pressCount} times
        </output>
      </FixtureGroup>

      <FixtureGroup label="Variants">
        {KUMO_BUTTON_VARIANTS.map((variant) => (
          <FixtureButton
            key={variant}
            id={`variant-${variant}`}
            label={variant}
            variant={variant}
          />
        ))}
      </FixtureGroup>

      <FixtureGroup label="Sizes">
        {KUMO_BUTTON_SIZES.map((size) => (
          <FixtureButton key={size} id={`size-${size}`} label={size} size={size} />
        ))}
      </FixtureGroup>

      <FixtureGroup label="Shapes and system states">
        <FixtureButton id="shape-square" label="Add square" shape="square" icon />
        <FixtureButton id="shape-circle" label="Add circle" shape="circle" icon />
        <FixtureButton id="state-loading" label="Saving" loading />
        <FixtureButton id="state-disabled" label="Disabled" disabled />
      </FixtureGroup>

      <FixtureGroup label="Form participation">
        <form
          id="kumo-native-form-react"
          className="kumo-fixture-form"
          data-fixture-form="native"
          onSubmit={(event) => setFormResult(recordFormResult(event))}
        >
          <input type="hidden" name="worker" value="edge" />
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
          form="kumo-native-form-react"
          name="intent"
          type="submit"
          value="associate"
        >
          Associate
        </Button>
        <output data-fixture-output="form-result">{formResult}</output>
      </FixtureGroup>

      <FixtureGroup label="Pinned color modes">
        {KUMO_COLOR_MODES.map((mode) => (
          <div
            key={mode}
            className="kumo-fixture-mode-swatch"
            data-fixture-mode={mode}
            data-mode={mode}
            data-theme="kumo"
          >
            <span>{mode}</span>
            <FixtureButton id={`mode-${mode}`} label="Create" variant="primary" />
            <FixtureButton id={`mode-${mode}-secondary`} label="Cancel" />
          </div>
        ))}
      </FixtureGroup>
    </main>
  );
}
