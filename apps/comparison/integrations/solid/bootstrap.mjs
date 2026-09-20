// Astro starts independent roots over the page's lifetime. Solid rc.9 clears
// its event queue after a root completes, so unopened islands need their own
// weakly-held queues until their renderer starts. Replay remains Solid-owned.
function installIslandBootstrap() {
  const hydration = (window._$HY ??= { events: [], completed: new WeakSet(), r: {}, fe() {} });
  if (hydration.astroIslands) return;
  const pending = new WeakMap();
  const started = new WeakMap();
  const owners = new WeakMap();
  hydration.astroIslands = {
    start(island) {
      hydration.done = false;
      hydration.events ??= [];
      hydration.completed ??= new WeakSet();
      started.set(island, hydration.completed);
      for (const entry of pending.get(island) ?? []) {
        if (!hydration.events.includes(entry)) hydration.events.push(entry);
      }
      pending.delete(island);
    },
    stop(island) {
      pending.delete(island);
      started.set(island, null);
      // Mutate in place: Solid may already have scheduled this queue's drain.
      const events = hydration.events;
      for (let index = (events?.length ?? 0) - 1; index >= 0; index--) {
        if (owners.get(events[index][1]) === island) events.splice(index, 1);
      }
    },
  };
  for (const type of ["click", "input"]) {
    document.addEventListener(
      type,
      (event) => {
        const path = event.composedPath();
        const island = path.find((node) => node.nodeName === "ASTRO-ISLAND");
        // Do not cross a nested foreign island to capture its parent's events.
        if (
          !island?.hasAttribute("ssr") ||
          !island.hasAttribute("data-solid-render-id") ||
          island.getAttribute("client") === "only"
        )
          return;
        const node = path
          .slice(0, path.indexOf(island))
          .find((entry) => entry.hasAttribute?.("_hk"));
        if (!node || hydration.completed?.has(node)) return;
        owners.set(event, island);
        if (started.has(island)) {
          // Preserve capture during native pending claims, but never resurrect a
          // completed/failed root when another island creates a new native queue.
          const completed = started.get(island);
          if (completed && completed === hydration.completed) hydration.events?.push([node, event]);
        } else {
          let events = pending.get(island);
          if (!events) pending.set(island, (events = []));
          const entry = [node, event];
          events.push(entry);
          hydration.astroIslands.capture?.(entry, () => pending.get(island)?.includes(entry));
        }
      },
      true,
    );
  }
}

export function renderIslandBootstrap() {
  return `<script>(${installIslandBootstrap.toString()})();</script><!--xs-->`;
}
