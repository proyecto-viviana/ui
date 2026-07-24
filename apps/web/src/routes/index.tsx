import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/")({
  component: HoldingPage,
});

function HoldingPage() {
  return (
    <main
      style={{
        "min-height": "100vh",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        padding: "24px",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          gap: "20px",
          "text-align": "center",
        }}
      >
        <img
          src="/logo.png"
          alt="Viviana Corp"
          style={{
            width: "min(320px, 70vw)",
            height: "auto",
          }}
        />
        <p
          style={{
            margin: "0",
            color: "var(--color-grey-400)",
            "font-family": "var(--font-title)",
            "font-size": "clamp(1rem, 1.4vw, 1.125rem)",
            "font-weight": "500",
          }}
        >
          Vuelva más tarde
        </p>
      </div>
    </main>
  );
}
