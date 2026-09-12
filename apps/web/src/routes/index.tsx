import { createFileRoute } from "@tanstack/solid-router";
import {
  Badge as VivianaBadge,
  Button as VivianaButton,
  TextField,
  ToggleSwitch,
  typeRoles,
} from "@proyecto-viviana/ui";
import { Badge as SpectrumBadge, Button as SpectrumButton } from "@proyecto-viviana/solid-spectrum";
import { Provider as SpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
import { Button as GeistButton } from "@proyecto-viviana/geist";
import "@proyecto-viviana/geist/styles.css";
import { Button as KumoButton } from "@proyecto-viviana/kumo";
import "@proyecto-viviana/kumo/styles.css";
import { createSignal, Show, type JSX } from "solid-js";
import { Header, SiteBackdrop } from "@/components";
import {
  CtaButton,
  FeatureBlock,
  PillTag,
  SectionLabel,
  SiteFooter,
} from "@/components/theme/primitives";
import "@/components/theme/studio.css";
import { repoPackageUrl, repoUrl } from "@/lib/site";
import { seo } from "@/seo";
import { useTheme } from "@/utils/theme";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Proyecto Viviana",
      description:
        "An open Solid UI stack: one shared headless foundation, two published styled libraries, and experimental Geist and Kumo Button studies.",
      path: "/",
    }),
  component: LandingPage,
});

interface RegisterLink {
  href: string;
  label: string;
  external?: boolean;
}

function RegisterCard(props: {
  name: string;
  status: string;
  blurb: string;
  install?: string;
  links: RegisterLink[];
  experimental?: boolean;
}) {
  return (
    <article class="pv-card pv-register-card" data-experimental={props.experimental || undefined}>
      <div class="pv-register-card__heading">
        <h3>{props.name}</h3>
        <span class="pv-register-card__status">{props.status}</span>
      </div>
      <p>{props.blurb}</p>
      <div class="pv-register-card__footer">
        {props.install ? (
          <a
            href={`https://www.npmjs.com/package/${props.install}`}
            target="_blank"
            rel="noopener noreferrer"
            class={typeRoles.terminal}
          >
            npm i {props.install}
          </a>
        ) : (
          <span class="pv-register-card__unpublished">Not published to npm</span>
        )}
        <div class="pv-register-card__links">
          {props.links.map((link) => (
            <CtaButton href={link.href} external={link.external} tone="secondary">
              {link.label}
            </CtaButton>
          ))}
        </div>
      </div>
    </article>
  );
}

function ArchitectureMap() {
  return (
    <section class="pv-architecture" aria-labelledby="architecture-title">
      <div class="pv-architecture__copy">
        <SectionLabel>Architecture</SectionLabel>
        <h2 id="architecture-title">Share behavior. Keep each styled library independent.</h2>
        <p>
          State, accessibility, keyboard behavior, and composition live in the lower packages. Each
          styled sibling owns its public API, theme, and release. You can use one without installing
          the other three.
        </p>
      </div>
      <div class="pv-architecture__map" aria-label="Proyecto Viviana package layers">
        <ol class="pv-architecture__foundation">
          <li>solid-stately</li>
          <li>solidaria</li>
          <li>solidaria-components</li>
        </ol>
        <ul class="pv-architecture__branches">
          <li>@proyecto-viviana/ui</li>
          <li>@proyecto-viviana/solid-spectrum</li>
          <li data-experimental="true">
            @proyecto-viviana/geist <span>experiment</span>
          </li>
          <li data-experimental="true">
            @proyecto-viviana/kumo <span>experiment</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

type RegisterKey = "viviana" | "spectrum" | "geist" | "kumo";

function SpecimenDeck() {
  const { theme } = useTheme();
  const [activeRegister, setActiveRegister] = createSignal<RegisterKey>("viviana");
  const [overrideMode, setOverrideMode] = createSignal<"auto" | "light" | "dark">("auto");
  const [count, setCount] = createSignal(0);
  const [textValue, setTextValue] = createSignal("");

  const effectiveMode = () => (overrideMode() === "auto" ? theme() : overrideMode());

  const registerTitles: Record<RegisterKey, string> = {
    viviana: "@proyecto-viviana/ui · Glasselated design register (published)",
    spectrum: "@proyecto-viviana/solid-spectrum · Spectrum 2 register (2,118 certified checks)",
    geist: "@proyecto-viviana/geist · Vercel Geist study (unpublished)",
    kumo: "@proyecto-viviana/kumo · Cloudflare Kumo button study (unpublished)",
  };

  return (
    <section class="pv-specimen-section" aria-labelledby="specimen-deck-title">
      <div class="pv-section-heading pv-section-heading--compact">
        <SectionLabel>Interactive specimen</SectionLabel>
        <h2 id="specimen-deck-title">One reactive state. Four visual registers.</h2>
        <p>
          Switch between design systems in real time. Shared reactive Solid signals (counter and
          input) persist uninterrupted across register boundaries.
        </p>
      </div>

      <div class="pv-frame">
        <div class="pv-frame__bar">
          <div class="pv-frame__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span class="pv-frame__title">{registerTitles[activeRegister()]}</span>

          <div class="pv-frame__seg" role="group" aria-label="Register switcher">
            <button
              type="button"
              data-active={activeRegister() === "viviana" ? "true" : "false"}
              onClick={() => setActiveRegister("viviana")}
            >
              Viviana UI
            </button>
            <button
              type="button"
              data-active={activeRegister() === "spectrum" ? "true" : "false"}
              onClick={() => setActiveRegister("spectrum")}
            >
              Spectrum S2
            </button>
            <button
              type="button"
              data-active={activeRegister() === "geist" ? "true" : "false"}
              onClick={() => setActiveRegister("geist")}
            >
              Geist
            </button>
            <button
              type="button"
              data-active={activeRegister() === "kumo" ? "true" : "false"}
              onClick={() => setActiveRegister("kumo")}
            >
              Kumo
            </button>
          </div>

          <div class="pv-frame__seg" role="group" aria-label="Mode switcher">
            <button
              type="button"
              data-active={effectiveMode() === "light" ? "true" : "false"}
              onClick={() => setOverrideMode("light")}
            >
              Light
            </button>
            <button
              type="button"
              data-active={effectiveMode() === "dark" ? "true" : "false"}
              onClick={() => setOverrideMode("dark")}
            >
              Dark
            </button>
          </div>
        </div>

        <div class="pv-frame__canvas" data-mode={effectiveMode()} data-theme={activeRegister()}>
          <div class="pv-specimen-deck">
            <Show when={activeRegister() === "viviana"}>
              <div class="pv-specimen-deck__panel">
                <div class="pv-specimen-deck__row">
                  <VivianaButton variant="primary" onClick={() => setCount((c) => c + 1)}>
                    Increment ({count()})
                  </VivianaButton>
                  <VivianaButton variant="accent" onClick={() => setCount(0)}>
                    Reset
                  </VivianaButton>
                  <VivianaBadge count={count()} variant="success" />
                  <VivianaBadge count={count() * 2} variant="accent" />
                </div>
                <div class="pv-specimen-deck__controls">
                  <TextField
                    label="Reactive input"
                    placeholder="Type signal value..."
                    value={textValue()}
                    onChange={setTextValue}
                  />
                  <ToggleSwitch defaultSelected>Haptic feedback</ToggleSwitch>
                </div>
              </div>
            </Show>

            <Show when={activeRegister() === "spectrum"}>
              <SpectrumProvider colorScheme={effectiveMode() as "light" | "dark"}>
                <div class="pv-specimen-deck__panel">
                  <div class="pv-specimen-deck__row">
                    <SpectrumButton variant="accent" onPress={() => setCount((c) => c + 1)}>
                      Increment ({count()})
                    </SpectrumButton>
                    <SpectrumButton variant="primary" onPress={() => setCount(0)}>
                      Reset
                    </SpectrumButton>
                    <SpectrumBadge variant="informative">Count: {count()}</SpectrumBadge>
                  </div>
                  <div class="pv-specimen-deck__status">
                    Adobe React Spectrum S2 translation · 2,118 certified parity checks
                  </div>
                </div>
              </SpectrumProvider>
            </Show>

            <Show when={activeRegister() === "geist"}>
              <div class="pv-specimen-deck__panel" data-theme="geist" data-mode={effectiveMode()}>
                <div class="pv-specimen-deck__row">
                  <GeistButton
                    variant="default"
                    size="medium"
                    onClick={() => setCount((c) => c + 1)}
                  >
                    Deploy to production ({count()})
                  </GeistButton>
                  <GeistButton variant="secondary" size="medium" onClick={() => setCount(0)}>
                    Reset
                  </GeistButton>
                </div>
                <div class="pv-specimen-deck__status">
                  Vercel Geist study · Single component · Monospace micro-typography
                </div>
              </div>
            </Show>

            <Show when={activeRegister() === "kumo"}>
              <div class="pv-specimen-deck__panel" data-theme="kumo" data-mode={effectiveMode()}>
                <div class="pv-specimen-deck__row">
                  <KumoButton variant="primary" size="lg" onClick={() => setCount((c) => c + 1)}>
                    Deploy experiment ({count()})
                  </KumoButton>
                  <KumoButton variant="secondary" size="lg" onClick={() => setCount(0)}>
                    Reset
                  </KumoButton>
                </div>
                <output
                  aria-live="polite"
                  data-kumo-landing-output
                  class="pv-specimen-deck__status"
                >
                  Activated {count()} times
                </output>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingPage(): JSX.Element {
  return (
    <div class="pv-landing-shell">
      <SiteBackdrop variant="scene" />
      <Header />

      <main id="main-content" class="pv-wrap pv-wrap--narrow pv-landing-main">
        <section class="pv-hero pv-landing-hero">
          <PillTag>One Solid foundation · Multi-register design system</PillTag>
          <h1>
            A Solid UI stack, <span>out in the open</span>.
          </h1>
          <p>
            Proyecto Viviana is an ongoing architecture in translating established UI systems to
            Solid. Production surfaces run on npm today. Every parity claim earns runnable evidence.
            Expect clear boundaries between certified libraries and early studies.
          </p>
          <div class="pv-landing-hero__actions">
            <CtaButton href="#libraries" tone="primary">
              See the libraries ↓
            </CtaButton>
            <CtaButton
              href={repoUrl("blob/main/.claude/current/certification.md")}
              external
              tone="secondary"
            >
              Read the evidence bar ↗
            </CtaButton>
          </div>
        </section>

        <section id="libraries" class="pv-library-section" aria-labelledby="libraries-title">
          <div class="pv-section-heading">
            <SectionLabel>Published Flagships</SectionLabel>
            <h2 id="libraries-title">Two production-grade styled libraries on npm.</h2>
            <p>
              Certified component libraries built for real application development. Independent
              releases, dedicated documentation, and exhaustive test suites.
            </p>
          </div>
          <div class="pv-registers">
            <RegisterCard
              name="@proyecto-viviana/ui"
              status="Published · Viviana register"
              blurb="Proyecto Viviana’s expressive component library. It has its own visual language, public API, showcase, and package release."
              install="@proyecto-viviana/ui"
              links={[{ href: "/viviana-ui/docs", label: "Read docs →" }]}
            />
            <RegisterCard
              name="@proyecto-viviana/solid-spectrum"
              status="Published · Spectrum 2 register"
              blurb="A component-by-component Solid translation of Adobe React Spectrum S2. Parity is certified per component across 2,118 test checks."
              install="@proyecto-viviana/solid-spectrum"
              links={[{ href: "/solid-spectrum/docs", label: "Read docs →" }]}
            />
          </div>
        </section>

        <ArchitectureMap />

        <SpecimenDeck />

        <section class="pv-features pv-landing-features">
          <FeatureBlock title="Shared behavior">
            State belongs in solid-stately. ARIA, keyboard, and focus behavior belong in solidaria.
            Component composition belongs in solidaria-components.
          </FeatureBlock>
          <FeatureBlock title="Evidence before labels">
            A rendered export or a green axe run is only a floor. A component earns a parity label
            when its observable upstream branches have regression evidence.
          </FeatureBlock>
          <FeatureBlock title="Independent paint">
            Each styled sibling owns its design-system API and theme. The site can show them
            together, but one library must not leak tokens or styles into another.
          </FeatureBlock>
        </section>

        <section
          id="experiments"
          class="pv-experiments-section"
          aria-labelledby="experiments-title"
        >
          <div class="pv-section-heading">
            <SectionLabel>Experiments & Studies</SectionLabel>
            <h2 id="experiments-title">Early exploratory studies on the shared foundation.</h2>
            <p>
              Explorations testing whether foreign design system APIs map cleanly onto our headless
              architecture. Single-component prototypes, not full ports or npm releases.
            </p>
          </div>

          <div class="pv-experiments">
            <article class="pv-experiment-card">
              <span class="pv-experiment-card__eyebrow">
                Early study · Vercel Geist translation
              </span>
              <div class="pv-experiment-card__heading">
                <h3>@proyecto-viviana/geist</h3>
                <span class="pv-register-card__status">Unpublished · 1-Button study</span>
              </div>
              <p>
                Tests Vercel Geist design system tokens, button variants, and monospace
                micro-typography on Solid. Treat it as a design study, not a port.
              </p>
              <ul class="pv-experiment-card__meta">
                <li>One Button only</li>
                <li>Not published to npm</li>
                <li>Study in progress</li>
              </ul>
              <div class="pv-experiment-card__footer">
                <span class="pv-register-card__unpublished">Not published to npm</span>
                <div class="pv-experiment-card__links">
                  <a href={repoPackageUrl("geist")} target="_blank" rel="noopener noreferrer">
                    Source ↗
                  </a>
                  <a
                    href={repoUrl("blob/main/packages/geist/README.md")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Button spec ↗
                  </a>
                </div>
              </div>
            </article>

            <article class="pv-experiment-card">
              <span class="pv-experiment-card__eyebrow">Early study · @cloudflare/kumo@2.11.0</span>
              <div class="pv-experiment-card__heading">
                <h3>@proyecto-viviana/kumo</h3>
                <span class="pv-register-card__status">Unpublished · 1-Button study</span>
              </div>
              <p>
                This is one experimental component, not a complete Kumo port. Tests Cloudflare Kumo
                design tokens and Button variants on the shared Solid foundation.
              </p>
              <ul class="pv-experiment-card__meta">
                <li>One Button only</li>
                <li>Not published to npm</li>
                <li>Not ported or certified</li>
              </ul>
              <div class="pv-experiment-card__footer">
                <span class="pv-register-card__unpublished">Not published to npm</span>
                <div class="pv-experiment-card__links">
                  <a href={repoPackageUrl("kumo")} target="_blank" rel="noopener noreferrer">
                    Source ↗
                  </a>
                  <a
                    href={repoUrl("blob/main/packages/kumo/README.md#evidence-and-limits")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Limits ↗
                  </a>
                  <a
                    href={repoUrl("tree/main/apps/comparison/src/pages/experiments/kumo-button")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Pair harness ↗
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="pv-landing-closing">
          <span class="pv-landing-closing__mark" aria-hidden="true">
            ↳
          </span>
          <div>
            <h2>Follow the experiment, including what fails.</h2>
            <p>
              The repository contains the source, tests, comparison harness, known gaps, and live
              decisions. Claims should get narrower or stronger as that evidence changes.
            </p>
          </div>
          <CtaButton href={repoUrl("tree/main/.claude/current")} external tone="primary">
            Open the working record ↗
          </CtaButton>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
