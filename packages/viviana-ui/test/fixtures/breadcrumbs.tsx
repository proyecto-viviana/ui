/**
 * Shared fixture for the Breadcrumbs hydration regression.
 *
 * Breadcrumbs self-measures on the client to decide how many trailing items fit before it must
 * collapse the head of the path into an overflow menu (see `updateOverflow` /
 * `canMeasureOverflow` in src/breadcrumbs/index.tsx). `canMeasureOverflow` deliberately returns
 * false under jsdom/happy-dom (and always on the server, where `window` is undefined) — real
 * ResizeObserver-based measurement never runs in either test environment, so both SSR and
 * hydrate resolve `shouldCollapse` via the exact same deterministic, item-count-only fallback
 * path (`items.length > MAX_VISIBLE_ITEMS`). That is what makes this fixture a faithful hydration
 * check: it must render identically without ever touching a real layout measurement.
 *
 * Six items exceeds MAX_VISIBLE_ITEMS (4), so both halves render the collapsed shape: first item,
 * overflow menu, then the fallback tail.
 */
import type { JSX } from "solid-js";
import { Breadcrumb, Breadcrumbs, Provider } from "../../src";

export interface CrumbItem {
  id: string;
  label: string;
  href?: string;
}

export const OVERFLOW_CRUMB_ITEMS: CrumbItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "files", label: "Files", href: "/files" },
  { id: "projects", label: "Projects", href: "/files/projects" },
  { id: "reports", label: "Reports", href: "/files/projects/reports" },
  { id: "quarterly", label: "Quarterly", href: "/files/projects/reports/quarterly" },
  { id: "annual", label: "Annual report" },
];

export function BreadcrumbsOverflowFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Breadcrumbs
        items={OVERFLOW_CRUMB_ITEMS}
        getKey={(item: CrumbItem) => item.id}
        aria-label="Overflowing breadcrumbs"
      >
        {(item: CrumbItem) => <Breadcrumb href={item.href}>{item.label}</Breadcrumb>}
      </Breadcrumbs>
    </Provider>
  );
}
