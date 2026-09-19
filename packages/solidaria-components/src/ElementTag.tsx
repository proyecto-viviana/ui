/**
 * Local Solid helper for reactive HTML tags across SSR, hydration, and updates.
 * The pinned React Aria Components source has no ElementTag counterpart.
 */

import type { JSX } from "@solidjs/web";
import { dynamic } from "@solidjs/web";
import { splitProps } from "@proyecto-viviana/solidaria/utils";

export interface ElementTagProps extends Record<string, unknown> {
  /** The HTML tag name to render. */
  tag: string;
  children?: JSX.Element;
}

/**
 * Solid 2's native dynamic helper adopts SSR elements during hydration and
 * creates new elements after it settles. Its separate tag-source memo keeps
 * unrelated reactive spread updates from replacing the element. Only `tag`
 * selects the element; all other props, including children, are forwarded.
 */
export function ElementTag(props: ElementTagProps): JSX.Element {
  const [local, rest] = splitProps(props, ["tag"]);
  const Tag = dynamic(() => local.tag);
  return <Tag {...rest} />;
}
