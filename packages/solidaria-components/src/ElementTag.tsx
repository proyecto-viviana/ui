import { type JSX, createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

export interface ElementTagProps extends Record<string, unknown> {
  /** The HTML tag name to render. */
  tag: string;
  children?: JSX.Element;
}

/**
 * Renders a string tag as a *statically compiled* element.
 *
 * A drop-in replacement for `<Dynamic component={someString}>`, which is unsafe
 * anywhere that can render after hydration settles. Solid's `createDynamic`
 * string branch calls `getNextElement()` with **no** `template` argument
 * (solid-js 1.9.14, `web/dist/dev.js:771`). `getNextElement(template)` only
 * reaches the registry while `isHydrating()` holds; once `sharedConfig.done` is
 * set — hydration finished, but `sharedConfig.context` still live — it falls
 * through to `return template()` and throws `TypeError: template is not a
 * function`. Any deferred child lands on exactly that path: a `<Show>` that
 * flips, a Suspense resolution, a portal, a container that defers its children.
 *
 * Each branch below is real JSX, so the compiler emits a `template()` of its own
 * and hands it to `getNextElement(template)` — which adopts the SSR node from the
 * registry during hydration and clones the template afterwards. Both phases work.
 *
 * Props other than `tag` are spread through untouched, `children` included, so
 * this matches `<Dynamic>`'s behaviour exactly (`Dynamic` likewise splits only
 * `component` and spreads the rest onto the element).
 */
export function ElementTag(props: ElementTagProps): JSX.Element {
  const [local, rest] = splitProps(props, ["tag"]);
  // Two memos, layered exactly as `<Dynamic>` layers them, and for the same reason.
  // Reading a single key off a merged-props proxy forces the dynamic spread behind
  // it to evaluate (to settle key precedence), which subscribes the reader to every
  // signal that spread touches. Absorbing that read in `cached` keeps it off the memo
  // below: `cached` re-runs freely, but its *value* only moves when the tag really
  // changes, so the element is rebuilt only then. Inline the read into the memo below
  // instead and any prop change recreates the DOM node — blowing away focus, and
  // looping where an ancestor counts the children it just rendered.
  const cached = createMemo(() => local.tag);
  return createMemo(() => {
    switch (cached()) {
      // Text / inline
      case "span":
        return <span {...rest} />;
      case "a":
        return <a {...rest} />;
      case "p":
        return <p {...rest} />;
      case "label":
        return <label {...rest} />;
      case "strong":
        return <strong {...rest} />;
      case "em":
        return <em {...rest} />;
      case "small":
        return <small {...rest} />;
      // Flow
      case "div":
        return <div {...rest} />;
      case "hr":
        return <hr {...rest} />;
      case "li":
        return <li {...rest} />;
      case "ul":
        return <ul {...rest} />;
      case "ol":
        return <ol {...rest} />;
      case "figure":
        return <figure {...rest} />;
      case "blockquote":
        return <blockquote {...rest} />;
      case "address":
        return <address {...rest} />;
      // Headings
      case "h1":
        return <h1 {...rest} />;
      case "h2":
        return <h2 {...rest} />;
      case "h3":
        return <h3 {...rest} />;
      case "h4":
        return <h4 {...rest} />;
      case "h5":
        return <h5 {...rest} />;
      case "h6":
        return <h6 {...rest} />;
      // Landmarks
      case "main":
        return <main {...rest} />;
      case "nav":
        return <nav {...rest} />;
      case "header":
        return <header {...rest} />;
      case "footer":
        return <footer {...rest} />;
      case "aside":
        return <aside {...rest} />;
      case "section":
        return <section {...rest} />;
      case "article":
        return <article {...rest} />;
      case "form":
        return <form {...rest} />;
      case "search":
        return <search {...rest} />;
      default:
        // A tag no component in this package emits. Kept on `<Dynamic>` rather
        // than hand-built so hydration still adopts the SSR node; it inherits
        // the post-hydration caveat above, which is why every tag the library
        // itself renders is listed explicitly.
        return <Dynamic component={local.tag} {...rest} />;
    }
  }) as unknown as JSX.Element;
}
