/**
 * Shared fixture for the TagGroup SSR/hydration regression.
 *
 * `renderItem` in TagGroup's source calls `isRenderedTag()` on each resolved child to decide
 * whether the render-prop already produced a `<Tag>` (skip wrapping) or plain content that needs
 * wrapping in a `<Tag>`. That helper does `value instanceof HTMLElement`, which historically is
 * the kind of check that can misbehave when `HTMLElement` doesn't exist in the SSR global scope
 * (Node has no DOM classes). The common real-world shape — `{(item) => item.name}` returning a
 * bare string, as in the playground TagGroup demos — exercises exactly the path that must not
 * throw or mis-wrap during `renderToString`.
 */
import type { JSX } from "solid-js";
import { Provider, Tag, TagGroup } from "../../src";

const FRAMEWORK_ITEMS = [
  { id: "react", name: "React" },
  { id: "solid", name: "SolidJS" },
  { id: "vue", name: "Vue" },
];

/** Typical usage: the render prop returns plain string content, so TagGroup wraps each item in
 * a `<Tag>` itself — the path that walks through `isRenderedTag`'s `instanceof` check on the
 * server, where the string is neither an array nor (in real SSR) an `HTMLElement`. */
export function TagGroupFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <TagGroup aria-label="Frameworks" items={FRAMEWORK_ITEMS}>
        {(item: (typeof FRAMEWORK_ITEMS)[number]) => item.name}
      </TagGroup>
    </Provider>
  );
}

/** The render prop returns an already-built `<Tag>` element (e.g. to attach a per-item href or
 * onAction). `isRenderedTag` must recognize this and skip the extra wrap on both the server and
 * client, or the tree shape (and hydration key count) diverges between them. */
export function TagGroupPrebuiltTagFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <TagGroup aria-label="Frameworks" items={FRAMEWORK_ITEMS}>
        {(item: (typeof FRAMEWORK_ITEMS)[number]) => <Tag id={item.id}>{item.name}</Tag>}
      </TagGroup>
    </Provider>
  );
}
