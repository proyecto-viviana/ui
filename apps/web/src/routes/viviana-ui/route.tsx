/* /viviana-ui layout. Pass-through only: the root Provider already paints
   @proyecto-viviana/ui, and this tree must not load Spectrum's stylesheet. */
import { Outlet, createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/viviana-ui")({
  component: () => <Outlet />,
});
