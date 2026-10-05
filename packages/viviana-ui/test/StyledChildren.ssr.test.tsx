/**
 * SSR suite for fine-grained reactive children across styled components (@proyecto-viviana/ui).
 *
 * Verifies that mixed text children (e.g. `count: {count()}`) render server markup
 * with initial values for ActionButton, ToggleButton, LinkButton, Badge, Radio,
 * SegmentedControl, and TagGroup.
 */
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  ActionButtonFixture,
  ToggleButtonFixture,
  LinkButtonFixture,
  BadgeFixture,
  RadioFixture,
  SegmentedControlFixture,
  TagGroupFixture,
} from "./fixtures/styled-children";

describe("Styled components SSR with reactive children (@proyecto-viviana/ui)", () => {
  const outDir = resolve(import.meta.dirname, "../../../output");
  mkdirSync(outDir, { recursive: true });

  it("renders ActionButton with fine-grained count", () => {
    const html = renderToString(() => <ActionButtonFixture count={() => 0} />);
    expect(html).toMatch(/count:[\s\S]*0/);
    writeFileSync(resolve(outDir, "vui-actionbutton-finegrained-ssr.html"), html, "utf8");
  });

  it("renders ToggleButton with fine-grained count", () => {
    const html = renderToString(() => <ToggleButtonFixture count={() => 0} />);
    expect(html).toMatch(/count:[\s\S]*0/);
    writeFileSync(resolve(outDir, "vui-togglebutton-finegrained-ssr.html"), html, "utf8");
  });

  it("renders LinkButton with fine-grained count", () => {
    const html = renderToString(() => <LinkButtonFixture count={() => 0} />);
    expect(html).toMatch(/count:[\s\S]*0/);
    writeFileSync(resolve(outDir, "vui-linkbutton-finegrained-ssr.html"), html, "utf8");
  });

  it("renders Badge with fine-grained count", () => {
    const html = renderToString(() => <BadgeFixture count={() => 0} />);
    expect(html).toMatch(/count:[\s\S]*0/);
    writeFileSync(resolve(outDir, "vui-badge-finegrained-ssr.html"), html, "utf8");
  });

  it("renders Radio with fine-grained count", () => {
    const html = renderToString(() => <RadioFixture count={() => 0} />);
    expect(html).toMatch(/count:[\s\S]*0/);
    writeFileSync(resolve(outDir, "vui-radio-finegrained-ssr.html"), html, "utf8");
  });

  it("renders SegmentedControl with fine-grained count", () => {
    const html = renderToString(() => <SegmentedControlFixture count={() => 0} />);
    expect(html).toMatch(/count:[\s\S]*0/);
    writeFileSync(resolve(outDir, "vui-segmentedcontrol-finegrained-ssr.html"), html, "utf8");
  });

  it("renders TagGroup with fine-grained count", () => {
    const html = renderToString(() => <TagGroupFixture count={() => 0} />);
    expect(html).toMatch(/count:[\s\S]*0/);
    writeFileSync(resolve(outDir, "vui-taggroup-finegrained-ssr.html"), html, "utf8");
  });
});
