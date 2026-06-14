import { For, Show, createResource } from "solid-js";
import { fetchPackages } from "./api";

// Live workspace graph from pnpm-workspace.yaml + each package.json (internal
// dependencies only).
export function ArchitecturePanel() {
  const [packages] = createResource(fetchPackages);

  const dependents = (name: string) =>
    packages()
      ?.packages.filter((pkg) => pkg.deps.includes(name))
      .map((pkg) => pkg.name) ?? [];

  return (
    <div class="panel">
      <section class="card">
        <h2>Workspace packages</h2>
        <Show when={packages()} fallback={<p class="muted">Reading workspace manifests…</p>}>
          <div class="pkg-grid">
            <For each={packages()!.packages}>
              {(pkg) => (
                <div class="pkg-card">
                  <h3>{pkg.name}</h3>
                  <code class="muted">{pkg.manifestDir}</code>
                  <Show when={pkg.description}>
                    <p>{pkg.description}</p>
                  </Show>
                  <Show when={pkg.deps.length > 0}>
                    <p class="muted">depends on: {pkg.deps.join(", ")}</p>
                  </Show>
                  <Show when={dependents(pkg.name).length > 0}>
                    <p class="muted">used by: {dependents(pkg.name).join(", ")}</p>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </section>
    </div>
  );
}
