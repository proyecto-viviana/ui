import { type JSX, For, Show } from "solid-js";

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

/* The docs chrome wears the Glasselated register: the Geist trio (pixel display
   for headings, Geist for prose, Geist Mono for code), frosted-glass preview
   panels, and matte terminal wells for code. The live solid-spectrum components
   inside the preview boxes paint their own Spectrum look; everything around them
   is the house register. Exported so the docs layout and landing share one
   source. The names are kept (some callers import FONT_SANS/FONT_MONO); the
   values now resolve to @proyecto-viviana/ui's type tokens — no font files. */
export const FONT_SANS = "var(--font-body)";
export const FONT_MONO = "var(--font-mono)";
export const FONT_DISPLAY = "var(--font-display)";

export function DocPage(props: DocPageProps) {
  return (
    <div
      style={{
        "line-height": "1.7",
        "font-size": "14.5px",
        "font-family": FONT_SANS,
        color: "var(--text-secondary)",
      }}
    >
      {/* Title — pixel display, bottom rule */}
      <h1
        style={{
          "font-family": FONT_DISPLAY,
          "font-size": "26px",
          "font-weight": "600",
          margin: "0 0 10px 0",
          "padding-bottom": "12px",
          "border-bottom": "1px solid var(--border-default)",
          "letter-spacing": "0.01em",
          color: "var(--text-primary)",
        }}
      >
        {props.title}
      </h1>

      <p style={{ "margin-bottom": "1.5rem", "max-width": "62ch" }}>{props.description}</p>

      <SectionHeading>Import</SectionHeading>
      <CodeBlock>{props.importCode}</CodeBlock>

      {props.children}
    </div>
  );
}

/** A section heading — pixel display with a register-blue accent rule on the left. */
function SectionHeading(props: { children: JSX.Element }) {
  return (
    <h2
      style={{
        "font-family": FONT_DISPLAY,
        "font-size": "14px",
        "font-weight": "600",
        margin: "2rem 0 0.75rem 0",
        "padding-left": "12px",
        "border-left": "2px solid var(--accent-primary)",
        "letter-spacing": "0.01em",
        color: "var(--text-primary)",
      }}
    >
      {props.children}
    </h2>
  );
}

/** A matte terminal well — the register's code surface. */
function CodeBlock(props: { children: JSX.Element }) {
  return (
    <pre
      style={{
        background: "var(--surface-well)",
        color: "var(--text-primary)",
        padding: "12px 14px",
        "overflow-x": "auto",
        margin: "0.75rem 0",
        "font-family": FONT_MONO,
        "font-size": "12.5px",
        border: "1px solid var(--well-border)",
        "border-radius": "var(--radius-md)",
      }}
    >
      <code>{props.children}</code>
    </pre>
  );
}

export interface ExampleProps {
  title: string;
  description?: string;
  code: string;
  children: JSX.Element;
}

export function Example(props: ExampleProps) {
  return (
    <section style={{ "margin-top": "2rem" }}>
      <SectionHeading>{props.title}</SectionHeading>
      <Show when={props.description}>
        <p style={{ "margin-bottom": "0.75rem" }}>{props.description}</p>
      </Show>

      {/* Live preview. Spectrum docs inherit the pinned Provider's canonical
          base surface through --s2-container-bg; the other docs keep the
          frosted house surface. This keeps Spectrum foreground tokens on the
          upstream background they were designed and tested against. */}
      <div
        style={{
          margin: "0.75rem 0",
          padding: "1.5rem",
          background: "var(--s2-container-bg, var(--surface-panel))",
          "backdrop-filter": "var(--blur-panel)",
          "-webkit-backdrop-filter": "var(--blur-panel)",
          border: "1px solid var(--border-default)",
          "border-radius": "var(--radius-lg)",
          "box-shadow": "var(--edge-glass-surface)",
        }}
      >
        {props.children}
      </div>

      <CodeBlock>{props.code}</CodeBlock>
    </section>
  );
}

export interface PropsTableProps {
  props: PropDefinition[];
}

export function PropsTable(props: PropsTableProps) {
  return (
    <section style={{ "margin-top": "2rem" }}>
      <SectionHeading>Props</SectionHeading>
      <div
        style={{
          margin: "0.75rem 0",
          "overflow-x": "auto",
          border: "1px solid var(--border-default)",
          "border-radius": "var(--radius-md)",
          background: "var(--surface-well)",
        }}
      >
        <table style={{ width: "100%", "font-size": "13px", "border-collapse": "collapse" }}>
          <thead>
            <tr style={{ "border-bottom": "1px solid var(--border-default)" }}>
              {["Prop", "Type", "Default", "Description"].map((h) => (
                <th
                  style={{
                    padding: "9px 12px",
                    "text-align": "left",
                    "font-weight": "700",
                    "font-family": FONT_MONO,
                    "font-size": "10px",
                    "text-transform": "uppercase",
                    "letter-spacing": "0.09em",
                    color: "var(--text-secondary)",
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
                <tr style={{ "border-bottom": "1px solid var(--border-default)" }}>
                  <td style={{ padding: "8px 12px" }}>
                    <code
                      style={{
                        background: "color-mix(in srgb, var(--accent-primary) 12%, transparent)",
                        color: "var(--text-link)",
                        padding: "2px 6px",
                        "border-radius": "var(--radius-sm)",
                        "font-family": FONT_MONO,
                        "font-size": "12px",
                        "font-weight": "500",
                        border:
                          "1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)",
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
                      color: "var(--text-secondary)",
                    }}
                  >
                    {prop.type}
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>
                    <Show when={prop.default} fallback="—">
                      <code style={{ "font-family": FONT_MONO, "font-size": "12px" }}>
                        {prop.default}
                      </code>
                    </Show>
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>
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

/**
 * The accessibility notes at the foot of every component page. It renders the `<ul>`
 * itself and takes the `<li>`s as children: the list needs descendant styling (bullets,
 * row gap) that an inline style cannot express, and doing it here means the ~45 pages
 * below carry no styling of their own.
 */
export function AccessibilitySection(props: { children: JSX.Element }) {
  return (
    <section style={{ "margin-top": "2rem" }}>
      <SectionHeading>Accessibility</SectionHeading>
      <div
        style={{
          margin: "0.75rem 0",
          padding: "14px 16px",
          background: "var(--surface-panel)",
          "backdrop-filter": "var(--blur-panel)",
          "-webkit-backdrop-filter": "var(--blur-panel)",
          border: "1px solid var(--border-default)",
          "border-left": "3px solid var(--accent-primary)",
          "border-radius": "var(--radius-md)",
          "font-size": "13px",
          "line-height": "1.7",
          color: "var(--text-secondary)",
        }}
      >
        <ul
          style={{
            margin: "0",
            "padding-left": "1.25rem",
            "list-style": "disc",
            display: "flex",
            "flex-direction": "column",
            gap: "0.3rem",
          }}
        >
          {props.children}
        </ul>
      </div>
    </section>
  );
}
