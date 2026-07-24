import { Link, useLocation } from "@tanstack/solid-router";
import { GitHubIcon } from "@proyecto-viviana/solid-spectrum/GitHubIcon";
import { createVisuallyHidden } from "@proyecto-viviana/solidaria";
import { createSignal, onMount, onCleanup, Show, type JSX } from "solid-js";
import { useTheme } from "@/utils/theme";
import "@/components/theme/studio.css";

function useScrollDirection() {
  const [isVisible, setIsVisible] = createSignal(true);
  const [lastScrollY, setLastScrollY] = createSignal(0);

  onMount(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastScrollY() || currentY < 50) {
        setIsVisible(true);
      } else if (currentY > lastScrollY() && currentY > 100) {
        setIsVisible(false);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", handleScroll));
  });

  return isVisible;
}

// ========================================
// THEME TOGGLE
// ========================================

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark() ? "Switch to light mode" : "Switch to dark mode"}
      class="pv-iconbtn"
      aria-label={isDark() ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Show when={isDark()}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
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
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </Show>
    </button>
  );
}

// ========================================
// HEADER
// ========================================

export function Header() {
  const location = useLocation();
  const headerVisible = useScrollDirection();

  const isActive = (path: string) => {
    const current = location().pathname;
    if (path === "/") return current === "/";
    return current === path || current.startsWith(`${path}/`);
  };

  // The skip link is hidden until it takes focus, at which point these styles are the
  // ones that apply — createVisuallyHidden swaps its clip-rect out for them wholesale.
  const { visuallyHiddenProps: skipLinkProps } = createVisuallyHidden({
    isFocusable: true,
    style: {
      position: "absolute",
      top: "8px",
      left: "8px",
      "z-index": "210",
      padding: "8px 12px",
      "border-radius": "var(--pv-radius-sm)",
      background: "var(--docs-bg-elevated)",
      color: "var(--docs-text)",
      "box-shadow": "0 0 0 1px var(--docs-border)",
    },
  });

  return (
    <>
      {/* The hook types its props for a generic element, so the ref needs narrowing here. */}
      <a href="#main-content" {...(skipLinkProps() as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        Skip to main content
      </a>
      <header
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          "z-index": "100",
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
          padding: "12px 24px",
          // One frosted-glass bar shared across the whole site — the showcase
          // topbar language. It blurs the fixed SiteBackdrop scrolling beneath it.
          background: "var(--surface-panel)",
          "backdrop-filter": "var(--blur-panel)",
          "-webkit-backdrop-filter": "var(--blur-panel)",
          "border-bottom": "1px solid var(--border-default)",
          "box-shadow": "var(--edge-glass-surface)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: headerVisible() ? "1" : "0",
          transform: headerVisible() ? "translateY(0)" : "translateY(-10px)",
          "pointer-events": headerVisible() ? "auto" : "none",
        }}
      >
        {/* Left: Logo + Title */}
        <Link
          to="/"
          style={{
            display: "flex",
            "align-items": "center",
            gap: "12px",
            "text-decoration": "none",
          }}
        >
          <span class="pv-wordmark">
            <span>PROYECTO</span>
            <span>VIVIANA</span>
          </span>
        </Link>

        {/* Right: Nav + GitHub + Theme Toggle */}
        <nav style={{ display: "flex", "align-items": "center", gap: "8px" }}>
          <NavLink href="/" isActive={isActive("/")}>
            Home
          </NavLink>
          {/* The two styled registers, as peers. viviana-ui lives at its own
              Glasselated /showcase surface; solid-spectrum owns /solid-spectrum
              (docs, playground, ecosystem all hang off it). */}
          <NavLink href="/showcase" isActive={isActive("/showcase")}>
            viviana-ui
          </NavLink>
          <NavLink href="/solid-spectrum/docs" isActive={isActive("/solid-spectrum")}>
            solid-spectrum
          </NavLink>
          <NavLink href="/theme" isActive={isActive("/theme")}>
            Theme
          </NavLink>

          {/* GitHub */}
          <a
            href="https://github.com/proyecto-viviana/proyecto-viviana"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            class="pv-iconbtn"
            style={{ "margin-left": "4px" }}
          >
            <GitHubIcon size={18} />
          </a>

          <ThemeToggle />
        </nav>
      </header>

      {/* Spacer for fixed header */}
      <div style={{ height: "60px" }} />
    </>
  );
}

// ========================================
// NAV LINK
// ========================================

function NavLink(props: { href: string; isActive: boolean; children: string }) {
  return (
    <Link to={props.href} class="pv-navlink" data-active={props.isActive ? "true" : "false"}>
      {props.children}
    </Link>
  );
}
