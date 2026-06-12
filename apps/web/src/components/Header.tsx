import { Link, useLocation } from "@tanstack/solid-router";
import { GitHubIcon } from "@proyecto-viviana/solid-spectrum/GitHubIcon";
import { Logo } from "@proyecto-viviana/solid-spectrum/Logo";
import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { useTheme, useThemeColors } from "@/utils/theme";

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
  const getColors = useThemeColors();
  const colors = () => getColors();

  return (
    <button
      onClick={toggleTheme}
      title={isDark() ? "Switch to light mode" : "Switch to dark mode"}
      class="flex items-center justify-center w-8 h-8 border-2 cursor-pointer bg-transparent transition-[border-color] duration-200"
      style={{ "border-color": colors().muted }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isDark() ? colors().blue : colors().pink;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors().muted;
      }}
      aria-label={isDark() ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Show when={isDark()}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors().blue}
          stroke-width="2.5"
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
          stroke={colors().pink}
          stroke-width="2.5"
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
          <Logo firstWord="PROYECTO" secondWord="VIVIANA" size="lg" />
        </Link>

        {/* Right: Nav + GitHub + Theme Toggle */}
        <nav class="flex items-center gap-3">
          <NavLink
            href="/solid-spectrum/docs"
            color="blue"
            isActive={isActive("/solid-spectrum/docs")}
            colors={colors()}
          >
            DOCS
          </NavLink>
          <NavLink
            href="/solid-spectrum/playground"
            color="pink"
            isActive={isActive("/solid-spectrum/playground")}
            colors={colors()}
          >
            PLAYGROUND
          </NavLink>
          <NavLink
            href="/solid-spectrum/ecosystem"
            color="blue"
            isActive={isActive("/solid-spectrum/ecosystem")}
            colors={colors()}
          >
            ECOSYSTEM
          </NavLink>

          {/* GitHub */}
          <a
            href="https://github.com/proyecto-viviana/proyecto-viviana"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            class="flex items-center justify-center w-8 h-8 transition-[filter] duration-200"
            style={{ color: colors().textSecondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = `drop-shadow(0 0 4px ${colors().blueGlow})`;
              e.currentTarget.style.color = colors().blue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "none";
              e.currentTarget.style.color = colors().textSecondary;
            }}
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

function NavLink(props: {
  href: string;
  color: "blue" | "pink";
  isActive: boolean;
  colors: ReturnType<ReturnType<typeof useThemeColors>>;
  children: string;
}) {
  const wireColor = () => (props.color === "blue" ? props.colors.blue : props.colors.pink);

  return (
    <Link
      to={props.href}
      class=""
      style={{
        "font-family": "'Jost', sans-serif",
        "font-size": "12px",
        "font-weight": "600",
        color: props.isActive ? props.colors.surface : wireColor(),
        "text-decoration": "none",
        padding: "6px 14px",
        border: `2px solid ${wireColor()}`,
        background: props.isActive ? wireColor() : "transparent",
        transition: "background 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!props.isActive) {
          e.currentTarget.style.background = `${wireColor()}20`;
        }
      }}
      onMouseLeave={(e) => {
        if (!props.isActive) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {props.children}
    </Link>
  );
}
