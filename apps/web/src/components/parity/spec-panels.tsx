/* Terminal Glass Lab — the hand-built Glasselated spec, split into nine
   individually addressable panels. A faithful SolidJS port of the frozen design
   repo's `Terminal Glass Lab.dc.html`: each numbered section exercises one
   treatment with hand-written markup so it can sit beside its real viviana-ui
   twin on the Parity tab and any difference is attributable to the component,
   not the container. Frosted panels/cards use <MeshCard> (woven hex-mesh +
   cursor scan-band); terminal wells are matte and carry the pixel scan-grid.
   All colour comes from the scoped `--*` token layer, so a theme flip is
   entirely CSS-driven — only the mesh images react in JS.

   The original single-column lab kept panels 04 (NAVIGATION) and 05 (STATUS)
   in one 2-up grid; here every panel is a standalone export so the Parity view
   can pair each with its mirror in its own aligned row. */
import { For, type JSX } from "solid-js";
import { MeshCard, PixelIcon, ScanOverlay } from "./primitives";
import { badgeBase, btnBase, Caret, CH, MONO, Panel, Well } from "./lab-shell";

/* ── static, token-coloured data (no per-theme JS branching needed) ── */
const SEGMENTS = [
  { label: "day", fg: "var(--text-tertiary)" },
  { label: "[week]", fg: "var(--accent-primary)" },
  { label: "month", fg: "var(--text-tertiary)" },
];

interface Chip {
  readonly label: string;
  readonly fg: string;
  readonly bg: string;
  readonly border: string;
  readonly scan: boolean;
}
const CHIPS: readonly Chip[] = [
  {
    label: "#shaders",
    fg: "var(--text-on-accent)",
    bg: "var(--interactive-fill)",
    border: "var(--interactive-fill)",
    scan: false,
  },
  {
    label: "#pathtracing",
    fg: "var(--well-dim)",
    bg: "var(--surface-well)",
    border: "var(--well-border)",
    scan: true,
  },
  {
    label: "#colorspaces",
    fg: "var(--well-dim)",
    bg: "var(--surface-well)",
    border: "var(--well-border)",
    scan: true,
  },
  {
    label: "#raymarching",
    fg: "var(--well-dim)",
    bg: "var(--surface-well)",
    border: "var(--well-border)",
    scan: true,
  },
];

const NAV_ITEMS = [
  { on: true, label: "home", fg: "var(--accent-primary)", badge: null as string | null },
  { on: false, label: "explore", fg: "var(--text-tertiary)", badge: null as string | null },
  { on: false, label: "review", fg: "var(--text-tertiary)", badge: "4" as string | null },
  { on: false, label: "live", fg: "var(--text-tertiary)", badge: null as string | null },
];

const TAB_ITEMS = [
  { icon: "home", label: "Home", color: "var(--accent-primary)" },
  { icon: "map", label: "Explore", color: "var(--text-tertiary)" },
  { icon: "play", label: "Play", color: "var(--text-tertiary)" },
  { icon: "zap", label: "Live", color: "var(--text-tertiary)" },
  { icon: "user", label: "Me", color: "var(--text-tertiary)" },
];

/* 16-dot pixel focus ring: 10 lit, dots 8 & 9 lead with a dithered fill.
   Positions are pure trig (deterministic) — computed once at module load. */
const PIX_RING = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
  const on = i < 10;
  const lead = i === 8 || i === 9;
  return {
    x: Math.round(38 + 31 * Math.cos(a) - 3.5),
    y: Math.round(38 + 31 * Math.sin(a) - 3.5),
    bg: lead
      ? "repeating-conic-gradient(var(--accent-primary) 0% 25%, transparent 0% 50%) 0 0 / 3.5px 3.5px"
      : on
        ? "var(--accent-primary)"
        : "var(--surface-inset)",
    anim: on ? `glxRingBlink 2.6s step-end ${(i * 0.16).toFixed(2)}s infinite` : "none",
  };
});

const CONSOLE_CARDS = [
  {
    path: "~/review/queue",
    dot: CH.am,
    state: "DUE",
    title: "Spaced Review",
    desc: "4 cards due, oldest from Radiometry Basics. About 6 minutes.",
    btn: "Review",
    btnFg: "var(--accent-create-ink)",
    btnBg: "var(--accent-create-bg)",
    btnBorder: "var(--accent-create-border)",
    variant: "signal" as const,
    amber: true,
  },
  {
    path: "~/journeys/colorspaces",
    dot: CH.vi,
    state: "NEW",
    title: "Color Spaces",
    desc: "New design journey — 8 lessons on gamuts, gamma and OKLCH.",
    btn: "Start",
    btnFg: "var(--text-primary)",
    btnBg: "var(--surface-raised)",
    btnBorder: "var(--border-subtle)",
    variant: "ambient" as const,
    amber: false,
  },
];

const T3_LOG = [
  { t: "18:42:07", msg: "sampler.init — 6000 target samples", c: "var(--well-mid)" },
  { t: "18:43:51", msg: "checkpoint 0x3D passed ✓", c: "var(--well-cy)" },
  { t: "18:44:12", msg: "variance 0.0087 → 0.0031", c: "var(--well-vi)" },
  { t: "18:45:30", msg: "warn: firefly detected @ px(812,204)", c: "var(--well-am)" },
  { t: "18:47:02", msg: "err: memory cell 0x3F degraded", c: "var(--well-rd)" },
  { t: "18:47:05", msg: "quiz: why do shorter paths dominate?", c: "var(--well-cy)" },
];

const LIST_ROWS = [
  {
    title: "Radiometry Basics",
    meta: "Reference · 8 min read",
    tag: "READ",
    tagColor: "var(--text-tertiary)",
  },
  {
    title: "Monte Carlo Path Tracing",
    meta: "Journey · phase 3/5",
    tag: "RUNNING",
    tagColor: CH.cy,
  },
  {
    title: "SDF Raymarching — Live w/ Shader School",
    meta: "Today 18:00 · 214 waiting",
    tag: "● LIVE",
    tagColor: "var(--accent-live)",
  },
  {
    title: "Firefly Clamping Deep Dive",
    meta: "Reference · 12 min read",
    tag: "NEW",
    tagColor: CH.vi,
  },
];

const TYPE_ROLES = [
  {
    name: "display",
    font: "var(--type-display)",
    track: "var(--type-display-track)",
    sample: "Think in circles",
    spec: "Pixel · hero & page titles",
  },
  {
    name: "title",
    font: "var(--type-title)",
    track: "var(--type-title-track)",
    sample: "Monte Carlo Path Tracing",
    spec: "Pixel · section/panel titles",
  },
  {
    name: "headline",
    font: "var(--type-headline)",
    track: "var(--type-headline-track)",
    sample: "Spaced Review",
    spec: "Pixel · card & list titles",
  },
  {
    name: "label",
    font: "var(--type-label)",
    track: "var(--type-label-track)",
    sample: "Resume · Home · #shaders",
    spec: "Pixel · buttons/nav/chips — 13px floor",
  },
  {
    name: "body",
    font: "var(--type-body)",
    track: "normal",
    sample: "March a ray through signed distance fields toward the nearest surface.",
    spec: "Geist · prose",
  },
  {
    name: "meta",
    font: "var(--type-meta)",
    track: "normal",
    sample: "Today 18:00 · 214 waiting",
    spec: "Geist · secondary",
  },
  {
    name: "micro",
    font: "var(--type-micro)",
    track: "var(--type-micro-track)",
    sample: "LIVE · DUE · 0x3F",
    spec: "Mono · below the pixel floor",
  },
  {
    name: "terminal",
    font: "var(--type-terminal)",
    track: "normal",
    sample: "> submit checkpoint --answer",
    spec: "Mono · wells & prompts only",
  },
];

/* ── 01 BUTTONS ── */
export function SpecPanel01(): JSX.Element {
  return (
    <Panel label="01 // BUTTONS">
      <div style={{ display: "flex", "align-items": "center", gap: "12px", "flex-wrap": "wrap" }}>
        <button
          type="button"
          style={{
            ...btnBase,
            color: "var(--text-on-accent)",
            "background-color": "var(--interactive-fill)",
            border: "1px solid var(--interactive-fill)",
          }}
        >
          Resume
        </button>
        <button
          type="button"
          style={{
            ...btnBase,
            color: "var(--text-primary)",
            "background-color": "var(--btn-secondary-bg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          Today
        </button>
        <button
          type="button"
          style={{
            ...btnBase,
            color: "var(--accent-create-ink)",
            "background-color": "var(--accent-create-bg)",
            border: "1px solid var(--accent-create-border)",
            display: "inline-flex",
            "align-items": "center",
            gap: "7px",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Create
        </button>
        <button
          type="button"
          style={{
            ...btnBase,
            color: "var(--text-secondary)",
            "background-color": "transparent",
            border: "1px solid var(--border-subtle)",
          }}
        >
          Ghost
        </button>
        <button
          type="button"
          style={{
            ...btnBase,
            "font-family": MONO,
            "letter-spacing": "0.06em",
            color: "var(--well-run-fg)",
            "background-color": "var(--surface-well)",
            border: "1px solid var(--well-border)",
          }}
        >
          [ F5 ] RUN
        </button>
        <span style={{ width: "1px", height: "26px", "background-color": "var(--border-default)" }} />
        <button
          type="button"
          aria-label="Notifications"
          style={{
            position: "relative",
            display: "inline-flex",
            "align-items": "center",
            "justify-content": "center",
            width: "40px",
            height: "40px",
            border: "1px solid var(--border-subtle)",
            "border-radius": "50%",
            "background-color": "var(--btn-secondary-bg)",
            "box-shadow": "var(--edge-glass)",
            cursor: "pointer",
          }}
        >
          <PixelIcon name="notification" color="var(--text-secondary)" size={18} />
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              "min-width": "17px",
              height: "17px",
              "border-radius": "999px",
              "background-color": "var(--accent-create-bg)",
              color: "var(--accent-create-ink)",
              border: "1px solid var(--accent-create-border)",
              "font-size": "10px",
              "font-weight": 700,
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "font-family": "var(--font-display)",
            }}
          >
            3
          </span>
        </button>
      </div>
    </Panel>
  );
}

/* ── 02 INPUTS & PROMPTS ── */
export function SpecPanel02(): JSX.Element {
  return (
    <Panel label="02 // INPUTS & PROMPTS">
      <div style={{ display: "flex", "align-items": "center", gap: "12px", "flex-wrap": "wrap" }}>
        <Well
          style={{
            display: "flex",
            "align-items": "center",
            gap: "10px",
            "font-size": "11.5px",
            padding: "11px 18px",
            "min-width": "240px",
            "border-radius": "8px",
          }}
        >
          <span style={{ display: "flex", "align-items": "center", gap: "10px", width: "100%" }}>
            <span style={{ color: "var(--well-cy)" }}>/</span>
            <span style={{ color: "var(--well-dim)" }}>
              search lessons
              <Caret color="var(--well-cy)" />
            </span>
            <span style={{ "margin-left": "auto", "font-size": "10px", color: "var(--well-dim)" }}>
              ⌘K
            </span>
          </span>
        </Well>
        <div style={{ display: "inline-flex", gap: "16px", padding: "0 4px" }}>
          <For each={SEGMENTS}>
            {(sg) => (
              <span
                style={{
                  "font-family": MONO,
                  "font-size": "11.5px",
                  "font-weight": 700,
                  color: sg.fg,
                  padding: "6px 0",
                  cursor: "pointer",
                }}
              >
                {sg.label}
              </span>
            )}
          </For>
        </div>
        <Well
          tutor
          style={{
            flex: 1,
            "min-width": "260px",
            display: "flex",
            "align-items": "center",
            gap: "10px",
            "font-size": "11.5px",
            padding: "11px 18px",
            "border-radius": "8px",
          }}
        >
          <span style={{ display: "flex", "align-items": "center", gap: "10px", width: "100%" }}>
            <span style={{ color: "var(--status-info)" }}>$</span>
            <span style={{ color: "var(--well-tutor-ink)" }}>
              ask tutor "why does variance drop?"
              <Caret color="var(--status-info)" />
            </span>
            <span style={{ "margin-left": "auto", "font-size": "9.5px", color: "var(--well-dim)" }}>
              ↵
            </span>
          </span>
        </Well>
      </div>
    </Panel>
  );
}

/* ── 03 CHIPS & BADGES ── */
export function SpecPanel03(): JSX.Element {
  return (
    <Panel label="03 // CHIPS & BADGES">
      <div style={{ display: "flex", "align-items": "center", gap: "10px", "flex-wrap": "wrap" }}>
        <For each={CHIPS}>
          {(cp) => (
            <span
              style={{
                position: "relative",
                overflow: "hidden",
                "font-family": MONO,
                "font-size": "11px",
                "font-weight": 700,
                "letter-spacing": "0.02em",
                color: cp.fg,
                "background-color": cp.bg,
                border: `1px solid ${cp.border}`,
                "border-radius": "8px",
                padding: "7px 12px",
                cursor: "pointer",
                "box-shadow": "var(--edge-glass)",
              }}
            >
              {cp.scan ? <ScanOverlay /> : null}
              <span style={{ position: "relative" }}>{cp.label}</span>
            </span>
          )}
        </For>
        <span style={{ width: "1px", height: "26px", "background-color": "var(--border-default)" }} />
        <span
          style={{
            ...badgeBase,
            color: "#fff",
            "background-color": "var(--accent-live)",
            "box-shadow": "var(--edge-glass)",
            animation: "glxPulse 2s ease-in-out infinite",
          }}
        >
          ● LIVE
        </span>
        <span style={{ ...badgeBase, color: CH.vi, border: `1px solid ${CH.vi}` }}>NEW</span>
        <span style={{ ...badgeBase, color: CH.am, border: `1px solid ${CH.am}` }}>DUE</span>
        <span style={{ ...badgeBase, color: CH.rd, border: `1px solid ${CH.rd}` }}>0x3F DEGRADED</span>
        <span
          style={{
            "font-family": MONO,
            "font-size": "11px",
            "font-weight": 700,
            "letter-spacing": "0.02em",
            color: "var(--amber-600)",
            "background-color": "var(--amber-100)",
            "border-radius": "5px",
            padding: "4px 11px 4px 7px",
            "box-shadow": "var(--edge-glass)",
            display: "inline-flex",
            "align-items": "center",
            gap: "5px",
          }}
        >
          <img
            src="/glasselated/streak-flame.png"
            alt=""
            style={{ width: "20px", height: "20px", "image-rendering": "pixelated", "flex-shrink": 0 }}
          />
          12-day streak
        </span>
      </div>
    </Panel>
  );
}

/* ── 04 NAVIGATION ── */
export function SpecPanel04(): JSX.Element {
  return (
    <Panel label="04 // NAVIGATION">
      <div
        style={{
          "max-width": "250px",
          position: "relative",
          overflow: "hidden",
          "background-color": "var(--surface-well-tutor)",
          border: "1px solid var(--well-border)",
          "border-radius": "10px",
          padding: "8px",
        }}
      >
        <ScanOverlay />
        <div style={{ position: "relative", display: "flex", "flex-direction": "column", gap: "6px" }}>
          <For each={NAV_ITEMS}>
            {(nv) => (
              <div
                class={`tgl-nav${nv.on ? " tgl-on" : ""}`}
                style={{
                  display: "flex",
                  "align-items": "center",
                  "border-radius": "6px",
                  padding: "7px 10px",
                  cursor: "pointer",
                  "--nav-fg": nv.fg,
                }}
              >
                <span
                  class="tgl-mark"
                  style={{
                    "font-family": MONO,
                    "font-size": "12px",
                    "font-weight": 600,
                    color: "var(--accent-primary)",
                    width: "14px",
                    "flex-shrink": 0,
                  }}
                >
                  {">"}
                </span>
                <span
                  class="tgl-label"
                  style={{ "font-family": MONO, "font-size": "12px", "font-weight": 600 }}
                >
                  {nv.label}
                </span>
                {nv.badge ? (
                  <span
                    style={{
                      "margin-left": "auto",
                      "font-family": MONO,
                      "font-size": "10px",
                      "font-weight": 700,
                      color: "var(--amber-600)",
                      "background-color": "var(--amber-100)",
                      "border-radius": "999px",
                      padding: "2px 8px",
                    }}
                  >
                    {nv.badge}
                  </span>
                ) : null}
              </div>
            )}
          </For>
        </div>
      </div>
      <div
        style={{
          "margin-top": "16px",
          display: "flex",
          "align-items": "center",
          "justify-content": "space-around",
          "background-color": "var(--surface-panel)",
          "backdrop-filter": "var(--blur-panel)",
          "-webkit-backdrop-filter": "var(--blur-panel)",
          border: "1px solid var(--border-subtle)",
          "border-radius": "999px",
          padding: "8px 10px",
          "max-width": "340px",
          "box-shadow": "var(--edge-glass-surface)",
        }}
      >
        <For each={TAB_ITEMS}>
          {(tb) => (
            <span
              style={{
                display: "flex",
                "flex-direction": "column",
                "align-items": "center",
                gap: "3px",
                "min-width": "52px",
                cursor: "pointer",
              }}
            >
              <PixelIcon name={tb.icon} color={tb.color} />
              <span
                style={{
                  font: "var(--type-micro)",
                  "letter-spacing": "var(--type-micro-track)",
                  color: tb.color,
                }}
              >
                {tb.label}
              </span>
            </span>
          )}
        </For>
      </div>
    </Panel>
  );
}

/* ── 05 STATUS & PROGRESS ── */
export function SpecPanel05(): JSX.Element {
  return (
    <Panel label="05 // STATUS & PROGRESS">
      <div style={{ display: "flex", "align-items": "center", gap: "22px", "flex-wrap": "wrap" }}>
        <div style={{ position: "relative", width: "76px", height: "76px" }}>
          <For each={PIX_RING}>
            {(pb) => (
              <div
                style={{
                  position: "absolute",
                  width: "7px",
                  height: "7px",
                  left: `${pb.x}px`,
                  top: `${pb.y}px`,
                  background: pb.bg,
                  "box-shadow": "var(--edge-glass)",
                  animation: pb.anim,
                }}
              />
            )}
          </For>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              "flex-direction": "column",
              "align-items": "center",
              "justify-content": "center",
            }}
          >
            <span style={{ font: "var(--type-headline)", "letter-spacing": "var(--type-headline-track)" }}>
              3/5
            </span>
            <span
              style={{
                "font-family": MONO,
                "font-size": "8.5px",
                "letter-spacing": "0.1em",
                color: "var(--text-tertiary)",
              }}
            >
              FOCUS
            </span>
          </div>
        </div>
        <div style={{ flex: 1, "min-width": "180px" }}>
          <div style={{ display: "flex", "justify-content": "space-between", "margin-bottom": "6px" }}>
            <span style={{ font: "var(--type-label)", "letter-spacing": "var(--type-label-track)" }}>
              Level 12
            </span>
            <span style={{ "font-family": MONO, "font-size": "10.5px", color: "var(--text-secondary)" }}>
              2,840 / 3,200 XP
            </span>
          </div>
          <div
            style={{
              position: "relative",
              height: "8px",
              "background-color": "var(--surface-inset)",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div style={{ width: "84%", "background-color": "var(--accent-primary)" }} />
            <div
              style={{
                width: "6%",
                "background-image":
                  "repeating-conic-gradient(var(--accent-primary) 0% 25%, transparent 0% 50%)",
                "background-size": "4px 4px",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                "pointer-events": "none",
                "box-shadow": "var(--edge-glass)",
              }}
            />
          </div>
          <div style={{ display: "flex", "align-items": "center", gap: "8px", "margin-top": "14px" }}>
            <div style={{ display: "flex" }}>
              <For each={["avatar-1", "avatar-2", "avatar-3"]}>
                {(av, i) => (
                  <img
                    src={`/glasselated/${av}.png`}
                    alt=""
                    style={{
                      width: "30px",
                      height: "30px",
                      "border-radius": "50%",
                      border: "2px solid var(--surface-raised)",
                      "object-fit": "cover",
                      "margin-left": i() === 0 ? "0" : "-9px",
                    }}
                  />
                )}
              </For>
            </div>
            <span style={{ font: "var(--type-meta)", color: "var(--text-secondary)" }}>
              +214 learning now
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ── 06 CARDS ── */
export function SpecPanel06(): JSX.Element {
  return (
    <Panel label="06 // CARDS">
      <div style={{ display: "grid", "grid-template-columns": "1fr 1fr 1fr", gap: "14px" }}>
        <MeshCard surface="card" variant="ambient" style={{ overflow: "hidden" }}>
          <div
            style={{
              height: "110px",
              "background-image": "url('/glasselated/thumb-1.png')",
              "background-size": "cover",
              "background-position": "center",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                "font-family": MONO,
                "font-size": "9px",
                "font-weight": 700,
                "letter-spacing": "0.12em",
                color: "#fff",
                "background-color": "rgba(10,15,20,0.7)",
                "backdrop-filter": "blur(6px)",
                "-webkit-backdrop-filter": "blur(6px)",
                "border-radius": "5px",
                padding: "3px 8px",
              }}
            >
              SHADERS
            </span>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div
              style={{
                font: "var(--type-headline)",
                "letter-spacing": "var(--type-headline-track)",
                "margin-bottom": "4px",
              }}
            >
              SDF Raymarching
            </div>
            <div
              style={{
                font: "var(--type-body)",
                color: "var(--text-secondary)",
                "line-height": 1.5,
                "margin-bottom": "10px",
              }}
            >
              March a ray through signed distance fields.
            </div>
            <div style={{ "font-family": MONO, "font-size": "10px", color: "var(--text-tertiary)" }}>
              12 lessons · [▮▮▮▮▯▯▯▯▯▯] 40%
            </div>
          </div>
        </MeshCard>
        <For each={CONSOLE_CARDS}>
          {(w) => (
            <MeshCard surface="card" variant={w.variant} amber={w.amber} style={{ overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  "align-items": "center",
                  gap: "8px",
                  padding: "9px 14px",
                  "border-bottom": "1px solid var(--border-subtle)",
                  "background-color": "var(--surface-inset)",
                  "font-family": MONO,
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    "border-radius": "999px",
                    "background-color": w.dot,
                  }}
                />
                <span style={{ "font-size": "10px", color: "var(--text-secondary)" }}>{w.path}</span>
                <span
                  style={{
                    "margin-left": "auto",
                    "font-size": "9.5px",
                    "letter-spacing": "0.1em",
                    color: w.dot,
                  }}
                >
                  {w.state}
                </span>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div
                  style={{
                    font: "var(--type-headline)",
                    "letter-spacing": "var(--type-headline-track)",
                    "margin-bottom": "4px",
                  }}
                >
                  {w.title}
                </div>
                <div
                  style={{
                    font: "var(--type-body)",
                    "line-height": 1.55,
                    color: "var(--text-secondary)",
                    "margin-bottom": "12px",
                  }}
                >
                  {w.desc}
                </div>
                <button
                  type="button"
                  style={{
                    ...btnBase,
                    color: w.btnFg,
                    "background-color": w.btnBg,
                    border: `1px solid ${w.btnBorder}`,
                  }}
                >
                  {w.btn}
                </button>
              </div>
            </MeshCard>
          )}
        </For>
      </div>
    </Panel>
  );
}

/* ── 07 TERMINAL WELLS ── */
export function SpecPanel07(): JSX.Element {
  return (
    <Panel label="07 // TERMINAL WELLS">
      <div style={{ display: "grid", "grid-template-columns": "1.5fr 1fr", gap: "14px" }}>
        <Well style={{ padding: "14px 16px" }}>
          <For each={T3_LOG}>
            {(ln) => (
              <div style={{ "font-size": "11.5px", "line-height": 1.95, color: ln.c }}>
                <span style={{ color: "var(--well-dim)" }}>{ln.t}</span>
                {"  "}
                {ln.msg}
              </div>
            )}
          </For>
          <div style={{ "font-size": "11.5px", "line-height": 1.95, color: "var(--well-hi)" }}>
            {">"} <span class="glx-caret" style={{ "background-color": "var(--well-hi)" }} />
          </div>
        </Well>
        <Well style={{ padding: "13px 15px", "font-size": "11.5px", "line-height": 2.1 }}>
          <span style={{ color: "var(--well-cy)" }}>focus</span>
          <span style={{ color: "var(--well-mid)" }}> [▮▮▮▯▯] 3/5</span>
          <br />
          <span style={{ color: "var(--well-am)" }}>streak</span>
          <span style={{ color: "var(--well-mid)" }}> 12 days · hold</span>
          <br />
          <span style={{ color: "var(--well-vi)" }}>xp</span>
          <span style={{ color: "var(--well-mid)" }}> 2,840 · lvl 12</span>
          <br />
          <span style={{ color: "var(--well-rd)" }}>memory</span>
          <span style={{ color: "var(--well-mid)" }}> cell 0x3F degraded</span>
        </Well>
      </div>
    </Panel>
  );
}

/* ── 08 LIST ROWS ── */
export function SpecPanel08(): JSX.Element {
  return (
    <Panel label="08 // LIST ROWS (reference / live)">
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          "background-color": "var(--surface-well-tutor)",
          border: "1px solid var(--well-border)",
          "border-radius": "10px",
          padding: "8px",
        }}
      >
        <ScanOverlay />
        <div style={{ position: "relative", display: "flex", "flex-direction": "column", gap: "2px" }}>
          <For each={LIST_ROWS}>
            {(lr) => (
              <div
                class="tgl-nav"
                style={{
                  display: "flex",
                  "align-items": "center",
                  gap: "12px",
                  padding: "9px 12px",
                  "border-radius": "6px",
                  cursor: "pointer",
                  "--nav-fg": "var(--text-secondary)",
                }}
              >
                <span
                  class="tgl-mark"
                  style={{
                    "font-family": MONO,
                    "font-size": "12px",
                    "font-weight": 600,
                    color: "var(--accent-primary)",
                    width: "12px",
                    "flex-shrink": 0,
                  }}
                >
                  {">"}
                </span>
                <span
                  class="tgl-label"
                  style={{ "font-family": MONO, "font-size": "12.5px", "font-weight": 600, flex: 1 }}
                >
                  {lr.title}
                </span>
                <span style={{ "font-family": MONO, "font-size": "11px", color: "var(--well-dim)" }}>
                  {lr.meta}
                </span>
                <span
                  style={{
                    "font-family": MONO,
                    "font-size": "9.5px",
                    "font-weight": 700,
                    "letter-spacing": "0.1em",
                    color: lr.tagColor,
                  }}
                >
                  {lr.tag}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
    </Panel>
  );
}

/* ── 09 TYPE ROLES ── */
export function SpecPanel09(): JSX.Element {
  return (
    <Panel label="09 // TYPE ROLES — the closed set">
      <div style={{ display: "flex", "flex-direction": "column", gap: "10px" }}>
        <For each={TYPE_ROLES}>
          {(tr) => (
            <div
              style={{
                display: "flex",
                "align-items": "baseline",
                gap: "16px",
                "border-bottom": "1px solid var(--border-subtle)",
                "padding-bottom": "10px",
              }}
            >
              <span style={{ "font-family": MONO, "font-size": "10px", color: CH.cy, width: "78px" }}>
                {tr.name}
              </span>
              <span style={{ font: tr.font, "letter-spacing": tr.track }}>{tr.sample}</span>
              <span
                style={{
                  font: "var(--type-meta)",
                  color: "var(--text-tertiary)",
                  "margin-left": "auto",
                  "text-align": "right",
                }}
              >
                {tr.spec}
              </span>
            </div>
          )}
        </For>
      </div>
    </Panel>
  );
}

/* Ordered spec panels, keyed by register number — paired with mirror twins on
   the Parity tab. */
export const SPEC_PANELS: readonly { readonly num: string; readonly Spec: () => JSX.Element }[] = [
  { num: "01", Spec: SpecPanel01 },
  { num: "02", Spec: SpecPanel02 },
  { num: "03", Spec: SpecPanel03 },
  { num: "04", Spec: SpecPanel04 },
  { num: "05", Spec: SpecPanel05 },
  { num: "06", Spec: SpecPanel06 },
  { num: "07", Spec: SpecPanel07 },
  { num: "08", Spec: SpecPanel08 },
  { num: "09", Spec: SpecPanel09 },
];
