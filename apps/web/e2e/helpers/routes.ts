export const routes = {
  docs: "/solid-spectrum/docs",
  docsComponent: (slug: string) => `/solid-spectrum/docs/components/${slug}`,
  docsHook: (slug: string) => `/solid-spectrum/docs/hooks/${slug}`,
  playground: "/solid-spectrum/playground",
} as const;
