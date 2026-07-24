/// <reference types="vite/client" />
import { Suspense, ErrorBoundary, type JSX } from "solid-js";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/solid-router";
import { HydrationScript } from "solid-js/web";
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
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Jost:ital,wght@0,100..900;1,100..900&family=Sen:wght@400..800&display=swap",
      },
      { rel: "stylesheet", href: appStyles },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function ErrorFallback(props: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: "2rem", "text-align": "center" }}>
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
      <body style={{ "-webkit-font-smoothing": "antialiased", "-moz-osx-font-smoothing": "grayscale" }}>
        <ErrorBoundary fallback={(err, reset) => <ErrorFallback error={err} reset={reset} />}>
          <Suspense>{props.children}</Suspense>
        </ErrorBoundary>
        <Scripts />
      </body>
    </html>
  );
}
