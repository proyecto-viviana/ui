// Adapted from @astrojs/solid-js 7.0.2 (MIT); see LICENSE in this directory.
import { createComponent, NoHydration } from "solid-js";
import { renderToStream, renderToString, ssr } from "@solidjs/web";
import { createIsland } from "./island.mjs";
import { renderIslandBootstrap } from "./bootstrap.mjs";

const requestIds = new WeakMap();
const slotName = (name) => name.trim().replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase());

async function renderToStaticMarkup(Component, props, slotted = {}, metadata = {}) {
  const index = requestIds.get(this.result) ?? 0;
  const hydratable = Boolean(metadata.hydrate);
  const renderId = hydratable ? `s${index}` : "";
  if (hydratable) requestIds.set(this.result, index + 1);
  const tag = hydratable ? "astro-slot" : "astro-static-slot";
  const nextProps = { ...props };
  for (const [name, html] of Object.entries(slotted)) {
    nextProps[name === "default" ? "children" : slotName(name)] = ssr(
      `<${tag}${name === "default" ? "" : ` name="${name}"`}>${html}</${tag}>`,
    );
  }
  const tree = () => createIsland(Component, nextProps, hydratable);
  const render = hydratable
    ? tree
    : () =>
        createComponent(NoHydration, {
          get children() {
            return tree();
          },
        });
  let failed = false;
  let failure;
  const options = {
    renderId,
    noScripts: !hydratable,
    onError(error, context) {
      // Solid 2's stream thenable resolves even when the request failed.
      // Do not turn an empty/partial render into a successful Astro response.
      if (context.handling === "failed" && !failed) {
        failed = true;
        failure = error;
      } else if (context.handling !== "failed") {
        // Boundary fallbacks and client recovery remain supported, but a
        // handled/serialization diagnostic must not disappear in this hook.
        console.error(error);
      }
    },
  };
  const html =
    metadata.renderStrategy === "sync"
      ? renderToString(render, options)
      : await renderToStream(render, options);
  if (failed) throw failure;
  return { attrs: { "data-solid-render-id": renderId }, html };
}

async function check(Component, props, children) {
  if (typeof Component !== "function" || Component.name === "QwikComponent") return false;
  const source = Component.toString();
  if (source.includes("$$payload") || source.includes("$$renderer")) return false;
  try {
    const { html } = await renderToStaticMarkup.call(this, Component, props, children, {
      renderStrategy: "sync",
    });
    return typeof html === "string";
  } catch {
    return false;
  }
}

export default {
  name: "@astrojs/solid",
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true,
  renderHydrationScript: renderIslandBootstrap,
};
