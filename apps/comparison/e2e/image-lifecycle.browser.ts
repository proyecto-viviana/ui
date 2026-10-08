import { test, expect, type Route } from "@playwright/test";
import { writeFileSync } from "node:fs";
import type {} from "../../../packages/solidaria-components/test/fixtures/image-browser/main";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a/p8AAAAASUVORK5CYII=",
  "base64",
);
const kinds = ["spectrum", "ui", "react", "plain"];
const cases = [
  "pending-dispose",
  "remove-loaded-first",
  "remove-loaded-after",
  "initial-hidden",
  "source",
  "hidden-return",
];
for (const kind of kinds)
  for (const scenario of cases) {
    test(`${kind}: ${scenario}`, async ({ page, browser }, testInfo) => {
      const errors: object[] = [];
      const network: object[] = [];
      const observations: object[] = [];
      const routes: Route[] = [];
      const released = new Set<Route>();
      let completed = false;
      let failure: string | undefined;
      let operation = "startup";
      page.on("pageerror", (e) =>
        errors.push({
          type: "pageerror",
          operation,
          time: Date.now(),
          message: e.message,
          stack: e.stack,
        }),
      );
      page.on("console", (m) => {
        if (m.type() === "error")
          errors.push({ type: "console.error", operation, time: Date.now(), message: m.text() });
      });
      page.on("requestfailed", (r) =>
        network.push({ type: "requestfailed", operation, url: r.url(), failure: r.failure() }),
      );
      await page.addInitScript(() => {
        window.imageRejections = [];
        window.addEventListener("unhandledrejection", (event) => {
          window.imageRejections.push({
            time: performance.now(),
            reason: String(event.reason),
            message: event.reason?.message,
            stack: event.reason?.stack,
            operation: window.imageOperation,
          });
        });
      });
      await page.route("**/pending/**/*.png", (route) => {
        routes.push(route);
        network.push({ type: "request", operation, url: route.request().url(), time: Date.now() });
      });
      const frames = () =>
        page.evaluate(
          () =>
            new Promise<void>((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
            ),
        );
      const snap = async (label: string) => {
        await frames();
        const value = await page.evaluate(() => window.imageProof.snapshot());
        observations.push({ label, ...value });
        return value;
      };
      const change = async (
        patch: Parameters<Window["imageProof"]["change"]>[0],
        label: string,
      ) => {
        operation = label;
        await page.evaluate(
          ({ patch, label }) => {
            window.imageOperation = label;
            window.imageProof.change(patch);
          },
          { patch, label },
        );
        return snap(label);
      };
      const release = async (id: string, source = "A") => {
        operation = `release-${id}-${source}`;
        await page.evaluate((label) => {
          window.imageOperation = label;
        }, operation);
        await expect
          .poll(
            () => routes.filter((r) => r.request().url().endsWith(`/${id}-${source}.png`)).length,
          )
          .toBeGreaterThan(0);
        for (const route of routes.filter(
          (r) => r.request().url().endsWith(`/${id}-${source}.png`) && !released.has(r),
        )) {
          released.add(route);
          // A replaced native request can be cancelled. Record transport outcome, never fabricate a load.
          try {
            await route.fulfill({ status: 200, contentType: "image/png", body: png });
            network.push({ type: "fulfilled", operation, url: route.request().url() });
          } catch (error) {
            network.push({
              type: "fulfill-failed",
              operation,
              url: route.request().url(),
              error: String(error),
            });
          }
        }
        await frames();
      };
      const capturePending = async (id: string, label: string) => {
        await frames();
        const value = await page.evaluate(({ id, label }) => window.imageProof.capture(id, label), {
          id,
          label,
        });
        observations.push({ label, ...value });
        const captured = value.retained.at(-1)!;
        expect(captured).toMatchObject({
          connected: true,
          imageConnected: true,
          complete: false,
          naturalWidth: 0,
        });
        if (kind !== "plain")
          expect(
            captured.capturedAnimations.some(
              (a) => a.state === "running" && a.targetSame && a.targetConnected,
            ),
          ).toBe(true);
        return value;
      };
      const loaded = async (id: string) => {
        await expect
          .poll(() =>
            page
              .locator(`img[alt="${id}"]`)
              .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
          )
          .toBe(true);
      };
      const barrier = (snapshot: Awaited<ReturnType<typeof snap>>) => {
        const survivor = snapshot.rows.find((row) => row.id === "survivor")!;
        expect(survivor).toMatchObject({ retainedImage: 0, retainedWrapper: 0, complete: true });
        if (kind !== "plain") {
          expect
            .soft(survivor.opacity, "Loaded survivor must wait for pending coordinator member")
            .toBe("0");
          expect
            .soft(
              survivor.visibility,
              "Loaded survivor must stay hidden behind coordinator barrier",
            )
            .toBe("hidden");
        }
      };
      const revealed = async (id: string) => {
        await loaded(id);
        await expect(page.locator(`img[alt="${id}"]`)).toHaveCSS("opacity", "1");
        await expect(page.locator(`img[alt="${id}"]`)).toHaveCSS("visibility", "visible");
      };
      try {
        await page.goto("/");
        await page.waitForFunction(() => !!window.imageProof);
        const identity = await page.evaluate(() => window.imageProof.identity);
        observations.push({
          identity,
          browser: browser.version(),
          args: process.env.COMPARISON_CHROMIUM_ARGS,
        });
        expect(identity).toMatchObject({ dev: true, mode: "development", reducedMotion: false });
        expect((identity as { animate: string }).animate).toContain("[native code]");
        const graph = await (await page.request.get("/__image_graph")).json();
        writeFileSync(
          `/tmp/ui-638-native-graph-${kind}-${scenario}.json`,
          JSON.stringify(graph, null, 2),
        );
        for (const twin of ["solid-spectrum", "viviana-ui"])
          expect(
            graph.modules.some(
              (m: { file: string; sha256: string }) =>
                m.file?.endsWith(`/packages/${twin}/src/image/index.tsx`) && m.sha256,
            ),
          ).toBe(true);
        expect(
          graph.modules.filter((m: { file: string }) =>
            /\/packages\/(solid-spectrum|viviana-ui|solidaria|solidaria-components|solid-stately)\/dist\//.test(
              m.file ?? "",
            ),
          ),
        ).toEqual([]);
        for (const name of ["solid-js", "@solidjs/web"]) {
          const module = graph.optimized.find((m: { name: string }) => m.name === name);
          expect(module?.source).toMatch(/\/(solid|web)\.dev\.js$/);
          expect(module?.sha256).toMatch(/^[a-f0-9]{64}$/);
        }
        operation = "mount";
        await page.evaluate(
          ({ kind, scenario }) => {
            window.imageOperation = "mount";
            window.imageProof.mount(kind, {
              rows:
                scenario.startsWith("remove") ||
                scenario === "source" ||
                scenario === "hidden-return"
                  ? ["survivor", "removed"]
                  : ["survivor"],
              target:
                scenario === "source" || scenario === "hidden-return" ? "removed" : "survivor",
              hidden: scenario === "initial-hidden",
              source: "A",
              prefix: `/pending/${kind}/${scenario}`,
            });
          },
          { kind, scenario },
        );
        if (scenario === "initial-hidden") {
          expect((await snap("initial-hidden")).rows).toHaveLength(0);
          await change({ hidden: false }, "first-visible");
        }
        await expect.poll(() => routes.length).toBeGreaterThan(0);
        await frames();
        const initial = await page.evaluate(() => window.imageProof.capture("survivor", "W1"));
        observations.push({ label: "pending-prerequisite", ...initial });
        expect(initial.rows[0]).toMatchObject({
          complete: false,
          naturalWidth: 0,
          connected: true,
        });
        if (kind !== "plain") {
          expect(
            initial.retained[0].capturedAnimations.some(
              (a) => a.state === "running" && a.targetSame && a.targetConnected,
            ),
          ).toBe(true);
          if (kind === "ui") {
            expect(initial.rows[0].pseudoBackgroundImage).toContain("linear-gradient");
            expect(initial.rows[0].pseudoAnimationName).not.toBe("none");
            expect(initial.rows[0].pseudoMaskImage).toContain("data:image/svg+xml");
          } else expect(initial.rows[0].backgroundImage).toContain("linear-gradient");
          expect(initial.rows[0].width).toBeGreaterThan(0);
          expect(initial.rows[0].height).toBeGreaterThan(0);
          expect(initial.rows[0].overflow).toBe("hidden");
          expect(initial.rows[0].visibility).toBe("hidden");
        }
        expect(errors).toEqual([]);
        expect(await page.evaluate(() => window.imageRejections)).toEqual([]);
        if (scenario.startsWith("remove")) {
          await capturePending("removed", "removed-row");
          if (scenario === "remove-loaded-first") {
            await release("survivor");
            await loaded("survivor");
            barrier(await snap("survivor-loaded-before-removal"));
          }
          const removed = await change({ rows: ["survivor"] }, "remove-row");
          expect(removed.rows).toHaveLength(1);
          expect(removed.rows[0].retainedImage).toBe(0);
          expect(removed.retained[1].connected).toBe(false);
          if (scenario === "remove-loaded-after") await release("survivor");
          await revealed("survivor");
          await release("removed");
        } else if (scenario === "source") {
          await release("survivor");
          await loaded("survivor");
          barrier(await snap("survivor-loaded-before-source-change"));
          await capturePending("removed", "source-old-A");
          const switched = await change({ source: "B" }, "source-A-to-B");
          barrier(switched);
          // Scalar source changes retain both native nodes.
          expect(switched.rows.find((row) => row.id === "removed")?.retainedWrapper).toBe(1);
          expect.soft(switched.rows.find((row) => row.id === "removed")?.retainedImage).toBe(1);
          await expect
            .poll(() => routes.filter((r) => r.request().url().endsWith("-B.png")).length)
            .toBe(1);
          await release("removed", "A");
          const stale = await snap("old-A-released-B-pending");
          barrier(stale);
          if (kind !== "plain")
            expect
              .soft(
                stale.rows.find((row) => row.id === "removed")?.visibility,
                "Pending B must not reveal on old A completion",
              )
              .toBe("hidden");
          expect(stale.rows.find((r) => r.id === "removed")).toMatchObject({ complete: false });
          expect(stale.rows.find((r) => r.id === "removed")?.src).toContain("removed-B.png");
          expect(stale.rows.find((r) => r.id === "survivor")).toMatchObject({
            retainedImage: 0,
            complete: true,
          });
          await release("removed", "B");
          await revealed("survivor");
          await revealed("removed");
        } else if (scenario === "hidden-return") {
          await release("survivor");
          await loaded("survivor");
          await capturePending("removed", "pending-W1");
          barrier(await snap("loaded-survivor-before-hide"));
          const hidden = await change({ hidden: true }, "hide-pending");
          expect(hidden.rows).toHaveLength(1);
          expect(hidden.retained[1].connected).toBe(false);
          expect(hidden.rows[0].retainedImage).toBe(0);
          await revealed("survivor");
          const shown = await change({ hidden: false }, "show-pending");
          expect(shown.rows).toHaveLength(2);
          expect(shown.rows.find((r) => r.id === "removed")?.retainedWrapper).toBe(-1);
          expect(shown.rows.find((r) => r.id === "survivor")?.retainedImage).toBe(0);
          await page.evaluate(() => window.imageProof.capture("removed", "W2"));
          await snap("W2-pending-retained-A");
          await release("removed");
          await revealed("removed");
          await revealed("survivor");
        } else if (scenario !== "pending-dispose") {
          await release("survivor");
          await revealed("survivor");
        }
        await snap("before-dispose");
        operation = "dispose-owner";
        await page.evaluate(() => {
          window.imageOperation = "dispose-owner";
          window.imageProof.dispose();
        });
        const disposed = await snap("after-dispose");
        expect(disposed.rows).toHaveLength(0);
        if (kind === "spectrum" || kind === "ui")
          for (const retained of disposed.retained)
            for (const animation of retained.capturedAnimations)
              expect(animation.state).toBe("idle");
        if (scenario === "pending-dispose") {
          await release("survivor");
          await snap("response-after-dispose");
        }
        expect(errors).toEqual([]);
        expect(await page.evaluate(() => window.imageRejections)).toEqual([]);
        completed = true;
      } catch (error) {
        failure = error instanceof Error ? error.stack : String(error);
        throw error;
      } finally {
        let rejections: object[] | undefined;
        let receiptReadError: string | undefined;
        try {
          rejections = await page.evaluate(() => window.imageRejections);
        } catch (error) {
          receiptReadError = error instanceof Error ? error.stack : String(error);
        }

        writeFileSync(
          `/tmp/ui-638-native-case-${kind}-${scenario}.json`,
          JSON.stringify(
            {
              kind,
              scenario,
              status:
                completed && !receiptReadError && testInfo.errors.length === 0
                  ? "completed"
                  : "failed",
              receiptReadError,
              assertionErrors: testInfo.errors,
              failure,
              testTitle: testInfo.title,
              operation,
              errors,
              rejections,
              network,
              observations,
            },
            null,
            2,
          ),
        );
        if (receiptReadError && !failure)
          throw new Error(`Final browser evidence read failed: ${receiptReadError}`);
      }
    });
  }
declare global {
  interface Window {
    imageRejections: object[];
    imageOperation: string;
  }
}
