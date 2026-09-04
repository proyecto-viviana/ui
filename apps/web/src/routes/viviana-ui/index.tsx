import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/viviana-ui/")({
  beforeLoad: () => {
    throw redirect({ to: "/viviana-ui/docs" });
  },
  component: () => null,
});
