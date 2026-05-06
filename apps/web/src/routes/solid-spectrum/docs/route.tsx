import { Outlet, createFileRoute, Link, useLocation } from "@tanstack/solid-router";
import { For, createSignal, Show, onMount, onCleanup } from "solid-js";
import { Header } from "@/components";
import { useThemeColors, useTheme } from "@/utils/theme";

const FONT_TITLE = "'Jost', system-ui, sans-serif";
const FONT_BODY = "'Sen', system-ui, sans-serif";

export const Route = createFileRoute("/solid-spectrum/docs")({
  component: DocsLayout,
});

type NavItem = { label: string; href: string };
type NavSection = { section: string; items: NavItem[] };
type NavEntry = NavItem | NavSection;

const componentPages = import.meta.glob("./components/*.tsx");
const hookPages = import.meta.glob("./hooks/*.tsx");

const componentOrder = [
  "button",
  "checkbox",
  "textfield",
  "textarea",
  "numberfield",
  "searchfield",
  "slider",
  "switch",
  "combobox",
  "select",
  "picker",
  "menu",
  "listbox",
  "popover",
  "tooltip",
  "contextualhelp",
  "tabs",
  "breadcrumbs",
  "link",
  "toolbar",
  "actiongroup",
  "actionbar",
  "dialog",
  "alertdialog",
  "toast",
  "table",
  "gridlist",
  "tree",
  "progressbar",
  "meter",
  "badge",
  "dropzone",
  "filetrigger",
  "calendar",
  "rangecalendar",
  "datepicker",
  "daterangepicker",
  "datefield",
  "timefield",
  "color",
  "disclosure",
  "accordion",
  "taggroup",
  "separator",
  "provider",
  "virtualizer",
];
const hookOrder = ["create-button", "create-press"];

const labelOverrides: Record<string, string> = {
  textfield: "TextField",
  textarea: "TextArea",
  numberfield: "NumberField",
  searchfield: "SearchField",
  combobox: "ComboBox",
  datepicker: "DatePicker",
  daterangepicker: "DateRangePicker",
  datefield: "DateField",
  timefield: "TimeField",
  rangecalendar: "RangeCalendar",
  gridlist: "GridList",
  progressbar: "ProgressBar",
  taggroup: "TagGroup",
  alertdialog: "AlertDialog",
  virtualizer: "Virtualizer",
  actionbar: "ActionBar",
  actiongroup: "ActionGroup",
  contextualhelp: "ContextualHelp",
  filetrigger: "FileTrigger",
  dropzone: "DropZone",
};

function filePathToSlug(p: string) {
  return p.split("/").at(-1)?.replace(".tsx", "") ?? "";
}

function toTitleCase(slug: string) {
  if (slug in labelOverrides) return labelOverrides[slug];
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function toCamelCase(slug: string) {
  const [first, ...rest] = slug.split("-");
  return `${first}${rest.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("")}`;
}

function buildSectionItems(
  pages: Record<string, unknown>,
  basePath: "/solid-spectrum/docs/components" | "/solid-spectrum/docs/hooks",
  order: string[],
  fmt: (s: string) => string,
): NavItem[] {
  return Object.keys(pages)
    .map((fp) => {
      const slug = filePathToSlug(fp);
      return { slug, item: { label: fmt(slug), href: `${basePath}/${slug}` } };
    })
    .sort((a, b) => {
      const ai = order.indexOf(a.slug),
        bi = order.indexOf(b.slug);
      const ar = ai === -1 ? Infinity : ai,
        br = bi === -1 ? Infinity : bi;
      return ar === br ? a.item.label.localeCompare(b.item.label) : ar - br;
    })
    .map((e) => e.item);
}

const navItems: NavEntry[] = [
  { label: "Getting Started", href: "/solid-spectrum/docs" },
  { label: "Installation", href: "/solid-spectrum/docs/installation" },
  {
    section: "Components",
    items: buildSectionItems(
      componentPages,
      "/solid-spectrum/docs/components",
      componentOrder,
      toTitleCase,
    ),
  },
  {
    section: "Hooks",
    items: buildSectionItems(hookPages, "/solid-spectrum/docs/hooks", hookOrder, toCamelCase),
  },
];

function DocsLayout() {
  const getColors = useThemeColors();
  const { isDark, toggleTheme } = useTheme();
  const colors = () => getColors();
  const location = useLocation();
  const [isMobile, setIsMobile] = createSignal(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [headerVisible, setHeaderVisible] = createSignal(true);
  const [expandedSections, setExpandedSections] = createSignal<Set<string>>(
    new Set(["Components", "Hooks"]),
  );

  const isActive = (href: string) => {
    const path = location().pathname;
    return href === "/solid-spectrum/docs"
      ? path === "/solid-spectrum/docs" || path === "/solid-spectrum/docs/"
      : path === href;
  };

  const toggleSection = (s: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const checkMobile = () => {
    if (typeof window === "undefined") return;
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth >= 768) setSidebarOpen(false);
  };

  const handleScroll = () => {
    if (typeof window === "undefined") return;
    setHeaderVisible(window.scrollY < 80);
  };

  onMount(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("scroll", handleScroll, { passive: true });
  });
  onCleanup(() => {
    if (typeof window === "undefined") return;
    window.removeEventListener("resize", checkMobile);
    window.removeEventListener("scroll", handleScroll);
  });

  const navLinkStyle = (href: string) => ({
    display: "block",
    width: "100%",
    padding: "8px 14px",
    "text-align": "left" as const,
    background: isActive(href) ? colors().pink : "transparent",
    border: "none",
    "border-left": isActive(href) ? `3px solid ${colors().pink}` : "3px solid transparent",
    color: isActive(href) ? colors().surface : colors().textSecondary,
    "font-family": FONT_BODY,
    "font-size": "12px",
    "font-weight": isActive(href) ? "600" : "400",
    "text-decoration": "none",
    cursor: "pointer",
    transition: "all 0.1s",
  });

  const handleLinkMouseOver = (href: string, e: MouseEvent) => {
    if (!isActive(href)) {
      (e.currentTarget as HTMLElement).style.background = `${colors().pink}20`;
      (e.currentTarget as HTMLElement).style.color = colors().text;
    }
  };

  const handleLinkMouseOut = (href: string, e: MouseEvent) => {
    if (!isActive(href)) {
      (e.currentTarget as HTMLElement).style.background = "transparent";
      (e.currentTarget as HTMLElement).style.color = colors().textSecondary;
    }
  };

  return (
    <div
      style={{
        "min-height": "100vh",
        background: colors().surface,
        "font-family": FONT_BODY,
        color: colors().text,
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <Header />

      {/* Mobile overlay */}
      <Show when={isMobile() && sidebarOpen()}>
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: "0", background: "rgba(0,0,0,0.8)", "z-index": "150" }}
        />
      </Show>

      {/* Mobile menu FAB */}
      <Show when={isMobile()}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen())}
          aria-label={sidebarOpen() ? "Close menu" : "Open menu"}
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            "z-index": "160",
            width: "44px",
            height: "44px",
            background: colors().pink,
            color: isDark() ? colors().surface : "#fff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            filter: `drop-shadow(0 0 6px ${colors().pinkGlow})`,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <Show
              when={sidebarOpen()}
              fallback={
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              }
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </Show>
          </svg>
        </button>
      </Show>

      <div style={{ display: "flex" }}>
        {/* ─── Sidebar ─── */}
        <nav
          style={{
            width: "260px",
            "min-width": "260px",
            height: "100vh",
            position: "fixed",
            top: "0",
            left: isMobile() ? (sidebarOpen() ? "0" : "-280px") : "0",
            background: colors().surfaceElevated,
            "overflow-y": "auto",
            "z-index": "50",
            transition: "left 0.2s ease",
            display: "flex",
            "flex-direction": "column",
          }}
        >
          {/* SVG border on sidebar right edge — starts below header */}
          <svg
            style={{
              position: "absolute",
              top: "72px",
              right: "0",
              width: "2px",
              height: "calc(100% - 72px)",
              "pointer-events": "none",
            }}
          >
            <line x1="1" y1="0" x2="1" y2="100%" stroke={colors().muted} stroke-width="1" />
          </svg>

          {/* Sidebar header — content reveals when main header scrolls away */}
          <div
            style={{
              height: "72px",
              "min-height": "72px",
              padding: "0 14px",
              display: "flex",
              "align-items": "center",
              "justify-content": "space-between",
              "border-bottom": `1px solid ${colors().muted}`,
              background: colors().headerBg,
            }}
          >
            <div
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                width: "100%",
                opacity: headerVisible() ? "0" : "1",
                transform: headerVisible() ? "translateY(-8px)" : "translateY(0)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
                "pointer-events": headerVisible() ? "none" : "auto",
              }}
            >
              <Show when={!isMobile()}>
                <Link
                  to="/solid-spectrum"
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "10px",
                    "text-decoration": "none",
                    color: colors().text,
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      background: colors().pink,
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "center",
                      "font-weight": "700",
                      color: colors().surface,
                      "font-size": "12px",
                      "font-family": FONT_TITLE,
                      filter: `drop-shadow(0 0 4px ${colors().pinkGlow})`,
                    }}
                  >
                    V
                  </div>
                  <div>
                    <div
                      style={{
                        "font-family": FONT_TITLE,
                        "font-weight": "600",
                        "font-size": "13px",
                      }}
                    >
                      Proyecto Viviana
                    </div>
                    <div
                      style={{
                        "font-size": "9px",
                        color: colors().pink,
                        "font-family": FONT_TITLE,
                        "text-transform": "uppercase",
                        "letter-spacing": "0.05em",
                      }}
                    >
                      Documentation
                    </div>
                  </div>
                </Link>
                <button
                  onClick={toggleTheme}
                  title={isDark() ? "Switch to light mode" : "Switch to dark mode"}
                  style={{
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    width: "28px",
                    height: "28px",
                    background: "transparent",
                    border: `2px solid ${colors().muted}`,
                    cursor: "pointer",
                  }}
                >
                  <Show when={isDark()}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={colors().blue}
                      stroke-width="2.5"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  </Show>
                  <Show when={!isDark()}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={colors().pink}
                      stroke-width="2.5"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </Show>
                </button>
              </Show>
              <Show when={isMobile()}>
                <span
                  style={{
                    "font-family": FONT_TITLE,
                    "font-weight": "600",
                    "font-size": "11px",
                    "text-transform": "uppercase",
                    "letter-spacing": "1px",
                    color: colors().textSecondary,
                  }}
                >
                  Navigation
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "4px",
                    cursor: "pointer",
                    color: colors().textSecondary,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </Show>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ flex: "1", "overflow-y": "auto", padding: "8px 0" }}>
            <For each={navItems}>
              {(item) => {
                if ("section" in item) {
                  const isExpanded = () => expandedSections().has(item.section);
                  return (
                    <div style={{ "margin-top": "8px" }}>
                      <button
                        onClick={() => toggleSection(item.section)}
                        aria-expanded={isExpanded()}
                        style={{
                          display: "flex",
                          "align-items": "center",
                          "justify-content": "space-between",
                          width: "100%",
                          padding: "6px 14px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          "font-family": FONT_TITLE,
                          "font-size": "10px",
                          "font-weight": "600",
                          "text-transform": "uppercase",
                          "letter-spacing": "0.1em",
                          color: colors().textSecondary,
                        }}
                      >
                        <span>{item.section}</span>
                        <svg
                          style={{
                            width: "14px",
                            height: "14px",
                            transition: "transform 0.2s ease",
                            transform: isExpanded() ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      <Show when={isExpanded()}>
                        <div>
                          <For each={item.items}>
                            {(sub) => (
                              <Link
                                to={sub.href}
                                activeOptions={{ exact: true }}
                                onClick={() => {
                                  if (isMobile()) setSidebarOpen(false);
                                }}
                                style={navLinkStyle(sub.href)}
                                onMouseOver={(e: MouseEvent) => handleLinkMouseOver(sub.href, e)}
                                onMouseOut={(e: MouseEvent) => handleLinkMouseOut(sub.href, e)}
                              >
                                {sub.label}
                              </Link>
                            )}
                          </For>
                        </div>
                      </Show>
                    </div>
                  );
                }
                return (
                  <Link
                    to={item.href}
                    activeOptions={{ exact: true }}
                    onClick={() => {
                      if (isMobile()) setSidebarOpen(false);
                    }}
                    style={navLinkStyle(item.href)}
                    onMouseOver={(e: MouseEvent) => handleLinkMouseOver(item.href, e)}
                    onMouseOut={(e: MouseEvent) => handleLinkMouseOut(item.href, e)}
                  >
                    {item.label}
                  </Link>
                );
              }}
            </For>
          </div>

          {/* Sidebar footer CTA */}
          <div style={{ padding: "14px", "border-top": `1px solid ${colors().muted}` }}>
            <Link
              to="/solid-spectrum/playground"
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                gap: "8px",
                padding: "10px 14px",
                background: colors().blue,
                color: colors().surface,
                "text-decoration": "none",
                "font-weight": "600",
                "font-size": "12px",
                "font-family": FONT_BODY,
                border: `2px solid ${colors().blue}`,
                filter: `drop-shadow(0 0 4px ${colors().blueGlow})`,
                transition: "filter 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = `drop-shadow(0 0 8px ${colors().blueGlow})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = `drop-shadow(0 0 4px ${colors().blueGlow})`;
              }}
            >
              Open Playground
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </nav>

        {/* Sidebar spacer (desktop) */}
        <Show when={!isMobile()}>
          <div style={{ width: "260px", "min-width": "260px" }} />
        </Show>

        {/* ─── Main content ─── */}
        <main
          id="main-content"
          class="docs-content"
          style={{
            flex: "1",
            padding: isMobile() ? "24px 16px" : "32px 48px",
            "max-width": "800px",
            "min-width": "0",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
