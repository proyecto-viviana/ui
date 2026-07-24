import { createFileRoute } from "@tanstack/solid-router";
import { type JSX } from "solid-js";
import { FONT_SANS, FONT_MONO } from "@/components/docs";
import { useThemeColors } from "@/utils/theme";

export const Route = createFileRoute("/solid-spectrum/docs/installation")({
  component: InstallationPage,
});

/**
 * Everything on this page is checked against what the packages actually export.
 * The version this replaced told users to hand-author a `:root` block of
 * `--color-primary-*` variables that no shipped component reads, never mentioned
 * `@proyecto-viviana/ui` — the package the README points people at — and never
 * mentioned the CSS import without which nothing is styled at all. When you edit
 * this page, verify the subpaths against the packages' `exports` map.
 */
function InstallationPage() {
  const getColors = useThemeColors();
  const colors = () => getColors();

  const codeBlock = () => ({
    background: colors().surface,
    color: colors().text,
    padding: "12px 14px",
    "overflow-x": "auto" as const,
    margin: "0.75rem 0",
    "font-family": FONT_MONO,
    "font-size": "12px",
    "line-height": "1.55",
    border: `1px solid ${colors().muted}`,
    "border-left": `3px solid ${colors().blue}`,
  });

  const Code = (props: { children: string }) => (
    <pre style={codeBlock()}>
      <code>{props.children}</code>
    </pre>
  );

  return (
    <div style={{ "line-height": "1.6", "font-size": "14px", color: colors().textSecondary }}>
      <h1
        style={{
          "font-family": FONT_SANS,
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

      <p style={{ "margin-bottom": "1.5rem", "max-width": "62ch" }}>
        Every package is published to npm and works in any Solid app — no build plugin required.
        Pick the layer you want, install it alongside <InlineCode>solid-js</InlineCode>, and import
        one stylesheet.
      </p>

      <SectionHeading color={colors().blue}>Pick a package</SectionHeading>
      <p style={{ "margin-bottom": "0.75rem", "max-width": "62ch" }}>
        The five packages stack. Each one re-exports the layer beneath it, so install the highest
        one you need and nothing else — the lower layers come with it.
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
              <TableHeading colors={colors()}>Package</TableHeading>
              <TableHeading colors={colors()}>Install it when you want</TableHeading>
            </tr>
          </thead>
          <tbody>
            <PkgRow
              pkg="@proyecto-viviana/ui"
              desc="The Viviana design system: every Spectrum component plus Viviana's own components, tokens and product patterns."
              colors={colors()}
            />
            <PkgRow
              pkg="@proyecto-viviana/solid-spectrum"
              desc="Spectrum 2 styled components only, tracking Adobe's S2 visuals and behavior."
              colors={colors()}
            />
            <PkgRow
              pkg="@proyecto-viviana/solidaria-components"
              desc="Headless components with render props — you bring all the styling."
              colors={colors()}
            />
            <PkgRow
              pkg="@proyecto-viviana/solidaria"
              desc="ARIA behavior hooks for components you build yourself."
              colors={colors()}
            />
            <PkgRow
              pkg="@proyecto-viviana/solid-stately"
              desc="State hooks only, with no DOM or ARIA opinions."
              colors={colors()}
            />
          </tbody>
        </table>
      </div>

      <SectionHeading color={colors().blue}>Install</SectionHeading>
      <p style={{ "margin-bottom": "0.75rem" }}>
        <InlineCode>solid-js</InlineCode> is a peer dependency, so install it alongside:
      </p>
      <Code>{`npm install @proyecto-viviana/ui solid-js`}</Code>
      <p style={{ "margin-bottom": "0.75rem" }}>Or, for the Spectrum layer on its own:</p>
      <Code>{`npm install @proyecto-viviana/solid-spectrum solid-js`}</Code>

      <SectionHeading color={colors().blue}>Import the CSS</SectionHeading>
      <p style={{ "margin-bottom": "0.75rem", "max-width": "62ch" }}>
        Components do not inject their own styles. Import the stylesheet once at your app entry, or
        your components render unstyled:
      </p>
      <Code>{`import "@proyecto-viviana/ui/components.css";`}</Code>
      <p style={{ "margin-bottom": "0.75rem", "max-width": "62ch" }}>
        That one file is the usual import — it already contains the other three. Import them
        separately only if your app loads fonts itself:
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
              <TableHeading colors={colors()}>Subpath</TableHeading>
              <TableHeading colors={colors()}>Contents</TableHeading>
            </tr>
          </thead>
          <tbody>
            <PkgRow
              pkg="components.css"
              desc="font-faces.css + theme.css + styles.css. The usual import."
              colors={colors()}
            />
            <PkgRow
              pkg="theme.css"
              desc="Color-scheme tokens and the Viviana brand --color-* variables."
              colors={colors()}
            />
            <PkgRow
              pkg="styles.css"
              desc="Generated component rules, without font faces or tokens."
              colors={colors()}
            />
            <PkgRow
              pkg="font-faces.css"
              desc="Font-face declarations, including the Geist register."
              colors={colors()}
            />
          </tbody>
        </table>
      </div>

      <Note colors={colors()}>
        Keep these at the very top of your CSS entry, or as JS imports before any other stylesheet.{" "}
        <InlineCode>font-faces.css</InlineCode> opens with a remote <InlineCode>@import</InlineCode>{" "}
        for the Geist family, and CSS drops an <InlineCode>@import</InlineCode> that any rule
        precedes — load it late and the Geist register silently falls back to the default
        sans-serif.
      </Note>

      <p style={{ "margin-bottom": "0.75rem" }}>
        <InlineCode>@proyecto-viviana/solid-spectrum</InlineCode> ships the same subpaths, minus the
        Viviana tokens:
      </p>
      <Code>{`import "@proyecto-viviana/solid-spectrum/components.css";`}</Code>

      <SectionHeading color={colors().blue}>Render inside a Provider</SectionHeading>
      <p style={{ "margin-bottom": "0.75rem", "max-width": "62ch" }}>
        <InlineCode>Provider</InlineCode> establishes the color scheme, locale and text direction
        that components read. Deep imports are preferred in app code; the root barrel is convenient
        for examples and shared entry points.
      </p>
      <Code>{`import { Provider, Button } from "@proyecto-viviana/ui";
import { TextField } from "@proyecto-viviana/ui/TextField";

import "@proyecto-viviana/ui/components.css";

export function App() {
  return (
    <Provider colorScheme="dark">
      <TextField label="Name" />
      <Button variant="accent">Save</Button>
    </Provider>
  );
}`}</Code>

      <SectionHeading color={colors().blue}>TypeScript</SectionHeading>
      <p style={{ "margin-bottom": "0.75rem" }}>
        The packages ship their own declarations. Your tsconfig needs Solid&rsquo;s JSX:
      </p>
      <Code>{`{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "types": ["vite/client"]
  }
}`}</Code>

      <SectionHeading color={colors().blue}>Using Tailwind alongside</SectionHeading>
      <p style={{ "margin-bottom": "0.75rem", "max-width": "62ch" }}>
        The library ships no Tailwind and needs none. The two coexist, but only if you declare the
        cascade layer order yourself, before any import:
      </p>
      <Code>{`@layer theme, base, _, L, components, utilities;

@import "tailwindcss";
@import "@proyecto-viviana/ui/components.css";`}</Code>
      <p style={{ "margin-bottom": "0.75rem", "max-width": "62ch" }}>
        <InlineCode>_</InlineCode> and <InlineCode>L</InlineCode> are the layers the generated
        component rules live in. Without that line, layer order falls to first appearance and both
        outcomes fail silently: declare nothing and our layers sort last, so a{" "}
        <InlineCode>bg-red-500</InlineCode> on one of our components does nothing; put ours first
        and Tailwind&rsquo;s Preflight outranks us, stripping components back to bare.
      </p>

      <SectionHeading color={colors().blue}>Writing your own style() calls</SectionHeading>
      <p style={{ "margin-bottom": "0.75rem", "max-width": "62ch" }}>
        Optional, and not needed to use the components — their CSS is generated at package build
        time. You only need the macro plugin if your own code calls <InlineCode>style()</InlineCode>
        :
      </p>
      <Code>{`import { style } from "@proyecto-viviana/ui/style" with { type: "macro" };`}</Code>
      <p style={{ "margin-bottom": "0.75rem" }}>For Vite apps, use the packaged helper:</p>
      <Code>{`import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { vivianaMacros } from "@proyecto-viviana/ui/vite";

export default defineConfig({
  plugins: [vivianaMacros(), solid({ ssr: true })],
  optimizeDeps: {
    exclude: ["@proyecto-viviana/ui", "@proyecto-viviana/solid-spectrum"],
  },
  ssr: {
    noExternal: ["@proyecto-viviana/ui", "@proyecto-viviana/solid-spectrum"],
  },
});`}</Code>
      <p style={{ "margin-bottom": "0.75rem" }}>
        <InlineCode>vivianaMacros()</InlineCode> builds on{" "}
        <InlineCode>unplugin-parcel-macros</InlineCode>, an optional peer — add it as a dev
        dependency when you use the helper:
      </p>
      <Code>{`npm install -D unplugin-parcel-macros`}</Code>
    </div>
  );
}

function SectionHeading(props: { color: string; children: string }) {
  const getColors = useThemeColors();
  const colors = () => getColors();
  return (
    <h2
      style={{
        "font-family": FONT_SANS,
        "font-size": "15px",
        "font-weight": "600",
        margin: "2rem 0 0.75rem 0",
        "padding-left": "10px",
        "border-left": `2px solid ${props.color}`,
        color: colors().text,
      }}
    >
      {props.children}
    </h2>
  );
}

function InlineCode(props: { children: JSX.Element }) {
  return <code style={{ "font-family": FONT_MONO, "font-size": "0.92em" }}>{props.children}</code>;
}

type Colors = ReturnType<ReturnType<typeof useThemeColors>>;

/** A called-out gotcha — the kind that fails silently and costs an afternoon. */
function Note(props: { colors: Colors; children: JSX.Element }) {
  return (
    <p
      style={{
        margin: "0.75rem 0",
        padding: "10px 14px",
        "max-width": "62ch",
        background: props.colors.surface,
        "border-left": `3px solid ${props.colors.pink}`,
        border: `1px solid ${props.colors.muted}`,
        "border-left-width": "3px",
        "border-left-color": props.colors.pink,
      }}
    >
      {props.children}
    </p>
  );
}

function TableHeading(props: { colors: Colors; children: JSX.Element }) {
  return (
    <th
      style={{
        padding: "8px 12px",
        "text-align": "left",
        "font-weight": "600",
        "font-family": FONT_SANS,
        "font-size": "10px",
        "text-transform": "uppercase",
        "letter-spacing": "0.1em",
        color: props.colors.pink,
      }}
    >
      {props.children}
    </th>
  );
}

function PkgRow(props: { pkg: string; desc: string; colors: Colors }) {
  return (
    <tr style={{ "border-bottom": `1px solid ${props.colors.muted}`, "vertical-align": "top" }}>
      <td style={{ padding: "8px 12px", "white-space": "nowrap" }}>
        <code
          style={{
            background: `${props.colors.blue}15`,
            color: props.colors.blue,
            padding: "2px 6px",
            "font-family": FONT_MONO,
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
