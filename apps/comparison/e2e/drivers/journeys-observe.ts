import type { Locator, Page } from "@playwright/test";
import {
  flushEventLog,
  snapshotFocus,
  type OracleElementDescriptor,
  type OracleRecordedEvent,
} from "./dom-oracle";
import type { PanelContext } from "./scenario";

/**
 * Per-step observation collected from the driven panel. Every field is
 * stack-agnostic and JSON-equality comparable (screenshot buffers live beside
 * this object, not inside it).
 */
export interface DomNodeSnapshot {
  tag: string;
  role: string | null;
  name: string | null;
  disabled?: boolean;
  tabindex?: string;
  /** All aria-* attributes; IDREFs resolved to `role:name` so generated ids drop out. */
  aria: Record<string, string>;
  /** Allowlisted RAC state `data-*` only — see `RAC_STATE_DATA_ATTRIBUTES`. */
  data: Record<string, string>;
  children: DomNodeSnapshot[];
}

export interface OverlayGeometry {
  /** Overlay top-left minus trigger top-left, CSS px, rounded. */
  dx: number;
  dy: number;
  /** Inferred from overlay center vs trigger center. */
  placement: "top" | "bottom" | "left" | "right";
  /** Overlay width minus trigger width, CSS px, rounded. */
  widthDelta: number;
  insideViewport: boolean;
  opacity: string;
  visibility: string;
  transform: string;
  pointerEvents: string;
  zIndex: string;
}

export interface ListObservation {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  focusedOptionInView: boolean | null;
  optionCount: number;
}

export interface InputObservation {
  value: string;
  selectionStart: number | null;
  selectionEnd: number | null;
}

export interface FocusObservation {
  active: OracleElementDescriptor | null;
  activeDescendant: OracleElementDescriptor | null;
  /** Whether the active element matches `:focus-visible`. */
  focusVisible: boolean;
}

export interface EventObservation {
  type: string;
  target: OracleElementDescriptor;
  defaultPrevented: boolean;
}

export interface AxObservation {
  tree: string | null;
  live: Array<{ live: string; role: string | null; text: string }>;
}

export interface DocumentObservation {
  overflow: string;
  paddingRight: string;
  ariaHiddenSiblingCount: number;
}

export interface PixelObservation {
  width: number;
  height: number;
}

export interface StepObservation {
  step: { index: number; label: string };
  error: string | null;
  dom: { panel: DomNodeSnapshot | null; overlay: DomNodeSnapshot | null };
  form: Record<string, string>;
  input: InputObservation | null;
  focus: FocusObservation;
  overlay: OverlayGeometry[];
  list: ListObservation | null;
  events: EventObservation[];
  ax: AxObservation;
  document: DocumentObservation;
  pixel: PixelObservation | null;
}

export interface CollectedPanel {
  observations: StepObservation[];
  /** Overlay-region PNGs, aligned with observations that have `pixel`. */
  pixels: Array<Buffer | null>;
}

const IDREF_ARIA = [
  "aria-labelledby",
  "aria-describedby",
  "aria-controls",
  "aria-owns",
  "aria-activedescendant",
  "aria-details",
  "aria-errormessage",
  "aria-flowto",
] as const;

const LEAF_TAGS = new Set(["svg", "img", "input", "textarea", "hr", "br", "path", "use"]);

interface InPageObservation {
  dom: StepObservation["dom"];
  form: Record<string, string>;
  input: InputObservation | null;
  focusVisible: boolean;
  overlay: OverlayGeometry[];
  list: ListObservation | null;
  document: DocumentObservation;
  live: AxObservation["live"];
  overlayPresent: boolean;
}

function projectEvents(events: OracleRecordedEvent[]): EventObservation[] {
  return events.map((entry) => ({
    type: entry.type,
    target: entry.target,
    defaultPrevented: entry.defaultPrevented,
  }));
}

export async function collectStepObservation(
  ctx: PanelContext,
  trigger: Locator,
  index: number,
  label: string,
  error: string | null,
  allowlist: readonly string[],
): Promise<{ observation: StepObservation; png: Buffer | null }> {
  const events = projectEvents(await flushEventLog(ctx.page));
  const canvasHandle = await ctx.canvas.elementHandle();
  const triggerHandle = await trigger.elementHandle();
  if (!canvasHandle) {
    throw new Error("Journey panel canvas has no element handle");
  }
  const inPage: InPageObservation = await ctx.page.evaluate(
    ({ canvas, triggerEl, allowlist, idrefs, leafTags }) => {
      const allow = new Set(allowlist);
      const idrefSet = new Set(idrefs);
      const leaves = new Set(leafTags);

      const classify = (el: Element): "panel" | "overlay" | "page" | "other" => {
        if (el === document.documentElement || el === document.body) {
          return "page";
        }
        if (canvas && canvas.contains(el)) {
          return "panel";
        }
        const canvases = Array.from(document.querySelectorAll(".comparison-reference-canvas"));
        if (canvases.some((node) => node !== canvas && node.contains(el))) {
          return "other";
        }
        let root: Element | null = canvas;
        while (root?.parentElement && root.parentElement !== document.body) {
          root = root.parentElement;
        }
        if (root && !root.contains(el)) {
          return "overlay";
        }
        return "other";
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
            .map((id) => {
              const ref = document.getElementById(id);
              if (!ref) {
                return "";
              }
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

      const resolveIdrefs = (el: Element, attr: string): string => {
        const raw = el.getAttribute(attr);
        if (!raw) {
          return "";
        }
        return raw
          .split(/\s+/)
          .map((id) => {
            const ref = document.getElementById(id);
            if (!ref) {
              return "(missing)";
            }
            const role = ref.getAttribute("role") ?? ref.tagName.toLowerCase();
            const name = accessibleName(ref) ?? "";
            return `${role}:${name}`;
          })
          .join(" ");
      };

      const formTags = new Set(["button", "select", "textarea", "option"]);
      const widgetNameRoles = new Set([
        "combobox",
        "listbox",
        "option",
        "button",
        "dialog",
        "status",
        "alert",
      ]);

      interface NodeSnap {
        tag: string;
        role: string | null;
        name: string | null;
        disabled?: boolean;
        tabindex?: string;
        aria: Record<string, string>;
        data: Record<string, string>;
        children: NodeSnap[];
      }

      const snapshotTree = (el: Element): NodeSnap => {
        const aria: Record<string, string> = {};
        const data: Record<string, string> = {};
        for (const attr of Array.from(el.attributes)) {
          if (attr.name.startsWith("aria-")) {
            aria[attr.name] = idrefSet.has(attr.name) ? resolveIdrefs(el, attr.name) : attr.value;
          } else if (allow.has(attr.name)) {
            data[attr.name] = attr.value;
          }
        }
        const role = el.getAttribute("role");
        const named =
          (role != null && widgetNameRoles.has(role)) ||
          Boolean(el.getAttribute("aria-label")) ||
          Boolean(el.getAttribute("aria-labelledby"));
        const entry: NodeSnap = {
          tag: el.tagName.toLowerCase(),
          role,
          name: named ? accessibleName(el) : null,
          aria,
          data,
          children: [],
        };
        if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") {
          entry.disabled = true;
        }
        const tabindex = el.getAttribute("tabindex");
        if (tabindex !== null) {
          entry.tabindex = tabindex;
        }
        const tag = el.tagName.toLowerCase();
        if (!leaves.has(tag)) {
          for (const child of Array.from(el.children)) {
            if (child.tagName === "SCRIPT" || child.tagName === "STYLE") {
              continue;
            }
            entry.children.push(snapshotTree(child));
          }
        }
        return entry;
      };

      const isSignificant = (node: NodeSnap): boolean => {
        const presentationOnly =
          node.role === "presentation" &&
          !node.tabindex &&
          !node.disabled &&
          Object.keys(node.aria).length === 0 &&
          Object.keys(node.data).length === 0;
        if (presentationOnly) {
          return false;
        }
        return Boolean(
          node.role ||
          node.tabindex ||
          node.disabled ||
          Object.keys(node.aria).length > 0 ||
          Object.keys(node.data).length > 0 ||
          formTags.has(node.tag),
        );
      };
      // Hoist presentational wrappers (React portal <template>, extra layout
      // divs, the comparison fixture <form>) so the tree is the RAC contract:
      // role / aria-* / allowlisted data-* / form controls. Tag differences on
      // those contract nodes still fail.
      const flatten = (node: NodeSnap): NodeSnap[] => {
        const kids = node.children.flatMap(flatten);
        if (isSignificant(node)) {
          return [{ ...node, children: kids }];
        }
        return kids;
      };

      const listboxes = Array.from(document.querySelectorAll('[role="listbox"]')).filter(
        (el) => classify(el) === "overlay" || classify(el) === "panel",
      );
      const overlayRoots = (() => {
        const placed = Array.from(document.querySelectorAll("[data-placement]")).filter(
          (el) => classify(el) === "overlay",
        );
        const fromLists = listboxes.map((lb) => lb.closest("[data-placement]") ?? lb);
        const seen = new Set<Element>();
        const out: Element[] = [];
        for (const el of [...placed, ...fromLists]) {
          if (seen.has(el)) {
            continue;
          }
          seen.add(el);
          out.push(el);
        }
        return out;
      })();

      const triggerRect = triggerEl?.getBoundingClientRect() ?? null;
      const round = (n: number) => Math.round(n);

      const overlay = overlayRoots.map((root) => {
        const rect = root.getBoundingClientRect();
        const style = getComputedStyle(root);
        const t = triggerRect ?? { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0 };
        const ocx = rect.x + rect.width / 2;
        const ocy = rect.y + rect.height / 2;
        const tcx = t.x + t.width / 2;
        const tcy = t.y + t.height / 2;
        const ddx = ocx - tcx;
        const ddy = ocy - tcy;
        const placement: "top" | "bottom" | "left" | "right" =
          Math.abs(ddy) >= Math.abs(ddx)
            ? ddy >= 0
              ? "bottom"
              : "top"
            : ddx >= 0
              ? "right"
              : "left";
        return {
          dx: round(rect.x - t.x),
          dy: round(rect.y - t.y),
          placement,
          widthDelta: round(rect.width - t.width),
          insideViewport:
            rect.x >= 0 &&
            rect.y >= 0 &&
            rect.x + rect.width <= window.innerWidth &&
            rect.y + rect.height <= window.innerHeight,
          opacity: style.opacity,
          visibility: style.visibility,
          transform: style.transform,
          pointerEvents: style.pointerEvents,
          zIndex: style.zIndex,
        };
      });

      let list: {
        scrollTop: number;
        scrollHeight: number;
        clientHeight: number;
        focusedOptionInView: boolean | null;
        optionCount: number;
      } | null = null;
      const listbox = listboxes[0];
      if (listbox instanceof HTMLElement) {
        const options = Array.from(listbox.querySelectorAll('[role="option"]'));
        const focused =
          listbox.querySelector('[role="option"][data-focused]') ??
          listbox.querySelector('[role="option"][aria-selected="true"]');
        let focusedOptionInView: boolean | null = null;
        if (focused instanceof Element) {
          const l = listbox.getBoundingClientRect();
          const o = focused.getBoundingClientRect();
          focusedOptionInView = o.bottom > l.top && o.top < l.bottom;
        }
        list = {
          scrollTop: round(listbox.scrollTop),
          scrollHeight: round(listbox.scrollHeight),
          clientHeight: round(listbox.clientHeight),
          focusedOptionInView,
          optionCount: options.length,
        };
      }

      const formValues: Record<string, string> = {};
      const formHost = canvas;
      if (formHost) {
        const form = formHost.closest("form") ?? formHost.querySelector("form");
        if (form instanceof HTMLFormElement) {
          for (const [name, value] of new FormData(form).entries()) {
            if (typeof value === "string") {
              formValues[name] = value;
            }
          }
        }
        for (const field of Array.from(
          formHost.querySelectorAll("select[name], input[name], textarea[name]"),
        )) {
          if (!(field instanceof HTMLSelectElement || field instanceof HTMLInputElement)) {
            continue;
          }
          if (field.name && !(field.name in formValues)) {
            formValues[field.name] = field.value;
          }
        }
      }

      let input: InPageObservation["input"] = null;
      const active = document.activeElement;
      const textInput =
        active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement
          ? active
          : canvas?.querySelector("input:not([type=hidden]), textarea");
      if (textInput instanceof HTMLInputElement || textInput instanceof HTMLTextAreaElement) {
        input = {
          value: textInput.value,
          selectionStart: textInput.selectionStart,
          selectionEnd: textInput.selectionEnd,
        };
      }

      const focusVisible =
        document.activeElement instanceof Element &&
        document.activeElement !== document.body &&
        document.activeElement.matches(":focus-visible");

      const bodyStyle = getComputedStyle(document.body);
      const overlayRoot = overlayRoots[0];
      let ariaHiddenSiblingCount = 0;
      if (overlayRoot?.parentElement) {
        ariaHiddenSiblingCount = Array.from(overlayRoot.parentElement.children).filter(
          (sib) => sib !== overlayRoot && sib.getAttribute("aria-hidden") === "true",
        ).length;
      }

      const live: InPageObservation["live"] = [];
      for (const node of Array.from(
        document.querySelectorAll("[aria-live], [role='status'], [role='alert']"),
      )) {
        const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
        if (!text) {
          continue;
        }
        live.push({
          live: node.getAttribute("aria-live") ?? "",
          role: node.getAttribute("role"),
          text: text.slice(0, 120),
        });
      }

      return {
        dom: {
          panel: canvas
            ? {
                tag: "panel",
                role: null,
                name: null,
                aria: {},
                data: {},
                children: flatten(snapshotTree(canvas)),
              }
            : null,
          overlay: overlayRoots[0]
            ? (() => {
                const tree = snapshotTree(overlayRoots[0]);
                const flat = flatten(tree);
                return flat.length === 1
                  ? flat[0]!
                  : {
                      tag: "overlay",
                      role: null,
                      name: null,
                      aria: {},
                      data: {},
                      children: flat,
                    };
              })()
            : null,
        },
        form: formValues,
        input,
        focusVisible,
        overlay,
        list,
        document: {
          overflow: bodyStyle.overflow,
          paddingRight: bodyStyle.paddingRight,
          ariaHiddenSiblingCount,
        },
        live,
        overlayPresent: overlayRoots.length > 0 || listboxes.length > 0,
      };
    },
    {
      canvas: canvasHandle,
      triggerEl: triggerHandle,
      allowlist: [...allowlist],
      idrefs: [...IDREF_ARIA],
      leafTags: [...LEAF_TAGS],
    },
  );

  canvasHandle?.dispose();
  triggerHandle?.dispose();

  const focusSnap = await snapshotFocus(ctx.page);
  let axTree: string | null = null;
  if (inPage.overlayPresent) {
    const overlayLocator = overlayRootLocator(ctx.page);
    if ((await overlayLocator.count()) > 0) {
      try {
        axTree = await overlayLocator.first().ariaSnapshot();
      } catch {
        axTree = null;
      }
    }
  }

  let png: Buffer | null = null;
  let pixel: PixelObservation | null = null;
  const overlayLocator = overlayRootLocator(ctx.page);
  if ((await overlayLocator.count()) > 0) {
    const target = overlayLocator.first();
    const box = await target.boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      try {
        png = await target.screenshot({ animations: "disabled" });
        pixel = { width: Math.round(box.width), height: Math.round(box.height) };
      } catch {
        png = null;
        pixel = { width: Math.round(box.width), height: Math.round(box.height) };
      }
    }
  }

  return {
    observation: {
      step: { index, label },
      error,
      dom: inPage.dom,
      form: inPage.form,
      input: inPage.input,
      focus: {
        active: focusSnap.active,
        activeDescendant: focusSnap.activeDescendant,
        focusVisible: inPage.focusVisible,
      },
      overlay: inPage.overlay,
      list: inPage.list,
      events,
      ax: { tree: axTree, live: inPage.live },
      document: inPage.document,
      pixel,
    },
    png,
  };
}

export function overlayRootLocator(page: Page): Locator {
  const placed = page.locator("[data-placement]");
  const listbox = page.getByRole("listbox");
  return placed.or(listbox);
}

export function emptyObservation(index: number, label: string, error: string): StepObservation {
  return {
    step: { index, label },
    error,
    dom: { panel: null, overlay: null },
    form: {},
    input: null,
    focus: { active: null, activeDescendant: null, focusVisible: false },
    overlay: [],
    list: null,
    events: [],
    ax: { tree: null, live: [] },
    document: { overflow: "", paddingRight: "", ariaHiddenSiblingCount: 0 },
    pixel: null,
  };
}
