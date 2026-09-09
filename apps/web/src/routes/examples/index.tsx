/* /examples — the directory of screens. Where /showcase is organised by
   component, this is organised by product surface: ten whole screens, each
   built from @proyecto-viviana/ui exports and nothing else. */
import { createFileRoute, Link } from "@tanstack/solid-router";
import { For } from "solid-js";
import { Card, Heading, Text, typeRoles } from "@proyecto-viviana/ui";
import { EXAMPLES } from "@/components/examples/registry";
import { seo } from "@/seo";

export const Route = createFileRoute("/examples/")({
  head: () =>
    seo({
      title: "Examples",
      description:
        "Ten whole Terminal Glass product screens — landing, home, explore, lesson, theater, live, profile, settings, playground — composed from Viviana UI components only.",
      path: "/examples",
    }),
  component: Gallery,
});

function Gallery() {
  return (
    <div class="ex-gallery">
      <div class="ex-screen">
        <Heading level={1}>Examples</Heading>
        <Text styles={typeRoles.body}>
          Ten product screens on the Glasselated register. Each one is a real page built from the
          library's exports — no app-authored colour, type or motion — so the register has to carry
          a whole surface, not a demo row.
        </Text>
      </div>

      <div class="ex-gallery-grid">
        <For each={EXAMPLES}>
          {(example) => (
            <Link to={`/examples/${example.slug}` as "/examples"}>
              <Card id={example.slug} class="ex-gallery-card" variant="secondary">
                <Text styles={typeRoles.micro}>
                  {example.num} · {example.components.length} components
                </Text>
                <Text styles={typeRoles.headline}>{example.title}</Text>
                <Text styles={typeRoles.meta}>{example.blurb}</Text>
              </Card>
            </Link>
          )}
        </For>
      </div>
    </div>
  );
}
