// Local addition — no S2 counterpart. See the JSDoc on TerminalLog below.

import { type JSX, For, Show, splitProps } from "solid-js";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { bootIn as bootInKeyframes, tglCaret } from "../style/motion" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import { getAllowedOverrides, wellScan } from "../s2-internal/style-utils" with { type: "macro" };

/**
 * The ink a log line (or one span of it) reports in. The four status channels are
 * the register's shared ones; `prompt` is the shell's own blue and `muted` the
 * well's recessive grey.
 */
export type TerminalLogChannel = "info" | "signal" | "metric" | "fault" | "prompt" | "muted";

export interface TerminalLogSpan {
  /** The span's text. */
  text: string;
  /** The channel this span reports in. Defaults to the line's channel. */
  channel?: TerminalLogChannel;
}

export interface TerminalLogLine {
  /** A timestamp, rendered in a `<time>` ahead of the text. */
  time?: string;
  /** The line's text. Ignored when `spans` is given. */
  text?: string;
  /** The line split into per-channel runs — a command and its result on one line. */
  spans?: TerminalLogSpan[];
  /** The channel the whole line reports in. @default undefined (the well's ink) */
  channel?: TerminalLogChannel;
}

export interface TerminalLogProps {
  /** The lines, oldest first. */
  lines: readonly TerminalLogLine[];
  /** Draw a blinking block caret after the last line. @default false */
  showCaret?: boolean;
  /** Boot the lines in one after another on mount. @default false */
  bootIn?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/* The handoff's boot log types its lines in 0.28s apart after a 0.3s beat
 * (design_handoff_terminal_glass, Terminal Glass App.dc.html). Both live here so a
 * test can name them and so the two numbers cannot drift apart across call sites. */
const BOOT_DELAY_BASE = 0.3;
const BOOT_DELAY_STEP = 0.28;

const lineBoot = bootInKeyframes();
const caretBlink = tglCaret();

const logStyles = style(
  {
    /* The matte plate, same recipe as Well: opaque surface, hairline, 4px scan
     * dither. A terminal log is never glass (design-handoff-v2.css:56). */
    display: "block",
    listStyleType: "none",
    margin: 0,
    backgroundColor: "well",
    ...wellScan(),
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "well-border",
    borderRadius: "default",
    paddingX: 12,
    paddingY: 8,
    font: "code-sm",
    color: "[var(--terminal-mid)]",
    overflowX: "auto",
  },
  getAllowedOverrides({ height: true }),
);

type LineStyleState = { channel: TerminalLogChannel | "none"; isBooting: boolean };

const channelInk = {
  default: "[var(--terminal-mid)]",
  channel: {
    info: "[var(--status-info)]",
    signal: "[var(--status-signal)]",
    metric: "[var(--status-metric)]",
    fault: "[var(--status-fault)]",
    prompt: "[var(--terminal-prompt)]",
    muted: "[var(--terminal-dim)]",
    none: "[var(--terminal-mid)]",
  },
  forcedColors: "ButtonText",
} as const;

const lineStyles = style<LineStyleState>({
  display: "block",
  whiteSpace: "pre",
  lineHeight: "ui",
  color: channelInk,
  /* The boot reveal is a one-frame step: the line is absent, then it is there —
   * a terminal does not fade. `both` keeps it hidden through its delay, which is
   * what staggers the log. The gate is the CSS media condition, never a runtime
   * matchMedia read: with reduced motion the animation name goes to `none`, the
   * fill-mode never applies, and every line is simply present. */
  animation: {
    isBooting: {
      default: lineBoot,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  animationDuration: {
    isBooting: 10,
  },
  animationTimingFunction: {
    isBooting: "[step-end]",
  },
  animationFillMode: {
    isBooting: "both",
  },
});

const spanStyles = style<{ channel: TerminalLogChannel | "none" }>({
  color: channelInk,
});

const timeStyles = style({
  color: "[var(--terminal-dim)]",
  marginEnd: 8,
});

const caretStyles = style({
  display: "inline-block",
  width: 7,
  height: 12,
  verticalAlign: "[-2px]",
  backgroundColor: "[var(--terminal-prompt)]",
  animation: {
    default: caretBlink,
    "@media (prefers-reduced-motion: reduce)": "none",
  },
  animationDuration: 1100,
  animationTimingFunction: "[step-end]",
  animationIterationCount: "infinite",
});

/**
 * A terminal transcript on the register's matte well — timestamps, per-channel
 * ink, an optional boot-in stagger and a blinking caret.
 *
 * Local addition — no S2 counterpart. It is static content, not a live region:
 * the lines render as an ordered list (`<ol>`/`<li>`, timestamps in `<time>`), so
 * a reader gets the transcript in order and on demand. A caller streaming lines in
 * and needing them announced should own that live region itself.
 */
export function TerminalLog(props: TerminalLogProps): JSX.Element {
  const [local] = splitProps(props, [
    "lines",
    "showCaret",
    "bootIn",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "id",
    "aria-label",
    "aria-labelledby",
  ]);
  const resolvedStyles = () => (typeof local.styles === "function" ? local.styles() : local.styles);
  const isBooting = () => local.bootIn ?? false;
  const lineState = (line: TerminalLogLine): LineStyleState => ({
    channel: line.channel ?? "none",
    isBooting: isBooting(),
  });

  return (
    <ol
      id={local.id}
      aria-label={local["aria-label"]}
      aria-labelledby={local["aria-labelledby"]}
      class={[local.UNSAFE_className, logStyles(null, resolvedStyles())].filter(Boolean).join(" ")}
      style={local.UNSAFE_style}
    >
      <For each={local.lines}>
        {(line, index) => (
          <li
            class={lineStyles(lineState(line))}
            style={
              isBooting()
                ? {
                    "animation-delay": `${(BOOT_DELAY_BASE + index() * BOOT_DELAY_STEP).toFixed(2)}s`,
                  }
                : undefined
            }
          >
            <Show when={line.time != null}>
              <time class={timeStyles}>{line.time}</time>
            </Show>
            <Show when={line.spans} fallback={line.text}>
              <For each={line.spans}>
                {(span) => (
                  <span class={spanStyles({ channel: span.channel ?? line.channel ?? "none" })}>
                    {span.text}
                  </span>
                )}
              </For>
            </Show>
          </li>
        )}
      </For>
      <Show when={local.showCaret}>
        {/* The caret is the cursor waiting for the next line — a mark, not a line
         * of the transcript, so it carries no text for a reader. */}
        <li aria-hidden="true" class={lineStyles({ channel: "none", isBooting: false })}>
          <span class={caretStyles} />
        </li>
      </Show>
    </ol>
  );
}
