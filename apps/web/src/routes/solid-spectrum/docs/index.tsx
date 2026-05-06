import { Link, createFileRoute } from "@tanstack/solid-router";
import { Button } from "@proyecto-viviana/solid-spectrum";
import { useThemeColors } from "@/utils/theme";

export const Route = createFileRoute("/solid-spectrum/docs/")({
  component: GettingStartedPage,
});

const FONT_TITLE = "'Jost', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

function GettingStartedPage() {
  const getColors = useThemeColors();
  const colors = () => getColors();

  return (
    <div style={{ "line-height": "1.6", "font-size": "14px", color: colors().textSecondary }}>
      <h1
        style={{
          "font-family": FONT_TITLE,
          "font-size": "20px",
          "font-weight": "600",
          margin: "0 0 16px 0",
          "padding-bottom": "10px",
          "padding-left": "12px",
          "border-left": `3px solid ${colors().pink}`,
          "border-bottom": `1px solid ${colors().pink}40`,
          "letter-spacing": "-0.01em",
          color: colors().text,
          filter: `drop-shadow(0 0 4px ${colors().pinkGlow})`,
        }}
      >
        Getting Started
      </h1>

      <p style={{ "margin-bottom": "1.5rem", "max-width": "60ch" }}>
        Proyecto Viviana is a SolidJS component library inspired by Adobe's React Spectrum. It
        provides accessible, high-quality UI components built on top of solidaria — a port of React
        Aria for SolidJS.
      </p>

      <SectionHeading color={colors().blue}>Features</SectionHeading>

      <ul style={{ "padding-left": "1.25rem", "margin-bottom": "1.5rem" }}>
        <li style={{ "margin-bottom": "0.375rem" }}>
          <strong style={{ color: colors().text }}>Accessible by default</strong> — Built on
          WAI-ARIA patterns with full keyboard navigation
        </li>
        <li style={{ "margin-bottom": "0.375rem" }}>
          <strong style={{ color: colors().text }}>60+ Components</strong> — From buttons to data
          tables, calendars to color pickers
        </li>
        <li style={{ "margin-bottom": "0.375rem" }}>
          <strong style={{ color: colors().text }}>100+ ARIA Hooks</strong> — Low-level hooks for
          building custom accessible components
        </li>
        <li style={{ "margin-bottom": "0.375rem" }}>
          <strong style={{ color: colors().text }}>SSR Compatible</strong> — Works with TanStack
          Start and other SSR frameworks
        </li>
        <li style={{ "margin-bottom": "0.375rem" }}>
          <strong style={{ color: colors().text }}>Tailwind CSS v4</strong> — Modern styling with
          CSS variables
        </li>
      </ul>

      <SectionHeading color={colors().blue}>Quick Example</SectionHeading>

      <p style={{ "margin-bottom": "0.75rem" }}>Here's a simple button component in action:</p>

      <div
        style={{
          margin: "0.75rem 0",
          display: "flex",
          gap: "12px",
          padding: "1.25rem",
          background: colors().surfaceElevated,
          border: `1px solid ${colors().muted}`,
          "border-top": `2px solid ${colors().pink}`,
        }}
      >
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">Accent</Button>
      </div>

      <pre
        style={{
          background: colors().surface,
          color: colors().text,
          padding: "12px 14px",
          "overflow-x": "auto",
          margin: "0.75rem 0",
          "font-family": FONT_MONO,
          "font-size": "12px",
          border: `1px solid ${colors().muted}`,
          "border-left": `3px solid ${colors().blue}`,
        }}
      >
        <code>{`import { Button } from '@proyecto-viviana/solid-spectrum';

function App() {
  const [pressed, setPressed] = createSignal(false);

  return (
    <Button onPress={() => setPressed(true)}>
      {pressed() ? 'Pressed' : 'Click me'}
    </Button>
  );
}`}</code>
      </pre>

      <SectionHeading color={colors().blue}>Package Architecture</SectionHeading>

      <p style={{ "margin-bottom": "0.75rem" }}>The library is organized into four packages:</p>

      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          gap: "0",
          margin: "0.75rem 0",
          border: `1px solid ${colors().muted}`,
          background: colors().surface,
        }}
      >
        <ArchRow
          name="@proyecto-viviana/solid-stately"
          desc="State management hooks (createToggleState, createListState, etc.)"
          color={colors().pink}
          border={colors().muted}
        />
        <ArchRow
          name="@proyecto-viviana/solidaria"
          desc="ARIA hooks for accessibility (createButton, createMenu, etc.)"
          color={colors().blue}
          border={colors().muted}
        />
        <ArchRow
          name="@proyecto-viviana/solidaria-components"
          desc="Headless components with render props (Button, Menu, Dialog, etc.)"
          color={colors().pink}
          border={colors().muted}
        />
        <ArchRow
          name="@proyecto-viviana/solid-spectrum"
          desc="Styled components ready to use (Button, Select, Table, etc.)"
          color={colors().blue}
          border={colors().muted}
        />
      </div>

      <SectionHeading color={colors().blue}>Next Steps</SectionHeading>

      <ul style={{ "padding-left": "1.25rem", "margin-bottom": "1.5rem" }}>
        <li style={{ "margin-bottom": "0.375rem" }}>
          <Link
            to="/solid-spectrum/docs/installation"
            style={{ color: colors().blue, "text-decoration": "none", "font-weight": "500" }}
          >
            Installation
          </Link>{" "}
          — Set up the packages in your project
        </li>
        <li style={{ "margin-bottom": "0.375rem" }}>
          <Link
            to="/solid-spectrum/docs/components/button"
            style={{ color: colors().blue, "text-decoration": "none", "font-weight": "500" }}
          >
            Components
          </Link>{" "}
          — Explore the component library
        </li>
        <li style={{ "margin-bottom": "0.375rem" }}>
          <Link
            to="/solid-spectrum/docs/hooks/create-button"
            style={{ color: colors().blue, "text-decoration": "none", "font-weight": "500" }}
          >
            Hooks
          </Link>{" "}
          — Build custom components with ARIA hooks
        </li>
      </ul>
    </div>
  );
}

function SectionHeading(props: { color: string; children: string }) {
  return (
    <h2
      style={{
        "font-family": FONT_TITLE,
        "font-size": "15px",
        "font-weight": "600",
        margin: "2rem 0 0.75rem 0",
        "padding-left": "10px",
        "border-left": `2px solid ${props.color}`,
        color: "var(--color-primary-100)",
      }}
    >
      {props.children}
    </h2>
  );
}

function ArchRow(props: { name: string; desc: string; color: string; border: string }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        "border-bottom": `1px solid ${props.border}`,
        "border-left": `3px solid ${props.color}`,
      }}
    >
      <div
        style={{
          "font-family": FONT_MONO,
          "font-size": "12px",
          "font-weight": "600",
          color: props.color,
          "margin-bottom": "2px",
        }}
      >
        {props.name}
      </div>
      <div style={{ "font-size": "13px" }}>{props.desc}</div>
    </div>
  );
}
