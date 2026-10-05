/**
 * Strips Solid server hydration comment markers (e.g. `<!--!$-->`, `<!--#-->`)
 * from rendered HTML so text assertions can verify server output directly
 * without marker interference.
 */
export function stripHydrationMarkers(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}
