import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { JSDOM } from "jsdom";
import { Dialog, DialogTrigger } from "../src/dialog";
import { ActionButton, Button, LinkButton, ToggleButton } from "../src/button";

function parseDOM(html: string): Document {
  return new JSDOM(html).window.document;
}

describe("Dialog SSR (solid-spectrum)", () => {
  it("DialogTrigger around Button renders trigger button with declarative id in SSR", () => {
    const html = renderToString(() => (
      <DialogTrigger isOpen>
        <Button>Open Dialog</Button>
        <Dialog>
          <p>Dialog Content</p>
        </Dialog>
      </DialogTrigger>
    ));

    const doc = parseDOM(html);
    const trigger = doc.querySelector("button");
    expect(trigger).not.toBeNull();
    expect(trigger?.id).toBeTruthy();
    expect(trigger?.textContent).toContain("Open Dialog");
  });

  it("DialogTrigger around ActionButton renders action button with declarative id in SSR", () => {
    const html = renderToString(() => (
      <DialogTrigger isOpen>
        <ActionButton>Open Action</ActionButton>
        <Dialog>
          <p>Dialog Content</p>
        </Dialog>
      </DialogTrigger>
    ));

    const doc = parseDOM(html);
    const trigger = doc.querySelector("button");
    expect(trigger).not.toBeNull();
    expect(trigger?.id).toBeTruthy();
    expect(trigger?.textContent).toContain("Open Action");
  });

  it("DialogTrigger around ToggleButton renders toggle button with declarative id in SSR", () => {
    const html = renderToString(() => (
      <DialogTrigger isOpen>
        <ToggleButton>Open Toggle</ToggleButton>
        <Dialog>
          <p>Dialog Content</p>
        </Dialog>
      </DialogTrigger>
    ));

    const doc = parseDOM(html);
    const trigger = doc.querySelector("button");
    expect(trigger).not.toBeNull();
    expect(trigger?.id).toBeTruthy();
    expect(trigger?.textContent).toContain("Open Toggle");
  });

  it("DialogTrigger around LinkButton renders link button with declarative id in SSR", () => {
    const html = renderToString(() => (
      <DialogTrigger isOpen>
        <LinkButton href="#test">Open Link</LinkButton>
        <Dialog>
          <p>Dialog Content</p>
        </Dialog>
      </DialogTrigger>
    ));

    const doc = parseDOM(html);
    const trigger = doc.querySelector("a");
    expect(trigger).not.toBeNull();
    expect(trigger?.id).toBeTruthy();
    expect(trigger?.textContent).toContain("Open Link");
  });

  it("Modal dialog overlay is deferred until hydration matching RAC SSR", () => {
    const html = renderToString(() => (
      <DialogTrigger isOpen>
        <Button>Open Dialog</Button>
        <Dialog>
          <p>Dialog Content</p>
        </Dialog>
      </DialogTrigger>
    ));

    const doc = parseDOM(html);
    // DialogModal is deferred until client hydration (isHydrated) matching RAC Dialog.ssr.test.js
    const dialog = doc.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });
});
