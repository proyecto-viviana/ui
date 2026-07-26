export const routes = {
  docs: "/solid-spectrum/docs",
  docsComponent: (slug: string) => `/solid-spectrum/docs/components/${slug}`,
  docsHook: (slug: string) => `/solid-spectrum/docs/hooks/${slug}`,
  playground: "/solid-spectrum/playground",
  /** The generated `@proyecto-viviana/ui` reference. */
  apiReference: "/docs",
  apiComponent: (slug: string) => `/docs/components/${slug}`,
} as const;
