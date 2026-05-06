import { type JSX, For, Show } from "solid-js";
import { useThemeColors } from "@/utils/theme";

export interface PropDefinition {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface DocPageProps {
  title: string;
  description: string;
  importCode: string;
  children?: JSX.Element;
}

const FONT_TITLE = "'Jost', system-ui, sans-serif";
const FONT_BODY = "'Sen', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

export function DocPage(props: DocPageProps) {
  const getColors = useThemeColors();
  const colors = () => getColors();

  return (
    <div style={{ "line-height": "1.6", "font-size": "14px", color: colors().textSecondary }}>
      {/* Title — pink left-border accent with glow */}
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
        {props.title}
      </h1>

      <p style={{ "margin-bottom": "1.5rem", "max-width": "60ch" }}>{props.description}</p>

      {/* Import — code block with blue left-border */}
      <h2
        style={{
          "font-family": FONT_TITLE,
          "font-size": "15px",
          "font-weight": "600",
          margin: "2rem 0 0.75rem 0",
          "padding-left": "10px",
          "border-left": `2px solid ${colors().blue}`,
          color: colors().text,
        }}
      >
        Import
      </h2>
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
        <code>{props.importCode}</code>
      </pre>

      {props.children}
    </div>
  );
}

export interface ExampleProps {
  title: string;
  description?: string;
  code: string;
  children: JSX.Element;
}

export function Example(props: ExampleProps) {
  const getColors = useThemeColors();
  const colors = () => getColors();

  return (
    <section style={{ "margin-top": "2rem" }}>
      {/* Section heading — blue left-border */}
      <h2
        style={{
          "font-family": FONT_TITLE,
          "font-size": "15px",
          "font-weight": "600",
          margin: "0 0 0.75rem 0",
          "padding-left": "10px",
          "border-left": `2px solid ${colors().blue}`,
          color: colors().text,
        }}
      >
        {props.title}
      </h2>
      <Show when={props.description}>
        <p style={{ "margin-bottom": "0.75rem" }}>{props.description}</p>
      </Show>

      {/* Live preview — angular, pink top-border */}
      <div
        class="not-prose"
        style={{
          margin: "0.75rem 0",
          padding: "1.25rem",
          background: colors().surfaceElevated,
          border: `1px solid ${colors().muted}`,
          "border-top": `2px solid ${colors().pink}`,
        }}
      >
        {props.children}
      </div>

      {/* Code block — blue left-border */}
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
        <code>{props.code}</code>
      </pre>
    </section>
  );
}

export interface PropsTableProps {
  props: PropDefinition[];
}

export function PropsTable(props: PropsTableProps) {
  const getColors = useThemeColors();
  const colors = () => getColors();

  return (
    <section style={{ "margin-top": "2rem" }}>
      <h2
        style={{
          "font-family": FONT_TITLE,
          "font-size": "15px",
          "font-weight": "600",
          margin: "0 0 0.75rem 0",
          "padding-left": "10px",
          "border-left": `2px solid ${colors().blue}`,
          color: colors().text,
        }}
      >
        Props
      </h2>
      <div
        class="not-prose"
        style={{
          margin: "0.75rem 0",
          "overflow-x": "auto",
          border: `1px solid ${colors().muted}`,
          background: colors().surface,
        }}
      >
        <table style={{ width: "100%", "font-size": "13px", "border-collapse": "collapse" }}>
          <thead>
            <tr style={{ "border-bottom": `1px solid ${colors().muted}` }}>
              {["Prop", "Type", "Default", "Description"].map((h) => (
                <th
                  style={{
                    padding: "8px 12px",
                    "text-align": "left",
                    "font-weight": "600",
                    "font-family": FONT_TITLE,
                    "font-size": "10px",
                    "text-transform": "uppercase",
                    "letter-spacing": "0.1em",
                    color: colors().pink,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <For each={props.props}>
              {(prop) => (
                <tr style={{ "border-bottom": `1px solid ${colors().muted}` }}>
                  <td style={{ padding: "8px 12px" }}>
                    <code
                      style={{
                        background: `${colors().blue}15`,
                        color: colors().blue,
                        padding: "2px 6px",
                        "font-family": FONT_MONO,
                        "font-size": "12px",
                        "font-weight": "500",
                        border: `1px solid ${colors().blue}40`,
                      }}
                    >
                      {prop.name}
                    </code>
                  </td>
                  <td
                    style={{
                      padding: "8px 12px",
                      "font-family": FONT_MONO,
                      "font-size": "12px",
                      color: colors().textSecondary,
                    }}
                  >
                    {prop.type}
                  </td>
                  <td style={{ padding: "8px 12px", color: colors().textSecondary }}>
                    <Show when={prop.default} fallback="—">
                      <code style={{ "font-family": FONT_MONO, "font-size": "12px" }}>
                        {prop.default}
                      </code>
                    </Show>
                  </td>
                  <td style={{ padding: "8px 12px", color: colors().textSecondary }}>
                    {prop.description}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AccessibilitySection(props: { children: JSX.Element }) {
  const getColors = useThemeColors();
  const colors = () => getColors();

  return (
    <section style={{ "margin-top": "2rem" }}>
      <h2
        style={{
          "font-family": FONT_TITLE,
          "font-size": "15px",
          "font-weight": "600",
          margin: "0 0 0.75rem 0",
          "padding-left": "10px",
          "border-left": `2px solid ${colors().blue}`,
          color: colors().text,
        }}
      >
        Accessibility
      </h2>
      <div
        class="not-prose"
        style={{
          margin: "0.75rem 0",
          padding: "12px 14px",
          background: colors().surfaceElevated,
          "border-left": `3px solid ${colors().blue}`,
          "font-size": "13px",
          "line-height": "1.6",
          color: colors().textSecondary,
        }}
      >
        {props.children}
      </div>
    </section>
  );
}
