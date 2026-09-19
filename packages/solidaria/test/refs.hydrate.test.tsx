import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { flush, type Accessor } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { cleanupHydrationRoots } from "../test-utils/hydrate";
import { FollowRefFixture } from "./fixtures/followRef";

const html = readFileSync(
  resolve(import.meta.dirname, "../../../output/follow-ref-ssr.html"),
  "utf8",
);

describe("followRef hydration", () => {
  it("adopts the server node once and resolves a ref assigned during hydration", async () => {
    let constructions = 0;
    let disposals = 0;
    let followed: Accessor<HTMLButtonElement | null | undefined> = () => undefined;
    let serverButton: HTMLButtonElement | null = null;
    const container = await hydrateOverSsr(
      html,
      () => (
        <FollowRefFixture
          onConstruct={() => constructions++}
          onDispose={() => disposals++}
          receiveRef={(ref) => {
            followed = ref;
          }}
        />
      ),
      {
        beforeHydrate(container) {
          serverButton = container.querySelector("button");
          expect(serverButton).not.toBeNull();
        },
      },
    );
    const button = container.querySelector("button")!;
    expect(button).toBe(serverButton);
    expect(constructions).toBe(1);
    expect(disposals).toBe(0);
    expect(followed()).toBe(serverButton);
    expect(button).toHaveTextContent("Nested refs: 0");
    button.click();
    flush();
    expect(container.querySelector("button")).toBe(serverButton);
    expect(button).toHaveTextContent("Nested refs: 1");
    expect(constructions).toBe(1);
    cleanupHydrationRoots();
    expect(disposals).toBe(1);
    container.remove();
  });
});
