import { createFileRoute, Link } from "@tanstack/solid-router";
import { GitHubIcon } from "@proyecto-viviana/solid-spectrum";
import { Header } from "@/components";
import { useThemeColors, useTheme } from "@/utils/theme";

export const Route = createFileRoute("/solid-spectrum/")({
  component: Landing,
});

function Landing() {
  const getColors = useThemeColors();
  const { isDark } = useTheme();
  const colors = () => getColors();

  return (
    <div
      style={{
        "min-height": "100vh",
        background: colors().surface,
        display: "flex",
        "flex-direction": "column",
        "font-family": "'Sen', system-ui, sans-serif",
        color: colors().text,
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <Header />

      {/* Hero */}
      <main
        id="main-content"
        style={{
          flex: "1",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "center",
          padding: "4rem 2rem",
          "text-align": "center",
        }}
      >
        {/* Tag */}
        <div
          style={{
            display: "inline-flex",
            "align-items": "center",
            background: colors().pink,
            padding: "4px 12px",
            "margin-bottom": "1.5rem",
            "font-size": "11px",
            "font-weight": "600",
            "letter-spacing": "0.5px",
            color: isDark() ? colors().surface : "#ffffff",
            "font-family": "'Jost', system-ui, sans-serif",
          }}
        >
          ACCESSIBLE UI LIBRARY FOR SOLIDJS
        </div>

        {/* Title */}
        <h1
          style={{
            "font-family": "'Jost', system-ui, sans-serif",
            "font-size": "clamp(2.5rem, 8vw, 5rem)",
            "font-weight": "700",
            "line-height": "1",
            margin: "0 0 1.5rem 0",
            "letter-spacing": "-0.02em",
          }}
        >
          <span style={{ color: colors().blue }}>A11y</span> at
          <br />
          <span style={{ color: colors().pink }}>Solid</span> speed
        </h1>

        {/* Subtitle */}
        <p
          style={{
            "font-size": "14px",
            "max-width": "420px",
            "line-height": "1.6",
            margin: "0 0 2rem 0",
            color: colors().textSecondary,
            "border-left": `3px solid ${colors().pink}`,
            "padding-left": "12px",
            "text-align": "left",
          }}
        >
          A meticulously crafted port of Adobe's React Spectrum. 60+ accessible components, 3680
          tests, zero compromises.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            "flex-wrap": "wrap",
            "justify-content": "center",
          }}
        >
          <Link
            to="/solid-spectrum/docs"
            style={{
              display: "inline-flex",
              "align-items": "center",
              gap: "8px",
              padding: "10px 20px",
              background: colors().pink,
              color: isDark() ? colors().surface : "#ffffff",
              "text-decoration": "none",
              "font-weight": "600",
              "font-size": "13px",
              "font-family": "'Jost', system-ui, sans-serif",
              border: `2px solid ${colors().pink}`,
              transition: "filter 0.2s ease",
              filter: `drop-shadow(0 0 8px ${colors().pinkGlow})`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = `drop-shadow(0 0 12px ${colors().pinkGlow})`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = `drop-shadow(0 0 8px ${colors().pinkGlow})`;
            }}
          >
            Get Started
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <a
            href="https://github.com/proyecto-viviana/proyecto-viviana"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              "align-items": "center",
              gap: "8px",
              padding: "10px 20px",
              background: "transparent",
              color: colors().blue,
              "text-decoration": "none",
              "font-weight": "600",
              "font-size": "13px",
              "font-family": "'Jost', system-ui, sans-serif",
              border: `2px solid ${colors().blue}`,
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${colors().blue}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <GitHubIcon size={16} />
            GitHub
          </a>
        </div>

        {/* Feature blocks */}
        <div
          style={{
            display: "grid",
            "grid-template-columns": "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "8px",
            "margin-top": "3rem",
            "max-width": "600px",
            width: "100%",
          }}
        >
          <FeatureBlock
            title="3680 Tests"
            desc="World-class a11y coverage"
            color={colors().pink}
            bgColor={colors().surfaceElevated}
          />
          <FeatureBlock
            title="60+ Components"
            desc="Forms, data, overlays, dates"
            color={colors().blue}
            bgColor={colors().surfaceElevated}
          />
          <FeatureBlock
            title="4-Layer Arch"
            desc="State → ARIA → Headless → UI"
            color={colors().pink}
            bgColor={colors().surfaceElevated}
          />
        </div>
      </main>

      {/* Status bar footer */}
      <footer
        style={{
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
          height: "32px",
          padding: "0 24px",
          "border-top": `1px solid ${colors().muted}`,
          background: colors().surfaceElevated,
          color: colors().textSecondary,
          "flex-wrap": "wrap",
          "font-size": "11px",
        }}
      >
        <span style={{ "font-weight": "600", color: colors().text }}>Proyecto Viviana</span>
        <div style={{ display: "flex", gap: "16px", "font-size": "10px" }}>
          <span style={{ color: colors().blue }}>SolidJS</span>
          <span style={{ color: colors().pink }}>Tailwind v4</span>
          <span style={{ color: colors().blue }}>WAI-ARIA</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureBlock(props: { title: string; desc: string; color: string; bgColor: string }) {
  return (
    <div
      style={{
        display: "flex",
        "align-items": "flex-start",
        gap: "10px",
        padding: "12px",
        background: props.bgColor,
        border: `2px solid ${props.color}40`,
      }}
    >
      <div
        style={{
          width: "3px",
          height: "32px",
          background: props.color,
          "flex-shrink": "0",
        }}
      />
      <div>
        <div
          style={{
            "font-family": "'Jost', system-ui, sans-serif",
            "font-weight": "600",
            "font-size": "13px",
            "margin-bottom": "2px",
          }}
        >
          {props.title}
        </div>
        <div style={{ "font-size": "11px", opacity: "0.7" }}>{props.desc}</div>
      </div>
    </div>
  );
}
