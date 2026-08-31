import { createFileRoute, Link } from "@tanstack/solid-router";
import {
  Badge,
  Button as VivianaButton,
  Flex,
  TextField,
  ToggleSwitch,
  typeRoles,
} from "@proyecto-viviana/ui";
import { Button as KumoButton } from "@proyecto-viviana/kumo";
import "@proyecto-viviana/kumo/styles.css";
import { createSignal, type JSX } from "solid-js";
import { Header, SiteBackdrop } from "@/components";
import {
  ACCENT_INK,
  CtaButton,
  FeatureBlock,
  FONT_BODY,
  FONT_DISPLAY,
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
        "An open Solid UI experiment: one shared headless foundation, two published styled libraries, and an early Cloudflare Kumo Button study.",
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
          the other two.
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
            @proyecto-viviana/kumo <span>experiment</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

function KumoExperiment() {
  const [activationCount, setActivationCount] = createSignal(0);
  const { theme } = useTheme();

  return (
    <section class="pv-kumo-lab" aria-labelledby="kumo-lab-title">
      <div class="pv-kumo-lab__copy">
        <span class="pv-kumo-lab__eyebrow">Early study · @cloudflare/kumo@2.11.0</span>
        <h2 id="kumo-lab-title">A Kumo-shaped Button, running on the shared Solid foundation.</h2>
        <p>
          This is one experimental component, not a complete Kumo port. Its API and styling are
          still rough. Browser behavior evidence and visual-state evidence are incomplete.
        </p>
        <ul>
          <li>One Button only</li>
          <li>Not published to npm</li>
          <li>Not ported or certified</li>
        </ul>
        <div class="pv-kumo-lab__links">
          <a href={repoPackageUrl("kumo")} target="_blank" rel="noopener noreferrer">
            Source
          </a>
          <a
            href={repoUrl("blob/main/packages/kumo/README.md#evidence-and-limits")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Limits
          </a>
          <a
            href={repoUrl("tree/main/apps/comparison/src/pages/experiments/kumo-button")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pair harness
          </a>
        </div>
      </div>
      <div
        class="pv-kumo-lab__specimen"
        data-theme="kumo"
        data-mode={theme()}
        aria-label="Interactive Kumo Button specimen"
      >
        <span class="pv-kumo-lab__specimen-label">Live Solid component</span>
        <KumoButton
          variant="primary"
          size="lg"
          onClick={() => setActivationCount((count) => count + 1)}
        >
          Deploy experiment
        </KumoButton>
        <output aria-live="polite" data-kumo-landing-output>
          Activated {activationCount()} times
        </output>
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
          <PillTag>One Solid foundation · Three styled libraries</PillTag>
          <h1>
            A Solid UI stack, <span>out in the open</span>.
          </h1>
          <p>
            Proyecto Viviana is an ongoing experiment in translating established UI systems to
            Solid. Some surfaces are useful today. Every parity claim still has to earn evidence.
            Expect unfinished APIs and rough edges.
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
            <SectionLabel>Styled siblings</SectionLabel>
            <h2 id="libraries-title">Three distinct public APIs. Unequal maturity.</h2>
            <p>
              The libraries share lower-level behavior, but they do not pretend to have the same
              scope or evidence. The labels below are deliberately specific.
            </p>
          </div>
          <div class="pv-registers">
            <RegisterCard
              name="@proyecto-viviana/ui"
              status="Published · Viviana register"
              blurb="Proyecto Viviana’s expressive component library. It has its own visual language, public API, showcase, and package release."
              install="@proyecto-viviana/ui"
              links={[{ href: "/showcase", label: "Open showcase →" }]}
            />
            <RegisterCard
              name="@proyecto-viviana/solid-spectrum"
              status="Published · Spectrum 2 register"
              blurb="A component-by-component Solid translation of Adobe React Spectrum S2. Evidence is tracked per component; the whole package is not certified as one unit."
              install="@proyecto-viviana/solid-spectrum"
              links={[{ href: "/solid-spectrum/docs", label: "Read docs →" }]}
            />
            <RegisterCard
              name="@proyecto-viviana/kumo"
              status="Unpublished · one Button"
              blurb="An early Cloudflare Kumo-shaped styled sibling. It currently tests one Button API on the shared headless layer. Treat it as a study, not a port."
              experimental
              links={[
                { href: "#kumo-experiment", label: "Try the specimen ↓" },
                { href: repoPackageUrl("kumo"), label: "View source ↗", external: true },
              ]}
            />
          </div>
        </section>

        <ArchitectureMap />

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

        <section class="pv-card pv-viviana-sample" aria-labelledby="viviana-sample-title">
          <div class="pv-section-heading pv-section-heading--compact">
            <SectionLabel>Published Viviana UI sample</SectionLabel>
            <h2 id="viviana-sample-title">The house register, live.</h2>
          </div>
          <Flex wrap alignItems="center" gap={6}>
            <Flex wrap alignItems="center" gap={3}>
              <VivianaButton variant="primary">Primary</VivianaButton>
              <VivianaButton variant="accent">Accent</VivianaButton>
              <Badge count={3} variant="success" />
              <Badge count={7} variant="accent" />
            </Flex>
            <Flex direction="column" gap={3} style={{ width: "100%", "max-width": "20rem" }}>
              <TextField label="Email" placeholder="you@example.com" />
              <ToggleSwitch defaultSelected>Notifications</ToggleSwitch>
            </Flex>
          </Flex>
        </section>

        <div id="kumo-experiment">
          <KumoExperiment />
        </div>

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
