import { createFileRoute } from "@tanstack/solid-router";
import { type JSX } from "solid-js";
import { Header } from "@/components";
import { FONT_BODY, FONT_DISPLAY, SiteFooter } from "@/components/theme/primitives";
import "@/components/theme/studio.css";

export const Route = createFileRoute("/solid-spectrum/ecosystem")({
  component: Ecosystem,
});

/** A soft rounded chrome tile for one package/app — plain anchor, `--docs-*`
 *  tokens. Replaces the archived custom `ProjectCard`; inactive tiles dim and
 *  drop their link. */
function ProjectTile(props: {
  name: string;
  imageSrc: string;
  href?: string;
  inactive?: boolean;
}) {
  const inner: JSX.Element = (
    <>
      <img
        src={props.imageSrc}
        alt=""
        aria-hidden="true"
        style={{ width: "40px", height: "40px", "object-fit": "contain" }}
      />
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
        background: "var(--docs-bg)",
        color: "var(--docs-text)",
        display: "flex",
        "flex-direction": "column",
        "font-family": FONT_BODY,
      }}
    >
      <Header />

      <main id="main-content" class="pv-wrap pv-wrap--wide flex-1 px-6" style={{ "padding-block": "3rem" }}>
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
            <ProjectTile
              name="@proyecto-viviana/solid-spectrum"
              imageSrc="/images/ecosystem/ui.svg"
              href="https://github.com/proyecto-viviana/proyecto-viviana/tree/main/packages/solid-spectrum"
            />
            <ProjectTile
              name="@proyecto-viviana/solidaria-components"
              imageSrc="/images/ecosystem/solidaria.svg"
              href="https://github.com/proyecto-viviana/proyecto-viviana/tree/main/packages/solidaria-components"
            />
            <ProjectTile
              name="@proyecto-viviana/solidaria"
              imageSrc="/images/ecosystem/solidaria.svg"
              href="https://github.com/proyecto-viviana/proyecto-viviana/tree/main/packages/solidaria"
            />
            <ProjectTile
              name="@proyecto-viviana/solid-stately"
              imageSrc="/images/ecosystem/solid-stately.svg"
              href="https://github.com/proyecto-viviana/proyecto-viviana/tree/main/packages/solid-stately"
            />
          </div>
        </section>

        {/* Applications */}
        <section style={{ "margin-bottom": "3rem" }}>
          <SectionHeading>Applications</SectionHeading>
          <div class="pv-tile-grid">
            <ProjectTile
              name="PROYECTO VIVIANA"
              imageSrc="/images/ecosystem/proyecto-viviana.png"
              href="https://proyecto-viviana.uy"
            />
          </div>
        </section>

        {/* Coming Soon */}
        <section>
          <SectionHeading>Coming Soon</SectionHeading>
          <div class="pv-tile-grid">
            <ProjectTile name="viviana-native" imageSrc="/images/ecosystem/native.svg" inactive />
            <ProjectTile name="viviana-cli" imageSrc="/images/ecosystem/cli.svg" inactive />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
