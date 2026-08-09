import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/solid-router";
import { For, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { Header, SiteBackdrop } from "@/components";
import { FONT_DISPLAY, FONT_SANS } from "@/components/docs";
import { apiPages } from "@/data/api-reference";
import { useThemeColors } from "@/utils/theme";

/**
 * The flagship register's API reference.
 *
 * The sidebar is built from the same generated data the pages are — add a
 * component to `@proyecto-viviana/ui`, re-run `vp run api:extract`, and it
 * appears here with no list to update by hand. The older solid-spectrum tree
 * keeps its glob-based nav and its hand-written examples; this one is a
 * reference, and it is complete by construction rather than by diligence.
 */
export const Route = createFileRoute("/docs")({
  component: ApiDocsLayout,
});

const SIDEBAR_WIDTH = "248px";

/**
 * The `: string` is load-bearing. `Link`'s `to` is typed against the generated
 * route union, and an interpolated slug infers as `` `/docs/components/${string}` ``,
 * which is not one of those literals; widening to `string` takes the router's
 * loose branch, the same way the solid-spectrum layout's nav does.
 */
const pageHref = (slug: string): string => `/docs/components/${slug}`;

function ApiDocsLayout() {
  const getColors = useThemeColors();
  const colors = () => getColors();
  const location = useLocation();
  const [isMobile, setIsMobile] = createSignal(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [filter, setFilter] = createSignal("");

  const pages = createMemo(() => {
    const needle = filter().trim().toLowerCase();
    if (!needle) return apiPages.pages;
    return apiPages.pages.filter((page) => page.title.toLowerCase().includes(needle));
  });

  const isActive = (href: string) => location().pathname === href;

  const checkMobile = () => {
    if (typeof window === "undefined") return;
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth >= 768) setSidebarOpen(false);
  };

  onMount(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
  });
  onCleanup(() => {
    if (typeof window === "undefined") return;
    window.removeEventListener("resize", checkMobile);
  });

  const navLinkStyle = (href: string) => ({
    display: "block",
    width: "calc(100% - 16px)",
    margin: "1px 8px",
    padding: "6px 12px",
    background: isActive(href) ? "var(--interactive-fill)" : "transparent",
    "border-radius": "var(--radius-sm)",
    color: isActive(href) ? "var(--text-on-accent)" : colors().textSecondary,
    "font-family": FONT_SANS,
    "font-size": "12.5px",
    "font-weight": isActive(href) ? "600" : "400",
    "text-decoration": "none",
    "box-shadow": isActive(href) ? "var(--edge-glass)" : "none",
  });

  return (
    <div
      style={{
        "min-height": "100vh",
        background: "transparent",
        "font-family": FONT_SANS,
        color: colors().text,
      }}
    >
      <SiteBackdrop variant="calm" />
      <Header />

      <Show when={isMobile() && sidebarOpen()}>
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: "0", background: "rgba(0,0,0,0.8)", "z-index": "150" }}
        />
      </Show>

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
            background: "var(--interactive-fill)",
            color: "var(--text-on-accent)",
            border: "none",
            "border-radius": "var(--radius-md)",
            cursor: "pointer",
            "box-shadow": "var(--edge-glass), var(--shadow-float)",
          }}
        >
          {sidebarOpen() ? "✕" : "☰"}
        </button>
      </Show>

      <div style={{ display: "flex" }}>
        <nav
          aria-label="API reference"
          style={{
            width: SIDEBAR_WIDTH,
            "min-width": SIDEBAR_WIDTH,
            height: "100vh",
            position: "fixed",
            top: "0",
            left: isMobile() ? (sidebarOpen() ? "0" : "-280px") : "0",
            background: "var(--surface-panel)",
            "backdrop-filter": "var(--blur-panel)",
            "-webkit-backdrop-filter": "var(--blur-panel)",
            "border-right": "1px solid var(--border-default)",
            "box-shadow": "var(--edge-glass-surface)",
            "z-index": "50",
            transition: "left 0.2s ease",
            display: "flex",
            "flex-direction": "column",
          }}
        >
          <div style={{ height: "72px", "min-height": "72px" }} />

          <div style={{ padding: "0 14px 10px" }}>
            <Link
              to="/docs"
              style={{
                display: "block",
                "font-family": FONT_DISPLAY,
                "font-size": "11px",
                "font-weight": "600",
                "text-transform": "uppercase",
                "letter-spacing": "0.1em",
                color: colors().textSecondary,
                "text-decoration": "none",
                "margin-bottom": "10px",
              }}
            >
              API Reference
            </Link>
            <label>
              <span class="sr-only">Filter components</span>
              <input
                type="search"
                value={filter()}
                onInput={(event) => setFilter(event.currentTarget.value)}
                placeholder={`Filter ${apiPages.pages.length} components`}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  background: "var(--surface-well)",
                  border: "1px solid var(--border-default)",
                  "border-radius": "var(--radius-sm)",
                  color: colors().text,
                  "font-family": FONT_SANS,
                  "font-size": "12px",
                }}
              />
            </label>
          </div>

          <div style={{ flex: "1", "overflow-y": "auto", "padding-bottom": "16px" }}>
            <For each={pages()}>
              {(page) => (
                <Link
                  to={pageHref(page.slug)}
                  onClick={() => {
                    if (isMobile()) setSidebarOpen(false);
                  }}
                  style={navLinkStyle(pageHref(page.slug))}
                >
                  {page.title}
                </Link>
              )}
            </For>
            <Show when={pages().length === 0}>
              <p
                style={{
                  padding: "8px 20px",
                  "font-size": "12px",
                  color: colors().textSecondary,
                }}
              >
                No component matches “{filter()}”.
              </p>
            </Show>
          </div>
        </nav>

        <Show when={!isMobile()}>
          <div style={{ width: SIDEBAR_WIDTH, "min-width": SIDEBAR_WIDTH }} />
        </Show>

        <main
          id="main-content"
          class="docs-content"
          style={{
            flex: "1",
            padding: isMobile() ? "24px 16px" : "32px 48px",
            "max-width": "860px",
            "min-width": "0",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
