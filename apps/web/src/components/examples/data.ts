/* Deterministic sample data for the /examples screens.
   Transcribed verbatim from the Terminal Glass design handoff's two screen
   files ("Terminal Glass App" and "Terminal Glass Lab — Home Studies"), with
   the handoff's presentational fields (colour strings, background gradients,
   animation delays) dropped: those are the register's job, not the data's.
   Everything here is a frozen literal — no randomness, no Date.now() — because
   Solid hydration trusts the server DOM, so a value that differed between the
   server render and the client would mismatch on every load. */

/* ── curriculum ────────────────────────────────────────────────────────── */

export type LessonState = "done" | "now" | "todo";

export interface Lesson {
  readonly title: string;
  readonly minutes: number;
  readonly state: LessonState;
}

export const LESSONS: readonly Lesson[] = [
  { title: "cameras", minutes: 8, state: "done" },
  { title: "rasterization", minutes: 6, state: "done" },
  { title: "render eq", minutes: 10, state: "done" },
  { title: "random rays", minutes: 12, state: "now" },
  { title: "brdfs", minutes: 11, state: "todo" },
  { title: "importance", minutes: 14, state: "todo" },
  { title: "roulette", minutes: 7, state: "todo" },
  { title: "denoising", minutes: 9, state: "todo" },
  { title: "real-time gi", minutes: 12, state: "todo" },
];

/* The command bar's working directory and command per screen. */
export const CWDS: Readonly<Record<string, string>> = {
  landing: "~",
  home: "~",
  explore: "~/journeys",
  "explore-empty": "~/journeys",
  lesson: "~/rendering/04",
  theater: "~/rendering/04",
  live: "~/live",
  profile: "~/people/nova",
  settings: "~/.config",
  playground: "~/playground",
};

export const CMDS: Readonly<Record<string, string>> = {
  landing: "akade init",
  home: "today",
  explore: 'index --filter ""',
  "explore-empty": 'index --filter "raytracing"',
  lesson: 'lesson --open "why-random-rays"',
  theater: "lesson --theater",
  live: "join #sdf-live",
  profile: "whoami",
  settings: "edit akaderc",
  playground: "render --interactive",
};

/* ── lesson screen ─────────────────────────────────────────────────────── */

export interface Chapter {
  readonly label: string;
  readonly minutes: number;
  readonly state: LessonState;
}

export const CHAPTERS: readonly Chapter[] = [
  { label: "intro", minutes: 1.2, state: "done" },
  { label: "the estimator", minutes: 2.2, state: "now" },
  { label: "variance", minutes: 2, state: "todo" },
  { label: "fireflies", minutes: 1.6, state: "todo" },
  { label: "denoising", minutes: 1.8, state: "todo" },
  { label: "recap", minutes: 1, state: "todo" },
];

export interface Beat {
  readonly num: string;
  readonly title: string;
  readonly state: LessonState;
}

export const BEATS: readonly Beat[] = [
  { num: "01", title: "the integral", state: "done" },
  { num: "02", title: "random answers", state: "now" },
  { num: "03", title: "convergence", state: "todo" },
  { num: "04", title: "the price", state: "todo" },
  { num: "05", title: "checkpoint", state: "todo" },
];

export const LESSON_TABS: readonly string[] = ["lesson.md", "estimator.glsl ●", "notes", "tutor"];

/* The estimator listing. One string per line, with the highlighted line called
   out separately so no screen has to hard-code an index. */
export const CODE_LINES: readonly string[] = [
  "vec3 estimate(Ray r, int N) {",
  "  vec3 sum = vec3(0.0);",
  "  for (int i = 0; i < N; i++) {",
  "    vec3 dir = sampleHemisphere(rng());",
  "    sum += trace(r, dir) * cosθ / pdf;",
  "  }",
  "  return sum / float(N);  // unbiased",
  "}",
  "// noise ∝ 1/√N  ← the price",
];

/** Index into CODE_LINES that the lesson highlights. */
export const CODE_HIGHLIGHT = 4;

export interface Answer {
  readonly label: string;
  readonly isCorrect: boolean;
}

export const ANSWERS: readonly Answer[] = [
  { label: "2× the samples", isCorrect: false },
  { label: "4× the samples", isCorrect: true },
  { label: "16× the samples", isCorrect: false },
];

export const LESSON_TOGGLES: readonly string[] = ["auto-advance", "captions", "live tutor"];

/* ── theater screen ────────────────────────────────────────────────────── */

export interface TranscriptLine {
  readonly at: string;
  readonly text: string;
}

export const TRANSCRIPT: readonly TranscriptLine[] = [
  { at: "03:41", text: "Think of one pixel. Light reaches it along infinitely many paths." },
  { at: "03:58", text: "We can't integrate that. So we guess — randomly." },
  { at: "04:12", text: "Each guess is wrong. But the errors cancel on average." },
  {
    at: "04:31",
    text: "That's what unbiased means: wrong on every frame, right on average.",
  },
  { at: "04:50", text: "Now the catch: how fast does the average settle?" },
  { at: "05:07", text: "Variance drops as 1/N. Noise, its square root, as 1/√N." },
  { at: "05:24", text: "Halve the noise → four times the samples." },
  { at: "05:40", text: "Which is why every renderer ships a denoiser." },
];

/** Index into TRANSCRIPT that the theater is currently speaking. */
export const TRANSCRIPT_CURRENT = 2;

export const SPEEDS: readonly string[] = ["0.75×", "1.0×", "1.25×", "1.5×", "2.0×"];

/* ── live screen ───────────────────────────────────────────────────────── */

export type LiveState = "live" | "soon" | "todo";

export interface LiveRow {
  readonly title: string;
  readonly when: string;
  readonly host: string;
  readonly tag: string;
  readonly state: LiveState;
  readonly slug: string;
}

export const LIVE_ROWS: readonly LiveRow[] = [
  {
    title: "SDF Raymarching — Live w/ Shader School",
    when: "now · 214",
    host: "mira",
    tag: "● LIVE",
    state: "live",
    slug: "live",
  },
  {
    title: "Tone mapping office hours",
    when: "19:30",
    host: "dev",
    tag: "IN 43M",
    state: "soon",
    slug: "live",
  },
  {
    title: "Importance sampling, pt. 2",
    when: "tomorrow 18:00",
    host: "mira",
    tag: "RSVP",
    state: "todo",
    slug: "explore",
  },
  {
    title: "Community renders review",
    when: "thu 18:00",
    host: "community",
    tag: "",
    state: "todo",
    slug: "explore",
  },
];

export interface ChatLine {
  readonly who: string;
  readonly text: string;
}

export const CHAT: readonly ChatLine[] = [
  { who: "kai", text: "so the step size IS the distance field value?" },
  { who: "mira", text: "exactly — you can never overshoot a surface" },
  { who: "ash", text: "what about thin features though" },
  { who: "lee", text: "^ this. my ribbons vanish" },
  { who: "mira", text: "good q — poll is up, vote then we'll test it" },
  { who: "sys", text: "poll opened · 182 votes" },
  { who: "nova", text: "sphere tracing overshoots nothing but stalls near thin stuff, no?" },
  { who: "kai", text: "stalls = many tiny steps → slow, not wrong" },
  { who: "sys", text: "q&a opens in 04:00" },
];

export interface PollOption {
  readonly label: string;
  readonly votes: number;
}

export const POLL: readonly PollOption[] = [
  { label: "sphere tracing", votes: 61 },
  { label: "fixed-step march", votes: 14 },
  { label: "adaptive step", votes: 25 },
];

/* ── home screen ───────────────────────────────────────────────────────── */

export interface DueCard {
  readonly title: string;
  readonly age: string;
}

export const DUE: readonly DueCard[] = [
  { title: "Radiometry basics", age: "3d" },
  { title: "BRDF energy conservation", age: "2d" },
  { title: "Gamma vs linear", age: "1d" },
  { title: "Firefly clamping", age: "today" },
];

export interface LogLine {
  readonly day: string;
  readonly message: string;
  readonly value: string;
}

export const LOG: readonly LogLine[] = [
  { day: "mon", message: "rendering 03 — the rendering equation", value: "+30 xp" },
  { day: "mon", message: "review · 6 cards", value: "✓" },
  { day: "tue", message: "rendering 04 — started", value: "" },
  { day: "tue", message: "checkpoint 0x3D passed", value: "+30 xp" },
  { day: "tue", message: "firefly detected @ 812,204", value: "warn" },
  { day: "tue", message: "streak → 12 days", value: "" },
  { day: "—", message: "lesson 04 · 8 min left", value: "now" },
];

export interface HomeBeat {
  readonly num: string;
  readonly text: string;
  readonly cmd: string;
  readonly meta: string;
}

export const HOME_BEATS: readonly HomeBeat[] = [
  {
    num: "01",
    text: "You stopped lesson 04 at the estimator. Eight minutes finish it, and the checkpoint is still open.",
    cmd: "resume rendering/04",
    meta: "8 min · +30 xp",
  },
  {
    num: "02",
    text: "Four review cards come due tonight — the oldest is Radiometry Basics. Six minutes, and the streak holds.",
    cmd: "review --due",
    meta: "4 cards · ~6 min",
  },
  {
    num: "03",
    text: "mira is live right now on SDF raymarching with 214 people. Q&A opens in four minutes.",
    cmd: "join #sdf-live",
    meta: "live · 214",
  },
];

/* ── explore screen ────────────────────────────────────────────────────── */

export interface Journey {
  readonly title: string;
  readonly meta: string;
  readonly thumb: string;
  readonly bar: string;
  readonly percent: string;
  readonly slug: string;
}

export const JOURNEYS: readonly Journey[] = [
  {
    title: "Rendering",
    meta: "9 lessons · lesson 04 next",
    thumb: "/examples/thumb-1.png",
    bar: "[▮▮▮▮▯▯▯▯▯]",
    percent: "44%",
    slug: "lesson",
  },
  {
    title: "Color Spaces",
    meta: "8 lessons · started mon",
    thumb: "/examples/thumb-5.png",
    bar: "[▮▮▯▯▯▯▯▯▯]",
    percent: "25%",
    slug: "explore",
  },
  {
    title: "Shaders",
    meta: "12 lessons · complete",
    thumb: "/examples/thumb-6.png",
    bar: "[▮▮▮▮▮▮▮▮▮]",
    percent: "100%",
    slug: "explore",
  },
];

export const EXPLORE_CHIPS: readonly string[] = [
  "all",
  "#graphics",
  "#pathtracing",
  "#colorspaces",
  "#shaders",
  "● live",
];

export interface Tile {
  readonly title: string;
  readonly thumb: string;
  readonly tag: string;
  readonly meta: string;
  readonly percent: string;
}

export const TILES: readonly Tile[] = [
  {
    title: "Color Spaces",
    thumb: "/examples/thumb-5.png",
    tag: "IN PROGRESS · 2 / 8",
    meta: "8 lessons",
    percent: "25%",
  },
  {
    title: "Shaders",
    thumb: "/examples/thumb-6.png",
    tag: "COMPLETE",
    meta: "12 lessons",
    percent: "100%",
  },
  {
    title: "Raymarching",
    thumb: "/examples/thumb-4.png",
    tag: "● LIVE TODAY",
    meta: "6 lessons · w/ shader school",
    percent: "new",
  },
  {
    title: "Denoising",
    thumb: "/examples/thumb-7.png",
    tag: "LOCKED · AFTER RENDERING",
    meta: "5 lessons",
    percent: "—",
  },
];

/* ── profile screen ────────────────────────────────────────────────────── */

export interface Stat {
  readonly label: string;
  readonly value: string;
}

export const PROFILE_STATS: readonly Stat[] = [
  { label: "XP", value: "2,840" },
  { label: "LESSONS", value: "38" },
  { label: "STREAK", value: "12d" },
  { label: "RENDERS", value: "116" },
];

export interface Badge {
  readonly name: string;
  readonly glyph: string;
  readonly isLocked: boolean;
}

export const BADGES: readonly Badge[] = [
  { name: "first render", glyph: "▣", isLocked: false },
  { name: "1k samples", glyph: "∑", isLocked: false },
  { name: "no fireflies", glyph: "✦", isLocked: false },
  { name: "30-day streak", glyph: "▲", isLocked: false },
  { name: "helper", glyph: "☺", isLocked: false },
  { name: "night owl", glyph: "☾", isLocked: false },
  { name: "locked", glyph: "░", isLocked: true },
  { name: "locked", glyph: "░", isLocked: true },
];

/* The contribution heat map: 182 cells (26 weeks × 7 days) bucketed into four
   levels. The handoff generated these from a closed-form seed rather than a
   random walk; the same expression is evaluated once here so the array is a
   constant and the server and client agree cell for cell. */
export const HEAT: readonly number[] = Array.from({ length: 182 }, (_, i) => {
  const week = Math.floor(i / 7);
  const day = i % 7;
  const wave = 0.5 + 0.5 * Math.sin(week * 0.9 + day * 1.7) * Math.cos(week * 0.37 + 1.1);
  const jitter = (((i * 2654435761) >>> 0) % 100) / 100;
  const k = wave * 0.7 + jitter * 0.3;
  return k < 0.32 ? 0 : k < 0.55 ? 1 : k < 0.78 ? 2 : 3;
});

/* ── settings screen ───────────────────────────────────────────────────── */

export type RcKind = "comment" | "blank" | "text" | "toggle" | "segments";

export interface RcLine {
  readonly num: number;
  readonly key: string;
  readonly kind: RcKind;
  readonly value?: string;
  readonly options?: readonly string[];
  readonly selected?: number;
  readonly isOn?: boolean;
  readonly note?: string;
  readonly isUnsaved?: boolean;
}

export const RC_LINES: readonly RcLine[] = [
  { num: 1, key: "# appearance", kind: "comment" },
  { num: 2, key: "theme", kind: "segments", options: ["dark", "light", "system"], selected: 0 },
  {
    num: 3,
    key: "display.shape",
    kind: "segments",
    options: ["square", "circle", "grid", "line"],
    selected: 0,
    note: "Geist Pixel ELSH",
  },
  { num: 4, key: "glass.blur", kind: "segments", options: ["off", "soft", "deep"], selected: 2 },
  { num: 5, key: "scanlines", kind: "toggle", value: "on", isOn: true },
  { num: 6, key: "", kind: "blank" },
  { num: 7, key: "# focus", kind: "comment" },
  {
    num: 8,
    key: "focus.blocks",
    kind: "text",
    value: "5",
    note: "● unsaved",
    isUnsaved: true,
  },
  { num: 9, key: "focus.minutes", kind: "text", value: "25" },
  { num: 10, key: "focus.quiet_hours", kind: "text", value: "23:00 → 08:00" },
  { num: 11, key: "", kind: "blank" },
  { num: 12, key: "# tutor", kind: "comment" },
  { num: 13, key: "tutor.attach", kind: "toggle", value: "on lesson open", isOn: true },
  {
    num: 14,
    key: "tutor.voice",
    kind: "segments",
    options: ["terse", "friendly", "socratic"],
    selected: 0,
  },
  {
    num: 15,
    key: "tutor.hints",
    kind: "toggle",
    value: "off",
    isOn: false,
    note: "● unsaved",
    isUnsaved: true,
  },
  { num: 16, key: "", kind: "blank" },
  { num: 17, key: "# notify", kind: "comment" },
  { num: 18, key: "notify.due", kind: "toggle", value: "18:00 daily", isOn: true },
  { num: 19, key: "notify.live", kind: "toggle", value: "followed hosts only", isOn: true },
];

/* ── playground screen ─────────────────────────────────────────────────── */

export interface Param {
  readonly key: string;
  readonly value: string;
  readonly fill: number;
}

export const PARAMS: readonly Param[] = [
  { key: "samples", value: "6,000", fill: 0.6 },
  { key: "bounces", value: "8", fill: 0.4 },
  { key: "clamp", value: "∞", fill: 1 },
  { key: "roughness", value: "0.32", fill: 0.32 },
  { key: "exposure", value: "+0.5 ev", fill: 0.55 },
];

export const SHAPES: readonly string[] = ["square", "circle", "grid", "triangle", "line"];

/* ── landing screen ────────────────────────────────────────────────────── */

export interface LandLogLine {
  readonly at: string;
  readonly message: string;
}

export const LAND_LOG: readonly LandLogLine[] = [
  { at: "18:47", message: "nova · rendering 04 · 1,204 spp" },
  { at: "18:47", message: "kai · checkpoint passed ✓" },
  { at: "18:47", message: "mira · live: sdf raymarching" },
  { at: "18:47", message: "ash · variance 0.0031" },
  { at: "18:47", message: "lee · warn: firefly @ 812,204" },
  { at: "18:47", message: "you · $ akade init _" },
];

export interface LandCard {
  readonly tag: string;
  readonly title: string;
  readonly meta: string;
  readonly thumb: string;
  readonly slug: string;
}

export const LAND_CARDS: readonly LandCard[] = [
  {
    tag: "JOURNEY · 9 LESSONS",
    title: "Rendering",
    meta: "monte carlo → denoising",
    thumb: "/examples/thumb-1.png",
    slug: "lesson",
  },
  {
    tag: "JOURNEY · 8 LESSONS",
    title: "Color Spaces",
    meta: "gamuts, gamma, oklch",
    thumb: "/examples/thumb-5.png",
    slug: "explore",
  },
  {
    tag: "● LIVE · 214",
    title: "SDF Raymarching",
    meta: "w/ shader school · now",
    thumb: "/examples/thumb-4.png",
    slug: "live",
  },
];
