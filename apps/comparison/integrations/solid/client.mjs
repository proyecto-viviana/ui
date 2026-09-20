// Adapted from @astrojs/solid-js 7.0.2 (MIT); see LICENSE in this directory.
import { hydrate, render, runHydrationEvents } from "@solidjs/web";
import { flush, sharedConfig } from "solid-js";
import { createIsland } from "./island.mjs";

const initialized = new WeakMap();
const slotName = (name) => name.trim().replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase());

export default (element) =>
  (Component, props, slotted = {}, { client }) => {
    const previous = initialized.get(element);
    // Astro removes `ssr` after mounting, then calls this again for prop updates.
    if (!previous && !element.hasAttribute("ssr")) return;
    const hydratable = client !== "only";
    const slots = {};
    if ((hydratable || previous) && Object.keys(slotted).length) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, (node) => {
        if (node === element) return NodeFilter.FILTER_SKIP;
        if (node.nodeName === "ASTRO-SLOT") return NodeFilter.FILTER_ACCEPT;
        if (node.nodeName === "ASTRO-ISLAND") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_SKIP;
      });
      let node;
      while ((node = walker.nextNode())) slots[node.getAttribute("name") ?? "default"] = node;
    }
    const nextProps = { ...props };
    for (const [name, html] of Object.entries(slotted)) {
      const node = slots[name] ?? document.createElement("astro-slot");
      if (!slots[name]) {
        if (name !== "default") node.setAttribute("name", name);
        node.innerHTML = html;
      }
      nextProps[name === "default" ? "children" : slotName(name)] = node;
    }
    if (previous) {
      previous(nextProps);
      return;
    }
    let update;
    const tree = () =>
      createIsland(Component, nextProps, hydratable, (setter) => {
        update = setter;
      });
    if (!hydratable) element.replaceChildren();
    // Re-enter hydration for this root and transfer only its captured events.
    // Unopened islands must not block Solid's shared event-replay FIFO.
    const hydration = hydratable ? globalThis._$HY.astroIslands : undefined;
    // hydrate() flushes while its global claiming context is active. Settle older
    // islands first so their pending DOM writes are not treated as initial claims.
    if (hydratable) flush();
    if (hydration) {
      hydration.capture = (entry, stillPending) => {
        // A hydrated ancestor delegates before a document bubble listener. Expose
        // this event to Solid's native dedup guard during the original dispatch,
        // without stopping unrelated DOM/React listeners or blocking the FIFO
        // until this delayed island eventually starts.
        if (!sharedConfig.registry) return;
        const bootstrap = globalThis._$HY;
        const events = sharedConfig.events ?? bootstrap.events ?? [];
        sharedConfig.events = bootstrap.events = events;
        sharedConfig.completed = bootstrap.completed ??= new WeakSet();
        events.push(entry);
        queueMicrotask(() => {
          if (stillPending()) {
            const index = events.indexOf(entry);
            if (index !== -1) events.splice(index, 1);
          }
          runHydrationEvents();
        });
      };
    }
    hydration?.start(element);
    let dispose;
    try {
      dispose = hydratable
        ? hydrate(tree, element, { renderId: element.dataset.solidRenderId })
        : render(tree, element);
    } catch (error) {
      hydration?.stop(element);
      throw error;
    }
    initialized.set(element, update);
    element.addEventListener(
      "astro:unmount",
      () => {
        initialized.delete(element);
        hydration?.stop(element);
        dispose();
      },
      { once: true },
    );
  };
