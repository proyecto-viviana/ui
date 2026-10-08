import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { JSDOM } from "jsdom";
import { AlertDialog, Dialog, DialogTrigger } from "../src/dialog";
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

describe("AlertDialog caller SSR", () => {
  it("defers AlertDialog content with or without a trigger while retaining external nodes", () => {
    // Styled Dialog always uses ModalOverlay, even without a DialogTrigger.
    const inlineDoc = parseDOM(
      renderToString(() => <AlertDialog title="Generated title">Generated content</AlertDialog>),
    );
    expect(inlineDoc.querySelector('[role="alertdialog"]')).toBeNull();
    expect(inlineDoc.body.textContent).not.toContain("Generated content");

    const doc = parseDOM(
      renderToString(() => (
        <>
          <span id="ssr-label">External name</span>
          <span id="ssr-description">External description</span>
          <span id="ssr-details">Details</span>
          <AlertDialog
            isOpen
            trigger={<button>Open alert</button>}
            title="Visible title"
            id="caller-dialog"
            data-marker="caller"
            aria-label="Caller name"
            aria-labelledby="ssr-label"
            aria-describedby="ssr-description"
            aria-details="ssr-details"
          >
            Body copy
          </AlertDialog>
        </>
      )),
    );
    expect(doc.querySelector("button")?.textContent).toBe("Open alert");
    expect(doc.querySelector('[role="alertdialog"]')).toBeNull();
    expect(doc.getElementById("caller-dialog")).toBeNull();
    expect(doc.querySelector('[data-marker="caller"]')).toBeNull();
    expect(doc.getElementById("ssr-label")?.textContent).toBe("External name");
    expect(doc.getElementById("ssr-description")?.textContent).toBe("External description");
    expect(doc.getElementById("ssr-details")?.textContent).toBe("Details");
    expect(doc.body.textContent).not.toContain("Body copy");
  });
});
