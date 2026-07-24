/// <reference types="vite/client" />
import { Suspense, ErrorBoundary, type JSX } from "solid-js";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/solid-router";
import { HydrationScript } from "solid-js/web";
import { Provider } from "@proyecto-viviana/ui";
import { useTheme } from "@/utils/theme";
import appStyles from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Proyecto Viviana" },
      {
        name: "description",
        content: "Beautiful, accessible SolidJS components inspired by React Spectrum",
      },
    ],
    links: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        /* The Geist trio the library's type tokens name: Geist Pixel for display
           (--font-display), Geist for text (--font-ui), Geist Mono for code. */
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist+Pixel:ELSH@1..80&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;700;800&display=swap",
      },
      { rel: "stylesheet", href: appStyles },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const { theme } = useTheme();
  return (
    <RootDocument>
      {/* Every viviana-ui component is painted by the S2 style() macro, whose
          light-dark() fills lightningcss downlevels into a var() pair guarded by
          --lightningcss-light/dark. Those guards exist only on the atoms
          setColorScheme() emits, which the library Provider is what applies —
          without an ancestor Provider a fill like light-dark(#2e90fa,#407fc1)
          collapses to the garbage "#2e90fa#407fc1" and the control paints
          transparent. /showcase and /solid-spectrum wrap their own Providers;
          this root one covers the remaining top-level pages (landing, Theme
          Studio, admin). No `background` prop, so it paints nothing itself —
          only isolation + the scheme toggles. It tracks the site's own theme. */}
      <Provider locale="en-US" colorScheme={theme()}>
        <Outlet />
      </Provider>
    </RootDocument>
  );
}

/**
 * The boundary is deliberately loud. A route that throws still answers 200 and
 * still renders a page full of text, so every cheap health check — a curl, an
 * uptime probe, the e2e route sweep — read a broken page as a working one until
 * this reported itself. The testid is what `e2e/route-sweep.spec.ts` asserts is
 * absent; the console.error is what a person watching a browser sees.
 */
function ErrorFallback(props: { error: Error; reset: () => void }) {
  console.error("Route error boundary caught:", props.error);
  return (
    <div data-testid="route-error-boundary" style={{ padding: "2rem", "text-align": "center" }}>
      <h2 style={{ color: "#ef4444", "margin-bottom": "1rem" }}>Something went wrong</h2>
      <p style={{ color: "#9ca3af", "margin-bottom": "1rem" }}>{props.error.message}</p>
      <button
        onClick={props.reset}
        style={{
          padding: "0.5rem 1rem",
          background: "#3b82f6",
          color: "white",
          border: "none",
          "border-radius": "0.375rem",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}

function RootDocument(props: { children: JSX.Element }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <HydrationScript />
        <HeadContent />
        {/* Resolve theme before paint: localStorage → system preference → dark.
            Sets both data-theme (legacy) and data-color-scheme (the styling switch). */}
        <script>{`(function(){try{var t=localStorage.getItem('pv-theme');var s=(t==='dark'||t==='light')?t:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',s);document.documentElement.setAttribute('data-color-scheme',s)}catch(e){}})()`}</script>
      </head>
      <body
        style={{ "-webkit-font-smoothing": "antialiased", "-moz-osx-font-smoothing": "grayscale" }}
      >
        <ErrorBoundary fallback={(err, reset) => <ErrorFallback error={err} reset={reset} />}>
          <Suspense>{props.children}</Suspense>
        </ErrorBoundary>
        <Scripts />
      </body>
    </html>
  );
}
