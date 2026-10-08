import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import * as extraIcons from "../src/icon/extra-icons";
import EasingHoldIcon, {
  EasingHoldIcon as EasingHoldNamed,
} from "../src/icon/extra-icons/EasingHoldIcon";
import EasingInIcon, { EasingInIcon as EasingInNamed } from "../src/icon/extra-icons/EasingInIcon";
import EasingInOutIcon, {
  EasingInOutIcon as EasingInOutNamed,
} from "../src/icon/extra-icons/EasingInOutIcon";
import EasingLinearIcon, {
  EasingLinearIcon as EasingLinearNamed,
} from "../src/icon/extra-icons/EasingLinearIcon";
import EasingOutIcon, {
  EasingOutIcon as EasingOutNamed,
} from "../src/icon/extra-icons/EasingOutIcon";
import KeyframeIcon, { KeyframeIcon as KeyframeNamed } from "../src/icon/extra-icons/KeyframeIcon";
import SnapIcon, { SnapIcon as SnapNamed } from "../src/icon/extra-icons/SnapIcon";
import StopIcon, { StopIcon as StopNamed } from "../src/icon/extra-icons/StopIcon";

const packageRoot = resolve(import.meta.dirname, "..");
const repoRoot = resolve(packageRoot, "../..");

const glyphs = [
  ["EasingHoldIcon", EasingHoldIcon, EasingHoldNamed, "M3.5 16.5H16.5V3.5"],
  ["EasingInIcon", EasingInIcon, EasingInNamed, "M3.5 16.5C8.96 16.5 16.5 16.5 16.5 3.5"],
  ["EasingInOutIcon", EasingInOutIcon, EasingInOutNamed, "M3.5 16.5C8.96 16.5 11.04 3.5 16.5 3.5"],
  ["EasingLinearIcon", EasingLinearIcon, EasingLinearNamed, "M3.5 16.5 16.5 3.5"],
  ["EasingOutIcon", EasingOutIcon, EasingOutNamed, "M3.5 16.5C3.5 3.5 11.04 3.5 16.5 3.5"],
  ["KeyframeIcon", KeyframeIcon, KeyframeNamed, "M10 3.25 16.75 10 10 16.75 3.25 10Z"],
  ["SnapIcon", SnapIcon, SnapNamed, "M6.2 4.2v6.2a3.8 3.8 0 0 0 7.6 0V4.2"],
] as const;

describe("extra icons", () => {
  it("ships the same export conditions as the workflow icon subpath", () => {
    const pkg = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8")) as {
      exports: Record<string, Record<string, string>>;
    };
    const workflow = pkg.exports["./icon/s2wf-icons/*"];
    const extra = pkg.exports["./icon/extra-icons/*"];
    expect(Object.keys(extra)).toEqual(Object.keys(workflow));
    for (const key of Object.keys(workflow)) {
      expect(extra[key]).toBe(workflow[key].replaceAll("s2wf-icons", "extra-icons"));
    }
    expect(pkg.exports["./icon/ui-icons/DragHandle"]).toEqual({
      types: "./dist/icon/ui-icons/DragHandle.d.ts",
      solid: "./dist/icon/ui-icons/DragHandle.jsx",
      import: "./dist/icon/ui-icons/DragHandle.js",
      default: "./dist/icon/ui-icons/DragHandle.js",
    });
  });

  it("gives each glyph its own vite entry and leaves the icon barrels alone", () => {
    const names = readdirSync(resolve(packageRoot, "src/icon/extra-icons")).sort();
    expect(names).toEqual([
      "EasingHoldIcon.tsx",
      "EasingInIcon.tsx",
      "EasingInOutIcon.tsx",
      "EasingLinearIcon.tsx",
      "EasingOutIcon.tsx",
      "KeyframeIcon.tsx",
      "SnapIcon.tsx",
      "StopIcon.tsx",
      "index.ts",
    ]);
    const vite = readFileSync(resolve(packageRoot, "vite.config.ts"), "utf8");
    expect(vite).toContain('const dir = "src/icon/extra-icons"');
    expect(vite).toContain("...extraIconEntries()");
    expect(vite).toContain('"src/icon/ui-icons/DragHandle.tsx"');
    for (const barrel of ["src/icon/index.tsx", "src/index.ts"]) {
      const source = readFileSync(resolve(packageRoot, barrel), "utf8");
      expect(source).not.toContain("extra-icons");
      for (const name of names.filter((file) => file.endsWith(".tsx"))) {
        expect(source).not.toContain(name.replace(/\.tsx$/, ""));
      }
    }
    for (const name of ["StopIcon", "SnapIcon", "KeyframeIcon", "EasingHoldIcon"]) {
      expect(existsSync(resolve(packageRoot, `src/icon/s2wf-icons/${name}.tsx`))).toBe(false);
      expect(existsSync(resolve(packageRoot, `src/icon/pixel-icons/${name}.tsx`))).toBe(false);
      expect(
        existsSync(resolve(repoRoot, `packages/solid-spectrum/src/icon/extra-icons/${name}.tsx`)),
      ).toBe(false);
    }
  });

  it("renders each glyph from the extra-icons module", () => {
    const { container, unmount } = render(() => <StopIcon />);
    const rect = container.querySelector("rect");
    expect(rect).not.toBeNull();
    expect(rect?.getAttribute("x")).toBe("4.25");
    expect(rect?.getAttribute("width")).toBe("11.5");
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 20 20");
    expect(StopIcon).toBe(StopNamed);
    expect(extraIcons.StopIcon).toBe(StopNamed);
    unmount();

    for (const [name, Icon, named, path] of glyphs) {
      const view = render(() => <Icon />);
      const drawn = view.container.querySelector("path");
      expect(drawn?.getAttribute("d"), name).toBe(path);
      expect(Icon).toBe(named);
      expect(extraIcons[name]).toBe(named);
      view.unmount();
    }
  });
});
