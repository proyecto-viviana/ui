import { createSignal, createEffect, For } from "solid-js";
// The creator is page chrome, not a demo, so every piece of it comes from the
// app-facing design system. The one exception is the native `<input type="color">`,
// which opens the OS colour picker — nothing in the library replaces that.
import {
  Button,
  Flex,
  Heading,
  SegmentedControl,
  SegmentedControlItem,
  Text,
  TextField,
  typeRoles,
} from "@proyecto-viviana/ui";
import {
  type ThemeMode,
  generatePalette,
  generateBgPalette,
  generateAccentPalette,
  defaultColors,
  hexToOklch,
} from "@/utils/color";

// The three surfaces the library has no component for: the OS colour picker and the
// two halves of the generated-ramp readout. All static, so they need no stylesheet.
const pickerStyle = {
  width: "40px",
  height: "40px",
  padding: "0",
  cursor: "pointer",
  background: "transparent",
  border: "1px solid var(--color-primary-600)",
  "border-radius": "var(--radius-md)",
} as const;

const shadeStyle = {
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
  width: "32px",
  height: "32px",
  "border-radius": "var(--radius-md)",
} as const;

// The chip has to read on every step of the ramp, so its own colours are fixed.
const shadeLabelStyle = {
  padding: "0 2px",
  "border-radius": "2px",
  background: "#06131d",
  color: "#f4f8fa",
} as const;

export interface ThemeCreatorProps {
  onThemeChange?: (cssVars: Record<string, string>) => void;
}

/** One colour: the OS picker, an editable hex, and the value read back in OKLCH. */
function ColorControl(props: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  // The hex field keeps its own draft so a half-typed value survives the keystroke.
  // Binding the field straight to the colour would revert every character that does
  // not yet spell a complete `#rrggbb`, which makes the input impossible to edit.
  const [draft, setDraft] = createSignal(props.value);
  createEffect(() => setDraft(props.value));

  const oklch = () => {
    const o = hexToOklch(props.value);
    return `L:${o.l.toFixed(2)} C:${o.c.toFixed(2)} H:${o.h.toFixed(0)}`;
  };

  return (
    <Flex direction="column" gap={2}>
      <Text styles={typeRoles.label}>{props.label}</Text>
      <Flex alignItems="start" gap={2}>
        <input
          type="color"
          style={pickerStyle}
          aria-label={`${props.label} color picker`}
          value={props.value}
          onInput={(e) => props.onChange(e.currentTarget.value)}
        />
        <Flex direction="column" gap={1}>
          <TextField
            size="S"
            // A six-digit hex never needs more, and the five controls have to sit on
            // one row at the width the panel actually gets.
            UNSAFE_style={{ width: "128px" }}
            aria-label={`${props.label} hex value`}
            value={draft()}
            onChange={(value: string) => {
              setDraft(value);
              if (/^#[0-9A-Fa-f]{6}$/.test(value)) props.onChange(value);
            }}
          />
          <Text styles={typeRoles.micro}>{oklch()}</Text>
        </Flex>
      </Flex>
    </Flex>
  );
}

export function ThemeCreator(props: ThemeCreatorProps) {
  const [mode, setMode] = createSignal<ThemeMode>("dark");
  const [primaryColor, setPrimaryColor] = createSignal(defaultColors.primary);
  const [bgColor, setBgColor] = createSignal(defaultColors.bg);
  const [accentColor, setAccentColor] = createSignal(defaultColors.accent);

  // Generate CSS variables whenever colors change
  createEffect(() => {
    const currentMode = mode();
    const primary = primaryColor();
    const bg = bgColor();
    const accent = accentColor();

    const primaryPalette = generatePalette(primary, currentMode);
    const bgPalette = generateBgPalette(bg, currentMode);
    const accentPalette = generateAccentPalette(accent);

    const cssVars: Record<string, string> = {
      // Background
      "--color-bg-100": bgPalette["100"],
      "--color-bg-200": bgPalette["200"],
      "--color-bg-300": bgPalette["300"],
      "--color-bg-400": bgPalette["400"],

      // Primary
      "--color-primary-100": primaryPalette["100"],
      "--color-primary-200": primaryPalette["200"],
      "--color-primary-300": primaryPalette["300"],
      "--color-primary-400": primaryPalette["400"],
      "--color-primary-500": primaryPalette["500"],
      "--color-primary-600": primaryPalette["600"],
      "--color-primary-700": primaryPalette["700"],
      "--color-primary-800": primaryPalette["800"],

      // Accent
      "--color-accent": accentPalette["500"],
      "--color-accent-200": accentPalette["200"],
      "--color-accent-300": accentPalette["300"],
      "--color-accent-500": accentPalette["500"],
      "--color-accent-highlight": accentPalette["highlight"],
    };

    props.onThemeChange?.(cssVars);
  });

  const [appearance, setAppearance] = createSignal<"dark" | "light">("dark");

  // Sync appearance with data-theme attribute
  createEffect(() => {
    document.documentElement.setAttribute("data-theme", appearance());
  });

  const shades = ["100", "200", "300", "400", "500", "600", "700", "800"];

  return (
    <div>
      <Heading level={3} UNSAFE_style={{ "margin-bottom": "16px" }}>
        Theme Creator
      </Heading>

      <Flex wrap gap={6}>
        <Flex direction="column" gap={2}>
          <Text styles={typeRoles.label}>Appearance</Text>
          <SegmentedControl
            aria-label="Appearance"
            selectedKey={appearance()}
            onSelectionChange={(id) => setAppearance(id as "dark" | "light")}
          >
            <SegmentedControlItem id="dark">Dark</SegmentedControlItem>
            <SegmentedControlItem id="light">Light</SegmentedControlItem>
          </SegmentedControl>
        </Flex>

        <Flex direction="column" gap={2}>
          <Text styles={typeRoles.label}>Palette Mode</Text>
          <SegmentedControl
            aria-label="Palette mode"
            selectedKey={mode()}
            onSelectionChange={(id) => setMode(id as ThemeMode)}
          >
            <SegmentedControlItem id="light">Light</SegmentedControlItem>
            <SegmentedControlItem id="dim">Dim</SegmentedControlItem>
            <SegmentedControlItem id="dark">Dark</SegmentedControlItem>
          </SegmentedControl>
        </Flex>

        <ColorControl label="Primary" value={primaryColor()} onChange={setPrimaryColor} />
        <ColorControl label="Background" value={bgColor()} onChange={setBgColor} />
        <ColorControl label="Accent" value={accentColor()} onChange={setAccentColor} />

        <Flex direction="column" gap={2} justifyContent="end">
          <Button
            variant="secondary"
            onPress={() => {
              setPrimaryColor(defaultColors.primary);
              setBgColor(defaultColors.bg);
              setAccentColor(defaultColors.accent);
              setMode("dark");
              setAppearance("dark");
            }}
          >
            Reset
          </Button>
        </Flex>
      </Flex>

      {/* The generated primary ramp, read back as swatches. */}
      <Flex gap={1} style={{ "margin-top": "16px" }}>
        <For each={shades}>
          {(shade) => {
            const palette = () => generatePalette(primaryColor(), mode());
            return (
              <div
                style={{ ...shadeStyle, background: palette()[shade] }}
                aria-label={`Primary shade ${shade}`}
              >
                <span class={typeRoles.micro} style={shadeLabelStyle}>
                  {shade}
                </span>
              </div>
            );
          }}
        </For>
      </Flex>
    </div>
  );
}
