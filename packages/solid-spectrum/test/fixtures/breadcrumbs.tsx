/**
 * Shared fixture for the Breadcrumbs SSR/hydrate twin (#545 class 3).
 *
 * The path `/solid-spectrum/docs/components/breadcrumbs` puts on the page: a plain,
 * non-overflowing trail of links ending in the current item. Three items is under
 * MAX_VISIBLE_ITEMS, so neither half collapses and the only thing that can differ
 * between server and client is the hidden measurement copy, which is what this twin
 * is here to pin.
 */
import type { JSX } from "@solidjs/web";
import { Breadcrumb, Breadcrumbs, Provider } from "../../src";

export interface CrumbItem {
  id: string;
  label: string;
  href?: string;
}

export const PATH_CRUMB_ITEMS: CrumbItem[] = [
  { id: "root", label: "Root", href: "#" },
  { id: "documents", label: "Documents", href: "#" },
  { id: "invoice", label: "Invoice.pdf" },
];

export function BreadcrumbsPathFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="light">
      <Breadcrumbs
        items={PATH_CRUMB_ITEMS}
        getKey={(item: CrumbItem) => item.id}
        aria-label="Breadcrumbs"
      >
        {(item: CrumbItem) => <Breadcrumb href={item.href}>{item.label}</Breadcrumb>}
      </Breadcrumbs>
    </Provider>
  );
}
