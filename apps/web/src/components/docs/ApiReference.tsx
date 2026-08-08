import { For, Show } from "solid-js";
import type { ApiEntry, ApiPageData, ApiProp, PropDivergence } from "@/data/api-reference";
import { FONT_DISPLAY, FONT_MONO, FONT_SANS } from "./DocPage";

/**
 * A generated API reference page.
 *
 * Every row here comes from `apps/web/src/data/api-reference/pages/<slug>.json`,
 * which is written from the TypeScript checker by `vp run api:extract`. Nothing
 * on this page is hand-authored, which is the point: the hand-written tables in
 * the older docs tree drifted far enough to advertise Button variants the
 * package had already dropped, and no gate could tell.
 */
export interface ApiReferenceProps {
  page: ApiPageData;
}

const HEADINGS = ["Prop", "Type", "Default", "Description"];

export function ApiReference(props: ApiReferenceProps) {
  const page = () => props.page;
  const entries = () => page().entries;

  return (
    <div
      style={{
        "line-height": "1.7",
        "font-size": "14.5px",
        "font-family": FONT_SANS,
        color: "var(--text-secondary)",
      }}
    >
      <h1
        style={{
          "font-family": FONT_DISPLAY,
          "font-size": "26px",
          "font-weight": "600",
          margin: "0 0 10px 0",
          "padding-bottom": "12px",
          "border-bottom": "1px solid var(--border-default)",
          "letter-spacing": "0.01em",
          color: "var(--text-primary)",
        }}
      >
        {page().title}
      </h1>

      <p style={{ "margin-bottom": "1.5rem", "max-width": "62ch" }}>
        The complete prop surface of{" "}
        <code style={{ "font-family": FONT_MONO }}>{page().title}</code>, generated from the types{" "}
        <code style={{ "font-family": FONT_MONO }}>{page().packageName}</code> ships.
      </p>

      <Heading>Import</Heading>
      <Code>{`import { ${page().title} } from "${page().packageName}";`}</Code>

      <For each={entries()}>
        {(entry, index) => (
          <PropSection
            entry={entry}
            divergence={page().divergence[entry.name] ?? []}
            comparedWith={page().comparedWith}
            packageName={page().packageName}
            isPrimary={index() === 0}
          />
        )}
      </For>

      <Show when={entries().length > 0}>
        <p
          style={{
            "margin-top": "2.5rem",
            "padding-top": "1rem",
            "border-top": "1px solid var(--border-default)",
            "font-size": "13px",
          }}
        >
          Props marked <Origin origin="solidaria" /> or <Origin origin="solidaria-components" />{" "}
          come from the headless layer underneath and behave the same in both registers. Components
          that wrap a DOM element also accept that element's standard attributes, which are left out
          here on purpose — listing them would bury the props that are actually ours.
        </p>
      </Show>
    </div>
  );
}

function PropSection(props: {
  entry: ApiEntry;
  divergence: PropDivergence[];
  comparedWith: string;
  packageName: string;
  isPrimary: boolean;
}) {
  const differences = () => props.divergence;

  return (
    <section style={{ "margin-top": "2rem" }}>
      <Heading>{props.isPrimary ? "Props" : `${props.entry.component} props`}</Heading>

      <Show when={differences().length > 0}>
        <div
          style={{
            margin: "0.75rem 0",
            padding: "12px 14px",
            background: "color-mix(in srgb, var(--accent-primary) 8%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)",
            "border-radius": "var(--radius-md)",
            "font-size": "13px",
          }}
        >
          <strong style={{ color: "var(--text-primary)" }}>
            Differs from {props.comparedWith}
          </strong>
          <ul style={{ margin: "0.5rem 0 0 1rem", padding: "0" }}>
            <For each={differences()}>
              {(difference) => (
                <li>
                  <code style={{ "font-family": FONT_MONO }}>{difference.prop}</code>{" "}
                  <Show when={difference.kind === "only-here"}>exists only here.</Show>
                  <Show when={difference.kind === "only-there"}>
                    exists only in the other register.
                  </Show>
                  <Show when={difference.kind === "values"}>
                    <Show when={difference.here?.length}>adds {difference.here!.join(", ")}</Show>
                    <Show when={difference.here?.length && difference.there?.length}>; </Show>
                    <Show when={difference.there?.length}>
                      does not have {difference.there!.join(", ")}
                    </Show>
                    .
                  </Show>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>

      <div
        style={{
          margin: "0.75rem 0",
          "overflow-x": "auto",
          border: "1px solid var(--border-default)",
          "border-radius": "var(--radius-md)",
          background: "var(--surface-well)",
        }}
      >
        <table style={{ width: "100%", "font-size": "13px", "border-collapse": "collapse" }}>
          <caption class="sr-only">
            Props for {props.entry.component} in {props.packageName}
          </caption>
          <thead>
            <tr style={{ "border-bottom": "1px solid var(--border-default)" }}>
              <For each={HEADINGS}>
                {(heading) => (
                  <th
                    scope="col"
                    style={{
                      padding: "9px 12px",
                      "text-align": "left",
                      "font-weight": "700",
                      "font-family": FONT_MONO,
                      "font-size": "10px",
                      "text-transform": "uppercase",
                      "letter-spacing": "0.09em",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {heading}
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={props.entry.props}>{(prop) => <PropRow prop={prop} />}</For>
          </tbody>
        </table>
      </div>

      <p style={{ "font-size": "12px" }}>
        Declared in <code style={{ "font-family": FONT_MONO }}>{props.entry.source}</code>.
      </p>
    </section>
  );
}

function PropRow(props: { prop: ApiProp }) {
  // Long literal unions are the norm on variant props — Badge has 33 — so the
  // type cell wraps rather than forcing the whole table into a scrollbar.
  const rendered = () => (props.prop.values ? props.prop.values.join(" | ") : props.prop.type);

  return (
    <tr style={{ "border-bottom": "1px solid var(--border-default)" }}>
      <td style={{ padding: "8px 12px", "white-space": "nowrap" }}>
        <code
          style={{
            background: "color-mix(in srgb, var(--accent-primary) 12%, transparent)",
            // Ink reads `--text-link`, not `--accent-primary`: the tint behind it is the
            // accent at 12%, and the accent on its own 12% tint is 2.50:1.
            color: "var(--text-link)",
            padding: "2px 6px",
            "border-radius": "var(--radius-sm)",
            "font-family": FONT_MONO,
            "font-size": "12px",
            "font-weight": "500",
            border: "1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)",
          }}
        >
          {props.prop.name}
        </code>
        <Show when={props.prop.required}>
          <span
            title="Required"
            aria-label="Required"
            style={{ color: "var(--text-link)", "margin-left": "4px", "font-weight": "700" }}
          >
            *
          </span>
        </Show>
      </td>
      <td
        style={{
          padding: "8px 12px",
          "font-family": FONT_MONO,
          "font-size": "12px",
          color: "var(--text-secondary)",
          "max-width": "34ch",
          "overflow-wrap": "anywhere",
        }}
      >
        {rendered()}
      </td>
      <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>
        <Show when={props.prop.default} fallback="—">
          <code style={{ "font-family": FONT_MONO, "font-size": "12px" }}>
            {props.prop.default}
          </code>
        </Show>
      </td>
      <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>
        <Show when={props.prop.description} fallback={<Undocumented />}>
          {props.prop.description}
        </Show>
        <Show when={props.prop.origin !== "viviana-ui" && props.prop.origin !== "solid-spectrum"}>
          {" "}
          <Origin origin={props.prop.origin} />
        </Show>
      </td>
    </tr>
  );
}

/**
 * An honest blank. 414 of viviana-ui's own props carry no doc comment yet, and
 * saying so beats an empty cell that reads like an oversight in the page.
 *
 * Italic and nothing else. The first draft dimmed this with `opacity: 0.55`,
 * which axe measured at 2.0:1 against the light docs surface — the worst
 * contrast on the page and the only failure this feature introduced. The cell's
 * own `--text-secondary` already reads as subordinate; the italic carries the
 * rest.
 */
function Undocumented() {
  return (
    <span style={{ "font-style": "italic", color: "var(--text-secondary)" }}>
      Not yet documented
    </span>
  );
}

function Origin(props: { origin: string }) {
  return (
    <span
      style={{
        "font-family": FONT_MONO,
        "font-size": "10.5px",
        padding: "1px 5px",
        "border-radius": "var(--radius-sm)",
        border: "1px solid var(--border-default)",
        color: "var(--text-secondary)",
        "white-space": "nowrap",
      }}
    >
      {props.origin}
    </span>
  );
}

function Heading(props: { children: string }) {
  return (
    <h2
      style={{
        "font-family": FONT_DISPLAY,
        "font-size": "14px",
        "font-weight": "600",
        margin: "2rem 0 0.75rem 0",
        "padding-left": "12px",
        "border-left": "2px solid var(--accent-primary)",
        "letter-spacing": "0.01em",
        color: "var(--text-primary)",
      }}
    >
      {props.children}
    </h2>
  );
}

function Code(props: { children: string }) {
  return (
    <pre
      style={{
        background: "var(--surface-well)",
        color: "var(--text-primary)",
        padding: "12px 14px",
        "overflow-x": "auto",
        margin: "0.75rem 0",
        "font-family": FONT_MONO,
        "font-size": "12.5px",
        border: "1px solid var(--well-border)",
        "border-radius": "var(--radius-md)",
      }}
    >
      <code>{props.children}</code>
    </pre>
  );
}
