import type { ElementHandle, Locator, Page } from "@playwright/test";

/**
 * RAC `data-rac` is a React-Aria-Components framework marker written by
 * `useRenderProps` onto every RAC host (react-aria-components `utils.tsx:278`).
 * Solid must not emit it. Journey DOM snapshots ignore this attribute so the
 * stacks compare as equal; no other `data-*` is ignored here.
 */
export const ORACLE_IGNORED_DATA_ATTRIBUTES = ["data-rac"] as const;

/**
 * In-page oracle shared by the interaction drivers (D4 event sequence, D5
 * focus/keyboard trails — see `.claude/current/certification.md`).
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

/**
 * One in-scope animation reduced to stack-agnostic motion data (D2 motion —
 * `.claude/current/certification.md`). Everything here is derived from the WAAPI —
 * `getAnimations()` + `effect.getKeyframes()` + `getComputedTiming()` — and
 * normalized so React and Solid compare with plain JSON equality:
 * - the CSS `@keyframes` name is a hashed style-macro output that differs
 *   between stacks, so it is never captured; `property` (the transition
 *   property) and the computed keyframe values ARE captured, since faithful
 *   motion tokens produce identical values in the same Chromium.
 * - `Infinity` (infinite iteration count / active duration) serializes to
 *   `null` under `JSON.stringify`, losing the distinction from a finite value,
 *   so it is mapped to the `"Infinity"` sentinel.
 */
export interface OracleAnimationSnapshot {
  target: OracleElementDescriptor;
  /** "transition" (CSSTransition) or "animation" (CSSAnimation / WAAPI). */
  kind: "transition" | "animation";
  /** The animated property for CSS transitions; null for keyframe animations. */
  property: string | null;
  duration: number | "Infinity";
  delay: number;
  endDelay: number;
  iterations: number | "Infinity";
  direction: string;
  fill: string;
  easing: string;
  keyframes: Array<Record<string, unknown>>;
}

/**
 * One screen-reader announcement observed during a D6 capture window — DOM
 * text inserted into a live region. Everything here is stack-agnostic (the
 * announced string, the region's politeness/role) so React and Solid compare
 * with plain JSON equality. `atMs` is diagnostic only: insertion timing drifts
 * between stacks (the announcer's lazy 100ms first-announce delay lands on
 * different frames), so the D6 driver strips it from the byte-identical
 * assertion — the same rationale that excludes hashed keyframe names in D2.
 */
export interface OracleAnnouncement {
  /** The announced string (resolved through aria-labelledby for object messages). */
  text: string;
  /** The enclosing live region's politeness ("polite" | "assertive" | ""). */
  live: string;
  /** The message node's role, else the live region's role (null when neither). */
  role: string | null;
  /** Oracle scope of the live region (announcers portal to body → "overlay"). */
  scope: OracleScope;
  /** Ms from capture start to insertion; diagnostic — the driver excludes it. */
  atMs: number;
}

interface ComparisonOracle {
  setPanel(canvas: Element): void;
  start(types: readonly string[]): void;
  flush(): OracleRecordedEvent[];
  snapshotFocus(root?: Element | null): OracleFocusSnapshot;
  startFreezer(): void;
  stopFreezer(): void;
  snapshotAnimations(scopes: readonly OracleScope[]): OracleAnimationSnapshot[];
  seekAnimations(scopes: readonly OracleScope[], fraction: number): void;
  startAnnouncements(): void;
  flushAnnouncements(): OracleAnnouncement[];
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
      // Resolve each idref to the referenced element's ACCESSIBLE NAME, not just
      // its textContent — per the ARIA accessible-name computation, a labelledby
      // target contributes its own name, which prioritizes the target's
      // `aria-label` over its subtree text. Without this an icon-only trigger
      // (empty textContent, name carried by its `aria-label`) resolves to "",
      // making a menu labelled `aria-labelledby={triggerId}` (upstream RAC's
      // wiring) look nameless and fall through to its item text — while a menu
      // carrying a literal `aria-label` (the port) reads correctly. Both announce
      // identically to a screen reader; matching that here keeps a pure
      // accessible-name (D6) concern out of the D5 focus-trail diff.
      const text = labelledBy
        .split(/\s+/)
        .map((id) => {
          const ref = document.getElementById(id);
          if (!ref) return "";
          return (ref.getAttribute("aria-label") ?? ref.textContent ?? "").trim();
        })
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

  // --- D2 motion capture ---------------------------------------------------
  // The animated element of a WAAPI animation (KeyframeEffect.target). Returns
  // null for effect-less animations, which we ignore.
  const animationTarget = (anim: Animation): Element | null => {
    const effect = anim.effect;
    if (effect && "target" in effect) {
      const target = (effect as KeyframeEffect).target;
      return target instanceof Element ? target : null;
    }
    return null;
  };

  const inScopeAnimations = (scopes: readonly OracleScope[]): Animation[] => {
    const wanted = new Set(scopes);
    return document.getAnimations().filter((anim) => {
      const target = animationTarget(anim);
      return target !== null && wanted.has(classify(target));
    });
  };

  const normInfinity = (value: number): number | "Infinity" =>
    Number.isFinite(value) ? value : "Infinity";

  // A CSS transition only exists as an `Animation` while it is running (a
  // one-shot enter transition completes in a few hundred ms and vanishes from
  // `getAnimations()`), so the freezer pauses every in-scope animation on each
  // frame of a capture window: started before the interaction that triggers
  // the motion, it catches the transition on the first frame it appears and
  // holds it so the snapshot always sees it — even a delayed-start transition
  // caught during its delay phase.
  let freezing = false;
  const freezeTick = () => {
    if (!freezing) {
      return;
    }
    for (const anim of inScopeAnimations(["panel", "overlay", "page"])) {
      try {
        anim.pause();
      } catch {
        // A finished/detached animation can throw on pause; ignore it.
      }
    }
    requestAnimationFrame(freezeTick);
  };

  // --- D6 live-region announcements ----------------------------------------
  // A screen-reader announcement is DOM text inserted into a live region — an
  // element with aria-live polite/assertive, or an implicit-live role
  // (status/alert/log/…). Both stacks route announcements through a
  // structurally identical live-announcer (a [data-live-announcer] container
  // prepended to body holding two role="log" regions) and every ported live
  // region inserts its message as a child node, so a MutationObserver watching
  // body for childList additions catches each announcement the same way on
  // both stacks. The announced string is resolved through aria-labelledby for
  // object messages (role="img" + labelledby), matching how a screen reader
  // computes it.
  const liveRoles = new Set(["log", "status", "alert", "timer", "marquee"]);
  const liveRegionOf = (el: Element | null): Element | null => {
    let cur: Element | null = el;
    while (cur && cur !== document.body) {
      const live = cur.getAttribute("aria-live");
      if (live === "polite" || live === "assertive") {
        return cur;
      }
      const role = cur.getAttribute("role");
      if (role && liveRoles.has(role)) {
        return cur;
      }
      if (cur.hasAttribute("data-live-announcer")) {
        return cur;
      }
      cur = cur.parentElement;
    }
    return null;
  };
  const announcementText = (node: Element): string => {
    const labelledBy = node.getAttribute("aria-labelledby");
    if (labelledBy) {
      const text = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" ");
      if (text) {
        return text.replace(/\s+/g, " ").trim();
      }
    }
    return (node.textContent ?? "").replace(/\s+/g, " ").trim();
  };
  let announcements: OracleAnnouncement[] = [];
  let announceObserver: MutationObserver | null = null;
  let announceStart = 0;
  const recordAnnouncement = (node: Element) => {
    const region = liveRegionOf(node);
    if (!region) {
      return;
    }
    const text = announcementText(node);
    if (!text) {
      return;
    }
    announcements.push({
      text,
      live: region.getAttribute("aria-live") ?? "",
      role: node.getAttribute("role") ?? region.getAttribute("role"),
      scope: classify(region),
      atMs: Math.round(performance.now() - announceStart),
    });
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

    snapshotFocus(root?: Element | null) {
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
        .filter((el) => {
          // Optional subtree scope: when the scenario pins a `root` (mirrors the
          // contrast/AX `root`), the roving snapshot only counts elements in that
          // subtree (root included). Overlay composites like Menu portal the
          // certified `role="menu"` list INTO a popover surface (a hand-rolled
          // `role="dialog"` wrapper + a Dismiss button) that is a DEFERRED,
          // out-of-this-unit's-scope concern; without a root the whole-overlay
          // scan would fold that surface's roving/name gaps into the list's
          // focus-trail. Scoping to the list keeps the trail about the list.
          if (root && el !== root && !root.contains(el)) {
            return false;
          }
          // The roving snapshot must reflect the tab order a keyboard user
          // actually traverses — not raw DOM tabindex attributes. Skip inert
          // subtrees and anything hidden (display:none / visibility:hidden /
          // content-visibility), e.g. an overflow picker that stays
          // CSS-hidden until the tab list collapses. A hidden [tabindex]
          // element is not sequentially focusable, so counting it produces
          // false focus-trail divergences.
          if (el.closest("[inert]")) {
            return false;
          }
          const candidate = el as unknown as {
            checkVisibility?: (options?: unknown) => boolean;
            offsetParent?: Element | null;
          };
          if (typeof candidate.checkVisibility === "function") {
            return candidate.checkVisibility({
              contentVisibilityAuto: true,
              opacityProperty: false,
              visibilityProperty: true,
            });
          }
          return candidate.offsetParent != null;
        })
        .map((el) => describe(el))
        .filter((entry) => entry.scope === "panel" || entry.scope === "overlay");
      return { active, activeDescendant, roving };
    },

    startFreezer() {
      freezing = true;
      requestAnimationFrame(freezeTick);
    },

    stopFreezer() {
      freezing = false;
      // Resume every animation the freezer paused. The snapshot and any
      // filmstrip seeking both run while the freezer is still active (before
      // this call), so nothing reads animation state after the stop — but a
      // paused enter animation left behind would hang the trigger cleanup: an
      // exit path that awaits `getAnimations().map(a => a.finished)` (React
      // Aria's useExitAnimation) never settles while the enter animation sits
      // paused mid-flight, so the overlay never unmounts. Playing them out lets
      // the enter finish and the exit run normally.
      for (const anim of inScopeAnimations(["panel", "overlay", "page"])) {
        try {
          anim.play();
        } catch {
          // A finished/detached animation can throw on play; ignore it.
        }
      }
    },

    snapshotAnimations(scopes: readonly OracleScope[]) {
      const out: OracleAnimationSnapshot[] = [];
      for (const anim of inScopeAnimations(scopes)) {
        const target = animationTarget(anim);
        const effect = anim.effect as KeyframeEffect | null;
        if (!target || !effect) {
          continue;
        }
        const timing = effect.getComputedTiming();
        const isTransition = typeof CSSTransition !== "undefined" && anim instanceof CSSTransition;
        // `getKeyframes()` yields computed keyframes with stack-neutral values.
        // Drop `composite`/`offset` (kept via `computedOffset`); the CSS
        // `@keyframes` name never appears here, so no hashed macro name leaks.
        const keyframes = effect.getKeyframes().map((frame) => {
          const record = frame as Record<string, unknown> & {
            composite?: unknown;
            offset?: unknown;
            computedOffset?: unknown;
          };
          const { composite: _composite, offset: _offset, computedOffset, ...rest } = record;
          return { offset: computedOffset ?? null, ...rest };
        });
        out.push({
          target: describe(target),
          kind: isTransition ? "transition" : "animation",
          property: isTransition ? (anim as CSSTransition).transitionProperty : null,
          duration: typeof timing.duration === "number" ? normInfinity(timing.duration) : 0,
          delay: timing.delay ?? 0,
          endDelay: timing.endDelay ?? 0,
          iterations: normInfinity(timing.iterations ?? 1),
          direction: (timing as { direction?: string }).direction ?? "normal",
          fill: (timing as { fill?: string }).fill ?? "auto",
          easing: (timing as { easing?: string }).easing ?? "linear",
          keyframes,
        });
      }
      // getAnimations() order is not stable across stacks; sort on the motion's
      // own identity so equal motion sets compare equal regardless of order.
      out.sort((a, b) => {
        const keyOf = (entry: OracleAnimationSnapshot) =>
          [
            entry.target.scope,
            entry.target.tag,
            entry.target.role ?? "",
            entry.target.name ?? "",
            entry.kind,
            entry.property ?? "",
            String(entry.duration),
            String(entry.delay),
          ].join("|");
        return keyOf(a).localeCompare(keyOf(b));
      });
      return out;
    },

    seekAnimations(scopes: readonly OracleScope[], fraction: number) {
      for (const anim of inScopeAnimations(scopes)) {
        const effect = anim.effect as KeyframeEffect | null;
        if (!effect) {
          continue;
        }
        const timing = effect.getComputedTiming();
        const delay = timing.delay ?? 0;
        const duration = typeof timing.duration === "number" ? timing.duration : 0;
        // getComputedTiming returns plain ms numbers, but the DOM lib types
        // activeDuration/endDelay as CSSNumberish; coerce so the arithmetic below
        // is number-typed.
        const activeDuration = Number(timing.activeDuration ?? 0);
        const endDelay = Number(timing.endDelay ?? 0);
        // For an infinite animation (or one whose active duration is infinite),
        // seek within a single iteration; otherwise seek across the whole
        // start-to-finish timeline so f=0 is the pre-delay start and f=1 the end.
        const at =
          !Number.isFinite(activeDuration) || !Number.isFinite(timing.iterations ?? 1)
            ? delay + fraction * duration
            : fraction * (delay + activeDuration + endDelay);
        try {
          anim.pause();
          anim.currentTime = at;
        } catch {
          // Ignore animations that reject an explicit currentTime.
        }
      }
    },

    startAnnouncements() {
      announcements = [];
      announceStart = performance.now();
      announceObserver?.disconnect();
      announceObserver = new MutationObserver((records) => {
        for (const record of records) {
          for (const added of Array.from(record.addedNodes)) {
            if (added instanceof Element) {
              recordAnnouncement(added);
            }
          }
        }
      });
      announceObserver.observe(document.body, { childList: true, subtree: true });
    },

    flushAnnouncements() {
      announceObserver?.disconnect();
      announceObserver = null;
      const out = announcements;
      announcements = [];
      return out;
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
  await page.evaluate((types) => window.__comparisonOracle!.start(types), [...recordedEventTypes]);
}

export async function flushEventLog(page: Page): Promise<OracleRecordedEvent[]> {
  return page.evaluate(() => window.__comparisonOracle!.flush());
}

export async function snapshotFocus(
  page: Page,
  root?: ElementHandle<Element> | null,
): Promise<OracleFocusSnapshot> {
  return page.evaluate((rootEl) => window.__comparisonOracle!.snapshotFocus(rootEl), root ?? null);
}

/** Scopes the motion capture defaults to: the driven panel and its portals. */
export const defaultMotionScopes: readonly OracleScope[] = ["panel", "overlay"];

/** Begins pausing every in-scope animation each frame (D2 motion capture). */
export async function startAnimationFreezer(page: Page): Promise<void> {
  await page.evaluate(() => window.__comparisonOracle!.startFreezer());
}

/** Stops the freezer and resumes every animation it paused (snapshot/seek run before this). */
export async function stopAnimationFreezer(page: Page): Promise<void> {
  await page.evaluate(() => window.__comparisonOracle!.stopFreezer());
}

export async function snapshotAnimations(
  page: Page,
  scopes: readonly OracleScope[] = defaultMotionScopes,
): Promise<OracleAnimationSnapshot[]> {
  return page.evaluate(
    (input) => window.__comparisonOracle!.snapshotAnimations(input),
    [...scopes],
  );
}

/** Pauses every in-scope animation and seeks it to `fraction` of its timeline. */
export async function seekAnimations(
  page: Page,
  fraction: number,
  scopes: readonly OracleScope[] = defaultMotionScopes,
): Promise<void> {
  await page.evaluate(
    (input) => window.__comparisonOracle!.seekAnimations(input.scopes, input.fraction),
    { scopes: [...scopes], fraction },
  );
}

/** Begins recording live-region announcements (D6 announcement transcript). */
export async function startAnnouncements(page: Page): Promise<void> {
  await page.evaluate(() => window.__comparisonOracle!.startAnnouncements());
}

/** Stops recording and returns the ordered announcement transcript. */
export async function flushAnnouncements(page: Page): Promise<OracleAnnouncement[]> {
  return page.evaluate(() => window.__comparisonOracle!.flushAnnouncements());
}
