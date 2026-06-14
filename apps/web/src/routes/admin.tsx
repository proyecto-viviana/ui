import { createFileRoute } from "@tanstack/solid-router";
import { Show, createSignal, lazy, onMount } from "solid-js";
import adminCss from "@/app/admin/admin.css?url";

// Dev-only internal dashboard (see .claude/current/admin-dashboard.md). The
// /api/admin middleware behind it only exists on the dev server, so the page
// is client-only: SSR (and prod, where DEV is statically false) renders the
// fallback and the lazy chunk is never fetched.
const AdminPage = lazy(() =>
  import("@/app/admin/AdminPage").then((mod) => ({ default: mod.AdminPage })),
);

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Proyecto Viviana — Admin" }],
    links: [{ rel: "stylesheet", href: adminCss }],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));
  return (
    <Show when={import.meta.env.DEV && mounted()} fallback={<p>Not found.</p>}>
      <AdminPage />
    </Show>
  );
}
