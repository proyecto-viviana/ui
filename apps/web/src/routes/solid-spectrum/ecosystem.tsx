import { createFileRoute } from "@tanstack/solid-router";
import { type JSX } from "solid-js";
import { Header, SiteBackdrop } from "@/components";
import { FONT_BODY, FONT_DISPLAY, SiteFooter } from "@/components/theme/primitives";
import { PARENT_APP_URL, repoPackageUrl } from "@/lib/site";
import { seo } from "@/seo";
import "@/components/theme/studio.css";

export const Route = createFileRoute("/solid-spectrum/ecosystem")({
  head: () =>
    seo({
      title: "Ecosystem",
      description:
        "The five packages behind the port — solid-stately, solidaria, solidaria-components, solid-spectrum and @proyecto-viviana/ui — and the apps built on them.",
      path: "/solid-spectrum/ecosystem",
    }),
  component: Ecosystem,
});

/** A soft rounded chrome tile for one package/app — plain anchor, `--docs-*`
 *  tokens. Replaces the archived custom `ProjectCard`; inactive tiles dim and
 *  drop their link.
 *
 *  The face is a two-letter monogram by default. The tiles used to point at
 *  `/images/ecosystem/*`, which has never existed in `public/` — six 404s per
 *  visit and six broken-image glyphs. Pass `imageSrc` only for art we actually
 *  ship. */
function ProjectTile(props: {
  name: string;
  glyph: string;
  imageSrc?: string;
  href?: string;
  inactive?: boolean;
}) {
  const inner: JSX.Element = (
    <>
      {props.imageSrc ? (
        <img
          src={props.imageSrc}
          alt=""
          aria-hidden="true"
          style={{ width: "40px", height: "40px", "object-fit": "contain" }}
        />
      ) : (
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            "align-items": "center",
            "justify-content": "center",
            width: "40px",
            height: "40px",
            "border-radius": "10px",
            background: "var(--pv-accent-tint)",
            color: "var(--docs-accent)",
            "font-family": FONT_DISPLAY,
            "font-size": "15px",
            "font-weight": "700",
            "letter-spacing": "0.02em",
          }}
        >
          {props.glyph}
        </span>
      )}
      <span
        style={{
          "font-family": FONT_BODY,
          "font-size": "13px",
          "font-weight": "600",
          "line-height": "1.4",
          color: "var(--docs-text)",
          "word-break": "break-word",
        }}
      >
        {props.name}
      </span>
    </>
  );

  const style: JSX.CSSProperties = {
    display: "flex",
    "flex-direction": "column",
    "align-items": "center",
    "text-align": "center",
    gap: "14px",
    padding: "24px 18px",
    "text-decoration": "none",
    opacity: props.inactive ? "0.55" : "1",
  };

  if (props.inactive || !props.href) {
    return (
      <div class="pv-card" style={style}>
        {inner}
      </div>
    );
  }
  return (
    <a class="pv-card" style={style} href={props.href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  );
}

function SectionHeading(props: { children: JSX.Element }) {
  return (
    <h2
      style={{
        "font-family": FONT_DISPLAY,
        "font-size": "13px",
        "font-weight": "700",
        "letter-spacing": "0.06em",
        "text-transform": "uppercase",
        color: "var(--docs-text-secondary)",
        "margin-bottom": "16px",
      }}
    >
      {props.children}
    </h2>
  );
}

function Ecosystem() {
  return (
    <div
      style={{
        "min-height": "100vh",
        background: "transparent",
        color: "var(--docs-text)",
        display: "flex",
        "flex-direction": "column",
        "font-family": FONT_BODY,
      }}
    >
      <SiteBackdrop variant="calm" />
      <Header />

      <main
        id="main-content"
        class="pv-wrap pv-wrap--wide"
        style={{ flex: "1", "padding-inline": "1.5rem", "padding-block": "3rem" }}
      >
        <h1
          style={{
            "font-family": FONT_DISPLAY,
            "font-size": "clamp(2rem, 5vw, 3rem)",
            "font-weight": "700",
            "letter-spacing": "-0.02em",
          }}
        >
          Ecosystem
        </h1>
        <p
          style={{
            "max-width": "560px",
            "margin-top": "0.75rem",
            "margin-bottom": "3rem",
            "font-size": "15px",
            "line-height": "1.65",
            color: "var(--docs-text-secondary)",
          }}
        >
          The proyecto-viviana ecosystem: packages, tools, and applications built with our component
          library.
        </p>

        {/* Core Packages */}
        <section style={{ "margin-bottom": "3rem" }}>
          <SectionHeading>Core Packages</SectionHeading>
          <div class="pv-tile-grid">
            {/* Top of the chain first. The `ui` package publishes from
                packages/viviana-ui — the directory and the package name differ. */}
            <ProjectTile
              name="@proyecto-viviana/ui"
              glyph="UI"
              href={repoPackageUrl("viviana-ui")}
            />
            <ProjectTile
              name="@proyecto-viviana/solid-spectrum"
              glyph="SP"
              href={repoPackageUrl("solid-spectrum")}
            />
            <ProjectTile
              name="@proyecto-viviana/solidaria-components"
              glyph="SC"
              href={repoPackageUrl("solidaria-components")}
            />
            <ProjectTile
              name="@proyecto-viviana/solidaria"
              glyph="SA"
              href={repoPackageUrl("solidaria")}
            />
            <ProjectTile
              name="@proyecto-viviana/solid-stately"
              glyph="ST"
              href={repoPackageUrl("solid-stately")}
            />
          </div>
        </section>

        {/* Applications */}
        <section style={{ "margin-bottom": "3rem" }}>
          <SectionHeading>Applications</SectionHeading>
          <div class="pv-tile-grid">
            <ProjectTile
              name="PROYECTO VIVIANA"
              glyph="PV"
              imageSrc="/logo.png"
              href={PARENT_APP_URL}
            />
          </div>
        </section>

        {/* Coming Soon */}
        <section>
          <SectionHeading>Coming Soon</SectionHeading>
          <div class="pv-tile-grid">
            <ProjectTile name="viviana-native" glyph="NA" inactive />
            <ProjectTile name="viviana-cli" glyph="CL" inactive />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
