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
  Button,
  Divider,
  NotificationBadge,
  PixelNotificationIcon,
  PixelPlusIcon,
  Provider,
  Text,
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

        {/* The spec pairs the create-yellow fill with a plus glyph. `create` is a real
            Viviana-only variant so the fill is exact, and the glyph is now real too:
            PixelPlusIcon is the register's own plus (its path is byte-identical to the
            register's plus.svg asset), and Button threads IconContext to it so it takes
            the button's create ink and icon sizing — the same channel the spec draws it
            in. NEAR-MISS: the register's plus is the blocky pixel glyph, whereas this
            particular spec panel drew a thin 2.4px-stroke crosshair — the library is
            self-consistent with its own plus asset; the spec's hairline plus is the
            one-off, and its own bell (below) is pixel-art like ours. */}
        {/* The label is wrapped in <Text> — not a bare string — because that is the
            slotted-label API a real consumer uses for an icon+label button. Button
            auto-slots a *lone* string child, but alongside an icon the bare string
            stays unslotted, and control()'s icon-only rule
            (:has([slot=icon]):not(:has([data-rsp-slot=text]))) then reads the button
            as icon-only and collapses its horizontal padding to 0. <Text> takes the
            button's text slot (Button.tsx:167-170), so the label is seen and the
            create CTA keeps its normal edge-to-text padding. */}
        <Button variant="create">
          <PixelPlusIcon />
          <Text>Create</Text>
        </Button>

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

        {/* ActionButton is the real host for NotificationBadge (it provides the badge's
            context and absolute placement), the badge count is exact, and the bell is
            now the register's own PixelNotificationIcon — the masked pixel-art glyph,
            drawn from the same notification.svg asset the spec uses, sized/inked through
            ActionButton's IconContext. Two REAL residuals remain: no button in the
            library has a circular shape, so this renders as the register's rounded rect
            rather than the spec's 40px circle; and the spec's counter is create-yellow
            (--accent-create-bg/ink) whereas NotificationBadge has no variant prop and
            always paints accent. */}
        <ActionButton aria-label="Notifications">
          <PixelNotificationIcon />
          <NotificationBadge value={3} />
        </ActionButton>
      </Provider>
    </Panel>
  );
}
