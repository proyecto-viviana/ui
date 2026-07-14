/** @jsxImportSource solid-js */
/**
 * Hydratable JSX port of `SolidSpectrumButtonDemo` (fixtures/styled.tsx), for the
 * D12 (SSR/hydration) pair-oracle.
 *
 * The live comparison viewer authors every Solid fixture with runtime `solid-js/h`
 * and mounts it client-side via `render()` — a path that cannot SSR (`h` is a
 * client-only DOM runtime). This island is the same Button demo written in real
 * JSX so babel-preset-solid compiles it to `solid-js/web` template calls, which
 * SSR and hydrate. It is rendered as a `client:load` Astro island from a dedicated
 * D12 surface page (`pages/d12/button.astro`), never through the CSR live viewer,
 * so the shared viewer scaffold is untouched.
 *
 * Reactivity model — the recreation pattern proven hydration-safe in
 * packages/solid-spectrum/test/Button.{ssr,hydrate}.test.tsx: `renderedButton` is a
 * createMemo that rebuilds the WHOLE Button subtree when `demoProps` changes, and
 * the label is always wrapped in an explicit `data-rsp-slot="text"` span. We never
 * pass bare reactive text as Button children (that shape does not re-bind — see the
 * hydrate test's documentation assertion).
 */
import { createMemo, createSignal, onCleanup, onMount, type JSX } from "solid-js";
import {
  Button as SolidSpectrumButton,
  Provider as SolidSpectrumProvider,
  createIcon,
} from "@proyecto-viviana/solid-spectrum";
import { s2ButtonText } from "../../../../../../packages/solid-spectrum/src/button/s2-button-styles";
import { pressCallbackLoggers } from "@comparison/data/event-log";
import {
  buttonDemoLocaleFromWindow,
  buttonDemoPropsFromWindow,
  comparisonControlsEvent,
  serializeButtonDemoProps,
  type ButtonDemoProps,
} from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";

// Mirrors the trivial presentation helpers local to fixtures/styled.tsx. Copied
// (not imported) so this compiled-JSX island stays decoupled from that 11k-line
// runtime-`h` module and its whole fixture graph. Keep in sync with styled.tsx.
function explicitStaticColor(staticColor: string | undefined | null) {
  return staticColor === "black" || staticColor === "white" ? staticColor : undefined;
}

function staticColorBackdropClass(staticColor: string | undefined | null, className = "") {
  return [className, explicitStaticColor(staticColor) ? "comparison-static-color-backdrop" : ""]
    .filter(Boolean)
    .join(" ");
}

function staticColorBackdropValue(staticColor: string | undefined | null) {
  return explicitStaticColor(staticColor);
}

const providerShellStyle = {
  padding: "0",
  background: "transparent",
};

const SolidNewIcon = createIcon((props: JSX.SvgSVGAttributes<SVGSVGElement>) => {
  const { class: className, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      {...rest}
      class={className}
    >
      <path
        d="m18,4.25v11.5c0,1.24072-1.00928,2.25-2.25,2.25H4.25c-1.24072,0-2.25-1.00928-2.25-2.25V4.25c0-1.24072,1.00928-2.25,2.25-2.25h11.5c1.24072,0,2.25,1.00928,2.25,2.25Zm-1.5,0c0-.41357-.33643-.75-.75-.75H4.25c-.41357,0-.75.33643-.75.75v11.5c0,.41357.33643.75.75.75h11.5c.41357,0,.75-.33643.75-.75V4.25Z"
        fill="var(--iconPrimary, #222)"
      />
      <path
        d="m13.76318,10c0,.42139-.3418.76318-.76318.76318h-2.23682v2.23682c0,.42139-.3418.76318-.76318.76318s-.76318-.3418-.76318-.76318v-2.23682h-2.23682c-.42139,0-.76318-.3418-.76318-.76318s.3418-.76318.76318-.76318h2.23682v-2.23682c0-.42139.3418-.76318.76318-.76318s.76318.3418.76318.76318v2.23682h2.23682c.42139,0,.76318.3418.76318.76318Z"
        fill="var(--iconPrimary, #222)"
      />
    </svg>
  );
});

export default function SolidButtonIsland() {
  const [actionCount, setActionCount] = createSignal(0);
  const [demoProps, setDemoProps] = createSignal(buttonDemoPropsFromWindow());
  const pressLog = pressCallbackLoggers("button");
  const locale = buttonDemoLocaleFromWindow();
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "button") {
        setDemoProps(event.detail.props as ButtonDemoProps);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedButton = createMemo(() => {
    const props = demoProps();
    const label = () => (
      <span
        class={s2ButtonText({ isProgressVisible: props.isPending })}
        data-rsp-slot="text"
      >
        {props.children}
      </span>
    );
    const children =
      props.iconPlacement === "start"
        ? [<SolidNewIcon aria-hidden="true" />, label()]
        : props.iconPlacement === "only"
          ? [<SolidNewIcon aria-hidden="true" />]
          : [label()];

    return (
      <SolidSpectrumButton
        isDisabled={props.isDisabled}
        isPending={props.isPending}
        variant={props.variant}
        fillStyle={props.fillStyle}
        size={props.size}
        staticColor={props.staticColor}
        aria-label={props.iconPlacement === "only" ? props.children : undefined}
        {...pressLog}
        onPress={(event: unknown) => {
          pressLog.onPress(event as { target?: unknown; pointerType?: string });
          if (!props.isPending) {
            setActionCount((count) => count + 1);
          }
        }}
      >
        {children}
      </SolidSpectrumButton>
    );
  });

  return (
    <SolidSpectrumProvider
      colorScheme={colorScheme()}
      locale={locale}
      background="base"
      style={providerShellStyle}
    >
      <div
        data-comparison-color-scheme={colorScheme()}
        data-comparison-action-count={String(actionCount())}
        data-comparison-control-root="button"
        data-comparison-control-props={serializeButtonDemoProps(demoProps())}
        data-comparison-button-props={serializeButtonDemoProps(demoProps())}
      >
        <div
          class={staticColorBackdropClass(demoProps().staticColor, "comparison-button-row")}
          data-comparison-static-color={staticColorBackdropValue(demoProps().staticColor)}
        >
          {renderedButton()}
        </div>
      </div>
    </SolidSpectrumProvider>
  );
}
