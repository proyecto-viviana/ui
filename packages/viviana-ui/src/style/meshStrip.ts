/* Woven hex-mesh background generator — the tinted weave the register paints
 * behind glass surfaces (the handoff's `MeshCard`). Ported from the frozen
 * external design repository's framework-neutral `glasselated.js` (see
 * CREDITS.md, "Glasselated design lane"). Pure and SSR-safe: same options,
 * same string, every time — the randomness is a seeded LCG, so a server render
 * and its hydration pass agree byte-for-byte. */

export interface MeshStripOptions {
  readonly dark?: boolean | undefined;
  readonly variant?: "ambient" | "signal" | undefined;
  readonly seed?: number | undefined;
}

/* Returns a `url("data:image/svg+xml,…")` string.
   ambient → quiet mixed gray/blue/orange weave; signal → sharper single-hue amber weave. */
export function meshStrip(opts: MeshStripOptions = {}): string {
  const dark = !!opts.dark;
  const signal = opts.variant === "signal";
  const seed = opts.seed ?? 42;

  let col: string;
  let baseOp: number;
  let mix: readonly [string, string] | null;
  if (signal) {
    col = dark ? "#F9B45C" : "#C96A00";
    baseOp = dark ? 0.075 : 0.09;
    mix = null;
  } else {
    col = dark ? "#8CA3BD" : "#44536A";
    baseOp = dark ? 0.045 : 0.09;
    mix = [dark ? "#6FA8DC" : "#2E6FB8", dark ? "#E8A34F" : "#B86A14"];
  }

  let sd = seed >>> 0;
  const rnd = (): number => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  const p1 = rnd() * 6.28;
  const p2 = rnd() * 6.28;
  const p3 = rnd() * 6.28;

  const r = 7;
  const tw = 1.732 * r;
  const cols = 10;
  const width = +(tw * cols).toFixed(2);
  const height = 168;
  const f2 = (n: number): number => +n.toFixed(2);
  const hexPath = (cx: number, cy: number): string =>
    `M${f2(cx)} ${f2(cy - r)}L${f2(cx + 0.866 * r)} ${f2(cy - r / 2)}` +
    `L${f2(cx + 0.866 * r)} ${f2(cy + r / 2)}L${f2(cx)} ${f2(cy + r)}` +
    `L${f2(cx - 0.866 * r)} ${f2(cy + r / 2)}L${f2(cx - 0.866 * r)} ${f2(cy - r / 2)}Z`;

  let body = "";
  const TAU = 6.28318;
  const nRows = 16;
  for (let row = 0; row * 1.5 * r < height + r; row++) {
    for (let c2 = 0; c2 <= cols; c2++) {
      const cx = c2 * tw + (row % 2 ? tw / 2 : 0);
      const cy = row * 1.5 * r;
      const roll = rnd();
      const opRnd = rnd();
      const colRnd = rnd();
      const blob =
        0.5 + 0.5 * Math.sin((TAU * 2 * c2) / cols + p1) * Math.sin((TAU * row) / nRows + p2);
      const blob2 = 0.5 + 0.5 * Math.sin(TAU * (c2 / cols + row / nRows) + p3);
      const f = 0.35 + 0.65 * (0.6 * blob + 0.4 * blob2);
      if (roll < Math.max(0, 0.28 - f * 0.35)) continue;
      const cc = mix ? (colRnd < 0.74 ? col : colRnd < 0.9 ? mix[0] : mix[1]) : col;
      if (roll > 0.97) {
        body += `<path d='${hexPath(cx, cy)}' fill='${cc}' fill-opacity='${+(baseOp * 0.3 * f).toFixed(3)}' stroke='none'/>`;
      }
      body += `<path d='${hexPath(cx, cy)}' fill='none' stroke='${cc}' stroke-opacity='${+(baseOp * (0.75 + opRnd * 0.35) * f).toFixed(3)}' stroke-width='0.6' stroke-linejoin='round'/>`;
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><g>${body}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
