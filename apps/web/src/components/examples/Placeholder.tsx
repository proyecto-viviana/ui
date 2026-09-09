/* Placeholder body for a screen whose composition has not landed yet.
 *
 * The routes have to exist before the screens do: the route manifest, the SEO
 * gate, the purity guard and the axe sweep all key off the file tree, and a
 * route added later is a route those gates never saw. This renders the
 * registry's own description of the screen so a placeholder is still a real
 * page — a heading, what the screen is, and which exports it is going to have
 * to carry. Batches C1–C6 replace each call with the screen itself.
 */
import { type JSX } from "solid-js";
import { Heading, Text, typeRoles } from "@proyecto-viviana/ui";
import { exampleBySlug } from "./registry";

export function Placeholder(props: { readonly slug: string }): JSX.Element {
  const def = () => exampleBySlug(props.slug);
  return (
    <div class="ex-placeholder">
      <Heading level={1}>{def()?.title ?? props.slug}</Heading>
      <Text styles={typeRoles.body}>{def()?.blurb}</Text>
      <Text styles={typeRoles.meta}>
        Composes {def()?.components.join(", ")}. This screen is scaffolded — its composition lands
        with the batch that owns it.
      </Text>
    </div>
  );
}
