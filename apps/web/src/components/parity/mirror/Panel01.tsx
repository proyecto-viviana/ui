/* Mirror of spec panel 01 (BUTTONS) built from real Viviana UI components.

   Five of the spec's seven controls map onto a real button variant, so this panel
   is mostly a straight like-for-like and the differences that remain are the
   register differences the side-by-side exists to measure (radius, padding, rim).
   The two that do NOT map — the mono `[ F5 ] RUN` well-button and the round
   notification bell — are substituted with the nearest real component and called
   out below rather than hand-rolled, since a faked control would hide the gap. */
import { type JSX } from "solid-js";
import {
  ActionButton,
  BellIcon,
  Button,
  Divider,
  NotificationBadge,
  Provider,
} from "@proyecto-viviana/ui";
import { Panel } from "../lab-shell";
import { useGlasselatedTheme } from "../glasselated-theme";

export function MirrorPanel01(): JSX.Element {
  const { theme } = useGlasselatedTheme();

  return (
    <Panel label="01 // BUTTONS — VIVIANA UI">
      <Provider
        colorScheme={theme()}
        class="viviana-mirror-zone"
        data-mirror="01"
        style={{
          display: "flex",
          "align-items": "center",
          gap: "12px",
          "flex-wrap": "wrap",
        }}
      >
        {/* Spec's filled CTA: --interactive-fill on --text-on-accent. That is the
            accent variant's job; `primary` is the neutral-ink fill, not this one. */}
        <Button variant="accent">Resume</Button>

        <Button variant="secondary">Today</Button>

        {/* The spec pairs the create-yellow fill with a 13px plus glyph. `create` is
            a real Viviana-only variant so the fill is exact, but the glyph is a gap:
            the package ships exactly seven icons (Bell/Close/Contrast/Lighten/Link/
            MenuHamburger/Search) — AddIcon exists as a .d.ts in dist/icon/s2wf-icons
            with no built .js and no subpath export, so it cannot be imported. Drawing
            an inline <svg> here would be hand-rolling the thing this panel is meant
            to detect, so the button ships label-only and the icon is reported. */}
        <Button variant="create">Create</Button>

        {/* Spec ghost = transparent fill + --border-subtle + secondary ink, i.e. an
            outlined secondary, not a quiet ActionButton (which drops the border). */}
        <Button variant="secondary" fillStyle="outline">
          Ghost
        </Button>

        {/* Substitution. The spec's run button is a *terminal well* rendered as a
            control: --surface-well fill, --well-border, --well-run-fg ink, mono face
            with 0.06em tracking. No button variant carries the well surface or the
            mono face — the register's mono chrome is applied to labels and eyebrows,
            not to button text — so ActionButton stands in as the nearest neutral
            chrome control and the label is kept verbatim. It will read as a normal
            grey action button, which is the finding. */}
        <ActionButton>[ F5 ] RUN</ActionButton>

        {/* The spec's 1px × 26px rule. Divider sets alignSelf:stretch, so in this
            centred flex row it takes the row height rather than the drawn 26px. */}
        <Divider orientation="vertical" size="S" />

        {/* Substitution. ActionButton is the real host for NotificationBadge (it
            provides the badge's context and absolute placement), and the badge count
            is exact. Two gaps: no button in the library has a circular shape, so this
            renders as the register's rounded rect rather than the spec's 40px circle;
            and the spec's counter is create-yellow (--accent-create-bg/ink) whereas
            NotificationBadge has no variant prop and always paints accent. The bell
            is also Spectrum's vector BellIcon, not the island's masked pixel-art
            PixelIcon — the library ships no pixel icon set. */}
        <ActionButton aria-label="Notifications">
          <BellIcon />
          <NotificationBadge value={3} />
        </ActionButton>
      </Provider>
    </Panel>
  );
}
