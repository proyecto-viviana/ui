export const routes = {
  docs: "/solid-spectrum/docs",
  docsComponent: (slug: string) => `/solid-spectrum/docs/components/${slug}`,
  docsHook: (slug: string) => `/solid-spectrum/docs/hooks/${slug}`,
  playground: "/solid-spectrum/playground",
  /** Example docs for `@proyecto-viviana/ui` (not the generated `/docs` tables). */
  vivianaUiDocs: "/viviana-ui/docs",
  vivianaUiDocsComponent: (slug: string) => `/viviana-ui/docs/components/${slug}`,
  vivianaUiDocsHook: (slug: string) => `/viviana-ui/docs/hooks/${slug}`,
  /** The generated `@proyecto-viviana/ui` reference. */
  apiReference: "/docs",
  apiComponent: (slug: string) => `/docs/components/${slug}`,
} as const;
