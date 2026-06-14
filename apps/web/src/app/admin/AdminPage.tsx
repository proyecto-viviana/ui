import { For, Match, Show, Switch, createResource, createSignal } from "solid-js";
import { ArchitecturePanel } from "./ArchitecturePanel";
import { DocsPanel } from "./DocsPanel";
import { GlossaryPanel } from "./GlossaryPanel";
import { HomePanel } from "./HomePanel";
import { RoadmapPanel } from "./RoadmapPanel";
import { TasksPanel } from "./TasksPanel";
import { fetchDocs, fetchGit } from "./api";

type TabId = "home" | "roadmap" | "tasks" | "docs" | "architecture" | "glossary";

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "Dashboard" },
  { id: "roadmap", label: "Roadmap" },
  { id: "tasks", label: "Tasks" },
  { id: "docs", label: "Docs" },
  { id: "architecture", label: "Architecture" },
  { id: "glossary", label: "Glossary" },
];

export function AdminPage() {
  const [tab, setTab] = createSignal<TabId>("home");
  const [openDocPath, setOpenDocPath] = createSignal<string | null>(null);
  const [docs, { refetch: refetchDocs }] = createResource(fetchDocs);
  const [git, { refetch: refetchGit }] = createResource(fetchGit);

  const openDoc = (path: string) => {
    setOpenDocPath(path);
    setTab("docs");
  };

  const onChanged = () => {
    void refetchDocs();
    void refetchGit();
  };

  return (
    <div class="admin-root">
      <header class="admin-header">
        <h1>Proyecto Viviana Admin</h1>
        <nav>
          <For each={TABS}>
            {(entry) => (
              <button classList={{ active: tab() === entry.id }} onClick={() => setTab(entry.id)}>
                {entry.label}
              </button>
            )}
          </For>
        </nav>
        <span class="spacer" />
        <span class="chip">dev-only</span>
      </header>

      <main class="admin-main">
        <Show when={docs()} fallback={<p class="muted admin-loading">Loading project state…</p>}>
          {(data) => (
            <Switch>
              <Match when={tab() === "home"}>
                <HomePanel data={data()} git={git()} onOpenDoc={openDoc} />
              </Match>
              <Match when={tab() === "roadmap"}>
                <RoadmapPanel data={data()} onOpenDoc={openDoc} onChanged={onChanged} />
              </Match>
              <Match when={tab() === "tasks"}>
                <TasksPanel data={data()} onOpenDoc={openDoc} onChanged={onChanged} />
              </Match>
              <Match when={tab() === "docs"}>
                <DocsPanel
                  data={data()}
                  git={git()}
                  openPath={openDocPath()}
                  onOpenDoc={setOpenDocPath}
                  onChanged={onChanged}
                />
              </Match>
              <Match when={tab() === "architecture"}>
                <ArchitecturePanel />
              </Match>
              <Match when={tab() === "glossary"}>
                <GlossaryPanel data={data()} onOpenDoc={openDoc} />
              </Match>
            </Switch>
          )}
        </Show>
      </main>
    </div>
  );
}
