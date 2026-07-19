import { Link, useLocation } from "@tanstack/solid-router";
import { GitHubIcon } from "@proyecto-viviana/solid-spectrum/GitHubIcon";
import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { useTheme, useThemeColors } from "@/utils/theme";
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
  const getColors = useThemeColors();
  const headerVisible = useScrollDirection();

  const isActive = (path: string) => {
    const current = location().pathname;
    if (path === "/") return current === "/";
    return current === path || current.startsWith(`${path}/`);
  };

  const colors = () => getColors();

  return (
    <>
      <a
        href="#main-content"
        class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[210] focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:rounded-md focus:bg-bg-300 focus:text-primary-100"
      >
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
          padding: "16px 24px",
          "padding-bottom": "24px",
          background: `linear-gradient(to bottom, ${colors().headerBg} 0%, ${colors().headerBg} 40%, transparent 100%)`,
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: headerVisible() ? "1" : "0",
          transform: headerVisible() ? "translateY(0)" : "translateY(-10px)",
          "pointer-events": headerVisible() ? "auto" : "none",
        }}
      >
        {/* Left: Logo + Title */}
        <Link
          to="/solid-spectrum"
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
        <nav class="flex items-center gap-2">
          <NavLink href="/home" isActive={isActive("/home")}>
            Home
          </NavLink>
          <NavLink href="/theme" isActive={isActive("/theme")}>
            Theme
          </NavLink>
          <NavLink href="/solid-spectrum/docs" isActive={isActive("/solid-spectrum/docs")}>
            Docs
          </NavLink>
          <NavLink
            href="/solid-spectrum/playground"
            isActive={isActive("/solid-spectrum/playground")}
          >
            Playground
          </NavLink>
          <NavLink
            href="/solid-spectrum/ecosystem"
            isActive={isActive("/solid-spectrum/ecosystem")}
          >
            Ecosystem
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
      <div style={{ height: "72px" }} />
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
