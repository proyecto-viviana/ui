import type { Plugin } from "vite";
import { sitemapRoutes } from "./route-manifest";
import { SITE_URL } from "../../seo";

/**
 * Emits `/sitemap.xml`.
 *
 * It is generated rather than committed so it cannot go stale: a checked-in
 * sitemap is correct until the first route someone adds without remembering it,
 * and a sitemap listing URLs that 404 is worse than no sitemap at all.
 *
 * It is emitted as a build asset rather than written into `public/` so that
 * nothing generated lands in the working tree — `public/` is hand-authored
 * here, and a build that dirties git makes `guard:publish-drift` and every
 * "is the tree clean" check lie.
 *
 * `robots.txt` is NOT generated: its content is fixed, so it is hand-written in
 * `public/` where it can be read without running a build.
 */

function renderSitemap(routes: string[]): string {
  const urls = routes
    .map((route) => {
      const loc = route === "/" ? `${SITE_URL}/` : SITE_URL + route;
      // Priority is a hint, and search engines mostly ignore it, but the shape
      // of the site is real: the landing page, then section indexes, then the
      // individual component pages beneath them.
      const depth = route === "/" ? 0 : route.split("/").length - 1;
      const priority = Math.max(0.4, 1 - depth * 0.2).toFixed(1);
      return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function sitemapPlugin(): Plugin {
  return {
    name: "viviana-sitemap",

    // Dev serves it from middleware so the generator is exercised on every
    // `vp dev`, not only in CI. A sitemap first observed at deploy time is a
    // sitemap nobody has read.
    configureServer(server) {
      server.middlewares.use("/sitemap.xml", (_req, res) => {
        res.setHeader("Content-Type", "application/xml");
        res.end(renderSitemap(sitemapRoutes()));
      });
    },

    // Only the client build produces the static asset directory the Worker
    // serves; emitting from the ssr build too would write it twice.
    generateBundle: {
      order: "post",
      handler(_options, _bundle) {
        if (this.environment?.name !== "client") return;
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: renderSitemap(sitemapRoutes()),
        });
      },
    },
  };
}
