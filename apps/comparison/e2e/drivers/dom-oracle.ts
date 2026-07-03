import type { Locator, Page } from "@playwright/test";

/**
 * In-page oracle shared by the interaction drivers (D4 event sequence, D5
 * focus/keyboard trails — recertification.md Phase 1).
 *
 * `comparisonOracleInit` is serialized into the page (it must stay fully
 * self-contained: no imports, no outer closures). It installs
 * `window.__comparisonOracle`, which records DOM events at the document root
 * in capture phase and snapshots focus state. Everything it reports is
 * normalized into stack-agnostic descriptors (tag/role/name — never ids or
 * `data-*`, which differ between React and Solid) so React and Solid logs
 * compare with plain JSON equality.
 *
 * Panel attribution: the walk is panel-major (one panel driven per page
 * load), so every interaction-time event belongs to the driven panel. The
 * oracle still classifies targets so chrome noise and the idle panel can
 * never leak asymmetric detail into a log:
 * - `panel`    — inside the driven `.comparison-reference-canvas`
 * - `overlay`  — outside the app shell root (portals: modals, popovers)
 * - `page`     — document/html/body themselves (e.g. keydown with no focus)
 * - `detached` — no longer in the document; a framework that recreates DOM
 *                nodes mid-gesture shows up here, and that IS the finding
 * - `outside`  — the other panel's canvas or the docs chrome; descriptors
 *                collapse to a sentinel so their content is never compared
 *
 * Event entries are serialized at dispatch time (capture phase, before any
 * handler runs) so descriptors reflect the state the input actually hit;
 * only `defaultPrevented` is read lazily at flush, after handlers ran.
 */

export type OracleScope = "panel" | "overlay" | "page" | "detached" | "outside";

export interface OracleElementDescriptor {
  tag: string;
  role: string | null;
  name: string | null;
  scope: OracleScope;
  disabled?: boolean;
  tabindex?: string;
}

export interface OracleRecordedEvent {
  type: string;
  target: OracleElementDescriptor;
  defaultPrevented: boolean;
  isTrusted: boolean;
  key?: string;
  code?: string;
  pointerType?: string;
  button?: number;
  callback?: {
    component: string;
    callback: string;
    pointerType: string | null;
    value: string | null;
  };
}

export interface OracleFocusSnapshot {
  active: OracleElementDescriptor | null;
  activeDescendant: OracleElementDescriptor | null;
  roving: OracleElementDescriptor[];
}

interface ComparisonOracle {
  setPanel(canvas: Element): void;
  start(types: readonly string[]): void;
  flush(): OracleRecordedEvent[];
  snapshotFocus(): OracleFocusSnapshot;
}

declare global {
  interface Window {
    __comparisonOracle?: ComparisonOracle;
  }
}

export function comparisonOracleInit(): void {
  if (window.__comparisonOracle) {
    return;
  }

  let drivenCanvas: Element | null = null;
  let otherCanvases: Element[] = [];
  let shellRoot: Element | null = null;

  const classify = (el: Element): "panel" | "overlay" | "page" | "detached" | "outside" => {
    if (el === document.documentElement || el === document.body) {
      return "page";
    }
    if (!document.documentElement.contains(el)) {
      return "detached";
    }
    if (drivenCanvas?.contains(el)) {
      return "panel";
    }
    if (otherCanvases.some((canvas) => canvas.contains(el))) {
      return "outside";
    }
    if (shellRoot && !shellRoot.contains(el)) {
      return "overlay";
    }
    return "outside";
  };

  const accessibleName = (el: Element): string | null => {
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel) {
      return ariaLabel;
    }
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const text = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" ");
      if (text) {
        return text.slice(0, 60);
      }
    }
    const text = el.textContent?.trim().replace(/\s+/g, " ") ?? "";
    return text ? text.slice(0, 60) : null;
  };

  const describe = (
    target: EventTarget | Element | null,
  ): {
    tag: string;
    role: string | null;
    name: string | null;
    scope: "panel" | "overlay" | "page" | "detached" | "outside";
    disabled?: boolean;
    tabindex?: string;
  } => {
    if (target === document) {
      return { tag: "#document", role: null, name: null, scope: "page" };
    }
    if (!(target instanceof Element)) {
      return { tag: "#unknown", role: null, name: null, scope: "page" };
    }
    const scope = classify(target);
    if (scope === "outside") {
      // Never compare the other panel's / docs chrome's content.
      return { tag: "(outside)", role: null, name: null, scope };
    }
    const entry: ReturnType<typeof describe> = {
      tag: target.tagName.toLowerCase(),
      role: target.getAttribute("role"),
      name: accessibleName(target),
      scope,
    };
    if (target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") {
      entry.disabled = true;
    }
    const tabindex = target.getAttribute("tabindex");
    if (tabindex !== null) {
      entry.tabindex = tabindex;
    }
    return entry;
  };

  interface BufferedEvent {
    event: Event;
    entry: {
      type: string;
      target: ReturnType<typeof describe>;
      defaultPrevented: boolean;
      isTrusted: boolean;
      key?: string;
      code?: string;
      pointerType?: string;
      button?: number;
      callback?: {
        component: string;
        callback: string;
        pointerType: string | null;
        value: string | null;
      };
    };
  }

  let buffer: BufferedEvent[] = [];
  let installed: Array<{ type: string; listener: EventListener }> = [];

  const serialize = (event: Event): BufferedEvent["entry"] => {
    const entry: BufferedEvent["entry"] = {
      type: event.type,
      target: describe(event.target),
      // Placeholder — re-read at flush time so late `preventDefault` calls
      // (bubble-phase handlers) are reflected even though we listen in
      // capture.
      defaultPrevented: event.defaultPrevented,
      isTrusted: event.isTrusted,
    };
    if (event instanceof KeyboardEvent) {
      entry.key = event.key;
      entry.code = event.code;
    }
    if (event instanceof PointerEvent) {
      entry.pointerType = event.pointerType;
      entry.button = event.button;
    } else if (event instanceof MouseEvent) {
      entry.button = event.button;
    }
    if (event instanceof CustomEvent && event.type === "comparison:callback") {
      entry.type = "callback";
      const detail = event.detail as {
        component?: string;
        callback?: string;
        pointerType?: string | null;
        value?: string | null;
      } | null;
      entry.callback = {
        component: detail?.component ?? "",
        callback: detail?.callback ?? "",
        pointerType: detail?.pointerType ?? null,
        value: detail?.value ?? null,
      };
    }
    return entry;
  };

  window.__comparisonOracle = {
    setPanel(canvas: Element) {
      drivenCanvas = canvas;
      otherCanvases = Array.from(document.querySelectorAll(".comparison-reference-canvas")).filter(
        (el) => el !== canvas,
      );
      let root: Element = canvas;
      while (root.parentElement && root.parentElement !== document.body) {
        root = root.parentElement;
      }
      shellRoot = root;
    },

    start(types: readonly string[]) {
      for (const { type, listener } of installed) {
        document.removeEventListener(type, listener, true);
      }
      installed = [];
      buffer = [];
      for (const type of types) {
        const listener: EventListener = (event) => {
          buffer.push({ event, entry: serialize(event) });
        };
        document.addEventListener(type, listener, true);
        installed.push({ type, listener });
      }
    },

    flush() {
      const entries = buffer.map(({ event, entry }) => ({
        ...entry,
        defaultPrevented: event.defaultPrevented,
      }));
      buffer = [];
      for (const { type, listener } of installed) {
        document.removeEventListener(type, listener, true);
      }
      installed = [];
      return entries;
    },

    snapshotFocus() {
      const active =
        document.activeElement && document.activeElement !== document.body
          ? describe(document.activeElement)
          : null;
      let activeDescendant: ReturnType<typeof describe> | null = null;
      const descendantId = document.activeElement?.getAttribute("aria-activedescendant");
      if (descendantId) {
        const el = document.getElementById(descendantId);
        activeDescendant = el ? describe(el) : null;
      }
      const roving = Array.from(document.querySelectorAll("[tabindex]"))
        .map((el) => describe(el))
        .filter((entry) => entry.scope === "panel" || entry.scope === "overlay");
      return { active, activeDescendant, roving };
    },
  };
}

/** Events the D4 recorder captures (plus fixture `comparison:callback`s). */
export const recordedEventTypes = [
  "pointerdown",
  "pointerup",
  "pointercancel",
  "mousedown",
  "mouseup",
  "click",
  "dblclick",
  "contextmenu",
  "touchstart",
  "touchend",
  "focusin",
  "focusout",
  "keydown",
  "keyup",
  "comparison:callback",
] as const;

export async function installOracle(page: Page, canvas: Locator): Promise<void> {
  await page.evaluate(comparisonOracleInit);
  await canvas.evaluate((el) => window.__comparisonOracle!.setPanel(el));
}

export async function startEventRecording(page: Page): Promise<void> {
  await page.evaluate((types) => window.__comparisonOracle!.start(types), [
    ...recordedEventTypes,
  ]);
}

export async function flushEventLog(page: Page): Promise<OracleRecordedEvent[]> {
  return page.evaluate(() => window.__comparisonOracle!.flush());
}

export async function snapshotFocus(page: Page): Promise<OracleFocusSnapshot> {
  return page.evaluate(() => window.__comparisonOracle!.snapshotFocus());
}
