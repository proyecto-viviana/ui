/* Shared showcase chrome: the sticky glass top bar (brand, panel nav, theme
   wipe) and the panel/demo scaffolding every showcase route composes. All
   paint comes from the `gls-*` classes in styles/glasselated.css, which in
   turn use only register tokens. */
import { For, type JSX } from "solid-js";
import { Link, useLocation, useNavigate } from "@tanstack/solid-router";
import { ActionButton } from "@proyecto-viviana/ui";
import ContrastIcon from "@proyecto-viviana/ui/ContrastIcon";
import { dualWipe } from "@/lib/glasselated";
import { useTheme } from "@/utils/theme";
import { glasselatedRoot } from "./GlasselatedShell";
import { PANELS, type PanelDef } from "./registry";

/* The nav is a scrolling tab strip on wide desktop; below --gls-nav-collapse
   (see glasselated.css) CSS swaps it for the select below, which is the only
   one that reads well once the strip would have to scroll on a small screen. */

export function ShowcaseTopbar(): JSX.Element {
  const { toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const wipeTheme = (): void => {
    dualWipe(glasselatedRoot() ?? null, { onCovered: toggleTheme });
  };

  /* The trailing segment of /showcase/<slug>; "" on the /showcase index. */
  const currentSlug = (): string => {
    const rest = location().pathname.replace(/^\/showcase\/?/, "").replace(/\/$/, "");
    return rest;
  };

  return (
    <header class="gls-topbar">
      <Link to="/" class="gls-back" aria-label="Back to the main site">
        ← Site
      </Link>
      <Link to="/showcase" class="gls-brand">
        Viviana UI
      </Link>
      <nav class="gls-topbar-nav" aria-label="Showcase panels">
        <For each={PANELS}>
          {(panel) => (
            <Link to={`/showcase/${panel.slug}` as "/showcase"} class="gls-navlink">
              {panel.num} {panel.title}
            </Link>
          )}
        </For>
        {/* Not a numbered component panel — the spec ∥ viviana-ui side-by-side. */}
        <Link to={"/showcase/parity" as "/showcase"} class="gls-navlink">
          ≡≡ Parity
        </Link>
      </nav>
      {/* Narrow-width equivalent of the tab strip above — same order, one control. */}
      <select
        class="gls-nav-select"
        aria-label="Showcase panels"
        value={currentSlug()}
        onChange={(e) => navigate({ to: `/showcase/${e.currentTarget.value}` })}
      >
        <For each={PANELS}>
          {(panel) => (
            <option value={panel.slug}>
              {panel.num} {panel.title}
            </option>
          )}
        </For>
        <option value="parity">≡≡ Parity</option>
      </select>
      <ActionButton isQuiet aria-label="Toggle color scheme" onPress={wipeTheme}>
        <ContrastIcon />
      </ActionButton>
    </header>
  );
}

/** One numbered showcase panel section. */
export function Panel(props: {
  readonly def: PanelDef;
  readonly children: JSX.Element;
}): JSX.Element {
  return (
    <section class="gls-panel" aria-labelledby={`panel-${props.def.slug}`}>
      <div class="gls-panel-head">
        <span class="gls-panel-num">{props.def.num}</span>
        <h2 class="gls-panel-title" id={`panel-${props.def.slug}`}>
          {props.def.title}
        </h2>
        <p class="gls-panel-blurb">{props.def.blurb}</p>
      </div>
      {props.children}
    </section>
  );
}

/** A labeled demo cluster inside a panel. */
export function Demo(props: { readonly label: string; readonly children: JSX.Element }): JSX.Element {
  return (
    <div class="gls-demo">
      <span class="gls-demo-label">{props.label}</span>
      {props.children}
    </div>
  );
}

/** A wrapping flex row of controls. */
export function Row(props: { readonly children: JSX.Element }): JSX.Element {
  return <div class="gls-row">{props.children}</div>;
}
