/* Theme bridge for the ported spec island (primitives + mirror twins).

   The frozen design repo drove its lab off an island-local `useGlasselatedTheme`
   (a `data-theme` context on the island root). Here the whole showcase already
   runs on the site-wide `data-color-scheme` theme via `@/utils/theme`, so this
   shim maps the frozen hook name onto our real theme signal — the spec panels
   and their mirrors then track the same theme wipe as every other showcase tab,
   and none of the copied-in files need their imports rewritten. */
export { useTheme as useGlasselatedTheme } from "@/utils/theme";
