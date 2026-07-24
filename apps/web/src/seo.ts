/**
 * Per-page head metadata.
 *
 * Before this existed, `__root.tsx` set one title — "Proyecto Viviana" — and
 * nothing overrode it, so all 72 routes shipped the same `<title>` and the same
 * description. Search results and link previews for the Picker page, the theme
 * studio and the landing page were indistinguishable.
 *
 * `head:` is a route option in TanStack Router, not something a component can
 * set, so this cannot live in `DocPage` however convenient that would be. Each
 * route calls `seo()` from its own `head:`. Deeper routes win on conflict: the
 * root's title and description are the fallback for anything that hasn't been
 * given its own.
 */

/**
 * Canonical origin. Everything absolute — canonical links, OpenGraph URLs,
 * sitemap entries — is built from this one value, so a domain change is a
 * one-line edit. No trailing slash.
 */
export const SITE_URL = "https://proyectoviviana.org";

export const SITE_NAME = "Proyecto Viviana";

/** Fallback description, used by the root route and by `seo()` callers that omit one. */
export const SITE_DESCRIPTION =
  "An unofficial SolidJS port of Adobe's React Aria and React Spectrum, plus Viviana's own component register.";

/**
 * The social preview image. `/logo.png` is what the site already ships; it is a
 * logo rather than a per-page card, which is honest but not rich. A generated
 * per-page card is tracked as `seo-og-images` and would only change this line.
 */
const SOCIAL_IMAGE = `${SITE_URL}/logo.png`;

export interface SeoOptions {
  /** Page title, without the site name — `seo()` appends it. */
  title: string;
  /** Meta description. Aim for roughly 150 characters; longer gets truncated by search engines. */
  description?: string;
  /**
   * Absolute path this page is served from, e.g. `/solid-spectrum/docs/components/picker`.
   * Used for the canonical link and the OpenGraph URL. Omit only for the root route.
   */
  path: string;
}

export function canonicalUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : SITE_URL + path;
}

export function seo(options: SeoOptions) {
  const description = options.description ?? SITE_DESCRIPTION;
  // The site name is suffixed rather than prefixed so the distinguishing part
  // survives the ~60-character truncation in a search result or a browser tab.
  const title = options.path === "/" ? SITE_NAME : `${options.title} · ${SITE_NAME}`;
  const url = canonicalUrl(options.path);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: SOCIAL_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: SOCIAL_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
