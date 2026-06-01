import { createFileRoute } from "@tanstack/solid-router";
import { useThemeColors } from "@/utils/theme";

export const Route = createFileRoute("/solid-spectrum/docs/installation")({
  component: InstallationPage,
});

const FONT_TITLE = "'Jost', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

function InstallationPage() {
  const getColors = useThemeColors();
  const colors = () => getColors();

  const codeBlock = (code: string) => ({
    background: colors().surface,
    color: colors().text,
    padding: "12px 14px",
    "overflow-x": "auto" as const,
    margin: "0.75rem 0",
    "font-family": FONT_MONO,
    "font-size": "12px",
    border: `1px solid ${colors().muted}`,
    "border-left": `3px solid ${colors().blue}`,
  });

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
        Installation
      </h1>

      <p style={{ "margin-bottom": "1.5rem", "max-width": "60ch" }}>
        Install Proyecto Viviana packages using your preferred package manager or registry.
      </p>

      <SectionHeading color={colors().blue}>From npm</SectionHeading>
      <pre style={codeBlock("")}>
        <code>{`npm install @proyecto-viviana/solid-spectrum @proyecto-viviana/solidaria`}</code>
      </pre>

      <SectionHeading color={colors().blue}>Peer Dependencies</SectionHeading>
      <p style={{ "margin-bottom": "0.75rem" }}>Make sure you have SolidJS installed:</p>
      <pre style={codeBlock("")}>
        <code>{`npm install solid-js`}</code>
      </pre>

      <SectionHeading color={colors().blue}>Package Overview</SectionHeading>
      <p style={{ "margin-bottom": "0.75rem" }}>
        Choose which packages to install based on your needs:
      </p>

      <div
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
                Package
              </th>
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
                Use Case
              </th>
            </tr>
          </thead>
          <tbody>
            <PkgRow
              pkg="@proyecto-viviana/solid-spectrum"
              desc="Pre-styled components, ready to use"
              colors={colors()}
            />
            <PkgRow
              pkg="@proyecto-viviana/solidaria"
              desc="ARIA hooks for custom components"
              colors={colors()}
            />
            <PkgRow
              pkg="@proyecto-viviana/solidaria-components"
              desc="Headless components with render props"
              colors={colors()}
            />
            <PkgRow
              pkg="@proyecto-viviana/solid-stately"
              desc="State management hooks only"
              colors={colors()}
            />
          </tbody>
        </table>
      </div>

      <SectionHeading color={colors().blue}>CSS Theme Tokens</SectionHeading>
      <p style={{ "margin-bottom": "0.75rem" }}>
        Add the theme variables to your app CSS when you want to customize the default colors:
      </p>
      <pre style={codeBlock("")}>
        <code>{`:root {
  --color-primary-100: #ddf4ff;
  --color-primary-200: #b6e3ff;
  --color-primary-300: #80ccff;
  --color-primary-400: #54aeff;
  --color-primary-500: #4da0ff;
  --color-primary-600: #3080f4;

  --color-bg-100: #333333;
  --color-bg-200: #1a1a1a;
  --color-bg-300: #111111;
  --color-bg-400: #0a0a0a;

  --color-accent: #ffa0d5;
  --color-accent-200: #ffc9e9;
  --color-accent-300: #f778ba;

  --font-sans: 'Sen', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}`}</code>
      </pre>

      <SectionHeading color={colors().blue}>TypeScript Configuration</SectionHeading>
      <p style={{ "margin-bottom": "0.75rem" }}>
        For SolidJS JSX support, ensure your tsconfig includes:
      </p>
      <pre style={codeBlock("")}>
        <code>{`{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "types": ["vite/client"]
  }
}`}</code>
      </pre>
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

function PkgRow(props: {
  pkg: string;
  desc: string;
  colors: ReturnType<ReturnType<typeof useThemeColors>>;
}) {
  return (
    <tr style={{ "border-bottom": `1px solid ${props.colors.muted}` }}>
      <td style={{ padding: "8px 12px" }}>
        <code
          style={{
            background: `${props.colors.blue}15`,
            color: props.colors.blue,
            padding: "2px 6px",
            "font-family": "'JetBrains Mono', monospace",
            "font-size": "12px",
            "font-weight": "500",
            border: `1px solid ${props.colors.blue}40`,
          }}
        >
          {props.pkg}
        </code>
      </td>
      <td style={{ padding: "8px 12px", color: props.colors.textSecondary }}>{props.desc}</td>
    </tr>
  );
}
