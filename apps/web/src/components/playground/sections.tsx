import { For, Show, type Accessor, type JSX } from "solid-js";
import { Button, Flex, Heading, Text, ToggleButton, typeRoles } from "@proyecto-viviana/ui";
import { SECTION_IDS, SECTION_NAMES, type SectionId } from "./section-data";

export { SECTION_IDS, SECTION_NAMES };
export type { SectionId };

// Surfaces are described with the design system's own tokens rather than a local utility
// vocabulary, so they track the register instead of a frozen copy of it.
const panel: JSX.CSSProperties = {
  "margin-bottom": "32px",
  background: "var(--color-bg-300)",
  border: "1px solid var(--border-subtle)",
  "border-radius": "var(--radius-xl)",
  overflow: "hidden",
};

const panelHeader: JSX.CSSProperties = {
  padding: "16px",
  "border-bottom": "1px solid var(--border-subtle)",
  background: "var(--color-bg-400)",
};

interface SectionControlPanelProps {
  visibleSections: Accessor<Set<SectionId>>;
  setVisibleSections: (fn: (prev: Set<SectionId>) => Set<SectionId>) => void;
}

export function SectionControlPanel(props: SectionControlPanelProps) {
  const toggle = (id: SectionId) => {
    props.setVisibleSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const showAll = () => {
    props.setVisibleSections(() => new Set(SECTION_IDS));
  };

  const hideAll = () => {
    props.setVisibleSections(() => new Set());
  };

  const jumpToSection = (id: SectionId) => {
    if (!props.visibleSections().has(id)) {
      toggle(id);
    }
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div style={panel}>
      <div style={panelHeader}>
        <Flex alignItems="center" justifyContent="between" gap={3}>
          <div>
            <Heading level={3}>Component Sections</Heading>
            <Text styles={typeRoles.meta} data-testid="visible-section-count">
              {props.visibleSections().size} of {SECTION_IDS.length} visible
            </Text>
          </div>
          <Flex gap={2}>
            <Button variant="accent" size="S" onPress={showAll} data-testid="show-all-sections">
              Show All
            </Button>
            <Button variant="secondary" size="S" onPress={hideAll} data-testid="hide-all-sections">
              Hide All
            </Button>
          </Flex>
        </Flex>
      </div>

      <div style={{ padding: "16px" }}>
        <Flex wrap gap={2}>
          <For each={SECTION_IDS}>
            {(id) => (
              <ToggleButton
                size="S"
                isEmphasized
                isSelected={props.visibleSections().has(id)}
                onChange={() => jumpToSection(id)}
                data-testid={`section-toggle-${id}`}
              >
                {SECTION_NAMES[id]}
              </ToggleButton>
            )}
          </For>
        </Flex>
      </div>
    </div>
  );
}

interface SectionProps {
  id: SectionId;
  title: string;
  description: string;
  children: JSX.Element;
  /** Span the full width of the section grid rather than a single column. */
  wide?: boolean;
  visibleSections: Accessor<Set<SectionId>>;
}

/* The card chrome here used to be three `vui-feature-card*` classes that no stylesheet in
 * the repo ever defined — not the app's, not any package's, not the built output — so every
 * section on this page rendered as a bare unstyled <section>. The surface is now built from
 * the design system's tokens and type roles, which is what those classes were reaching for. */
export function Section(props: SectionProps) {
  return (
    <Show when={props.visibleSections().has(props.id)}>
      <section
        id={props.id}
        style={{
          background: "var(--color-bg-300)",
          border: "1px solid var(--border-subtle)",
          "border-radius": "var(--radius-xl)",
          padding: "20px",
          ...(props.wide ? { "grid-column": "1 / -1" } : {}),
        }}
        data-testid={`section-${props.id}`}
      >
        <Heading level={3}>{props.title}</Heading>
        <Text styles={typeRoles.meta}>{props.description}</Text>
        <div style={{ "margin-top": "16px" }}>{props.children}</div>
      </section>
    </Show>
  );
}
