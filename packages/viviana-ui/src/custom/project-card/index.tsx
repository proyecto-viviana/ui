import type { JSX } from "solid-js";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). A square logo/preview tile with a caption, sized by the S2
// spacing + type ramps and painted in Silapse colors. `inactive` dims it;
// `href` turns the whole card into a link.
import { style } from "../../style" with { type: "macro" };

export type ProjectCardSize = "sm" | "md" | "lg";

export interface ProjectCardProps {
  name: string;
  imageSrc: string;
  imageAlt?: string;
  href?: string;
  size?: ProjectCardSize;
  inactive?: boolean;
  class?: string;
}

const card = style<{ size: ProjectCardSize; inactive: boolean }>({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  width: "full",
  borderRadius: "lg",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "[var(--color-border)]",
  backgroundColor: "[var(--color-bg-200)]",
  color: "[var(--color-primary-100)]",
  textDecoration: "none",
  padding: { size: { sm: 12, md: 16, lg: 20 } },
  opacity: { default: 1, inactive: 0.5 },
});

const image = style({
  width: "full",
  aspectRatio: "square",
  objectFit: "contain",
  borderRadius: "sm",
});

const caption = style<{ size: ProjectCardSize }>({
  width: "full",
  textAlign: "center",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "[var(--color-primary-200)]",
  font: { size: { sm: "ui-sm", md: "ui", lg: "ui-lg" } },
});

export function ProjectCard(props: ProjectCardProps): JSX.Element {
  const size = () => props.size ?? "sm";
  const inactive = () => props.inactive ?? false;

  const cardContent = () => (
    <>
      <img class={image} src={props.imageSrc} alt={props.imageAlt ?? props.name} />
      <span class={caption({ size: size() })}>{props.name}</span>
    </>
  );

  const classes = () => `${card({ size: size(), inactive: inactive() })} ${props.class ?? ""}`;

  if (props.href) {
    return (
      <a href={props.href} target="_blank" rel="noopener noreferrer" class={classes()}>
        {cardContent()}
      </a>
    );
  }

  return <div class={classes()}>{cardContent()}</div>;
}
