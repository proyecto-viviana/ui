import { Link, createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import { FONT_DISPLAY, FONT_MONO, FONT_SANS } from "@/components/docs";
import { apiPages } from "@/data/api-reference";
import { seo } from "@/seo";

/** Widened for the same reason as the sidebar's — see `docs/route.tsx`. */
const pageHref = (slug: string): string => `/docs/components/${slug}`;

export const Route = createFileRoute("/docs/")({
  head: () =>
    seo({
      title: "API reference",
      description:
        "Every component @proyecto-viviana/ui exports, with its full prop surface generated from the package's own TypeScript types.",
      path: "/docs",
    }),
  component: ApiReferenceIndex,
});

function ApiReferenceIndex() {
  return (
    <div
      style={{
        "line-height": "1.7",
        "font-size": "14.5px",
        "font-family": FONT_SANS,
        color: "var(--text-secondary)",
      }}
    >
      <h1
        style={{
          "font-family": FONT_DISPLAY,
          "font-size": "26px",
          "font-weight": "600",
          margin: "0 0 10px 0",
          "padding-bottom": "12px",
          "border-bottom": "1px solid var(--border-default)",
          color: "var(--text-primary)",
        }}
      >
        API reference
      </h1>

      <p style={{ "max-width": "62ch" }}>
        {apiPages.pages.length} components and {apiPages.propCount} props from{" "}
        <code style={{ "font-family": FONT_MONO }}>{apiPages.packageName}</code>, read out of the
        package's TypeScript declarations rather than written by hand. When a prop changes in
        source, this changes with it —{" "}
        <code style={{ "font-family": FONT_MONO }}>guard:api-reference</code> fails the build if the
        two disagree.
      </p>

      <p style={{ "max-width": "62ch" }}>
        Looking for live, editable examples instead? The{" "}
        <Link to="/showcase" style={{ color: "var(--accent-primary)" }}>
          showcase
        </Link>{" "}
        renders the register in context, and the{" "}
        <Link to="/solid-spectrum/docs" style={{ color: "var(--accent-primary)" }}>
          solid-spectrum docs
        </Link>{" "}
        cover the Spectrum-parity register underneath.
      </p>

      <div
        style={{
          display: "grid",
          "grid-template-columns": "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "8px",
          "margin-top": "2rem",
        }}
      >
        <For each={apiPages.pages}>
          {(page) => (
            <Link
              to={pageHref(page.slug)}
              style={{
                display: "block",
                padding: "10px 12px",
                background: "var(--surface-panel)",
                "backdrop-filter": "var(--blur-panel)",
                "-webkit-backdrop-filter": "var(--blur-panel)",
                border: "1px solid var(--border-default)",
                "border-radius": "var(--radius-md)",
                "box-shadow": "var(--edge-glass-surface)",
                color: "var(--text-primary)",
                "text-decoration": "none",
                "font-size": "13px",
                "font-weight": "500",
              }}
            >
              {page.title}
            </Link>
          )}
        </For>
      </div>
    </div>
  );
}
