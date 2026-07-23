/* The nine Viviana-UI mirror twins, keyed by register number so the Parity
   route can zip each against its hand-built spec panel (see ../spec-panels). */
import type { JSX } from "solid-js";
import { MirrorPanel01 } from "./Panel01";
import { MirrorPanel02 } from "./Panel02";
import { MirrorPanel03 } from "./Panel03";
import { MirrorPanel04 } from "./Panel04";
import { MirrorPanel05 } from "./Panel05";
import { MirrorPanel06 } from "./Panel06";
import { MirrorPanel07 } from "./Panel07";
import { MirrorPanel08 } from "./Panel08";
import { MirrorPanel09 } from "./Panel09";

export const MIRROR_PANELS: readonly {
  readonly num: string;
  readonly Mirror: () => JSX.Element;
}[] = [
  { num: "01", Mirror: MirrorPanel01 },
  { num: "02", Mirror: MirrorPanel02 },
  { num: "03", Mirror: MirrorPanel03 },
  { num: "04", Mirror: MirrorPanel04 },
  { num: "05", Mirror: MirrorPanel05 },
  { num: "06", Mirror: MirrorPanel06 },
  { num: "07", Mirror: MirrorPanel07 },
  { num: "08", Mirror: MirrorPanel08 },
  { num: "09", Mirror: MirrorPanel09 },
];
