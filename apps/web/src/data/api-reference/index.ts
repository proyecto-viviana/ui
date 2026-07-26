/**
 * Types for the generated API reference, plus the page index the sidebar uses.
 *
 * `pages/*.json` is written by `vp run api:extract` straight from the
 * TypeScript checker and verified in CI by `guard:api-reference`. Nothing in
 * this directory is hand-edited — if a prop table is wrong, the fix is in the
 * package's source, not here.
 *
 * Each reference route imports only its own page file. Importing all of them
 * from one module would put 1.8 MB of prop data in a single chunk that every
 * page pays for; the index below is deliberately the only thing the layout
 * loads.
 */
import pagesIndex from "./pages.json";

export interface ApiProp {
  name: string;
  type: string;
  values?: string[];
  required: boolean;
  default?: string;
  description: string;
  origin: string;
}

export interface ApiEntry {
  name: string;
  component: string;
  source: string;
  props: ApiProp[];
}

export interface PropDivergence {
  prop: string;
  kind: string;
  here?: string[];
  there?: string[];
}

export interface ApiPageData {
  slug: string;
  title: string;
  packageName: string;
  comparedWith: string;
  entries: ApiEntry[];
  divergence: Record<string, PropDivergence[]>;
}

export interface ApiPagesIndex {
  packageName: string;
  pages: { slug: string; title: string }[];
  propCount: number;
}

export const apiPages = pagesIndex as ApiPagesIndex;
