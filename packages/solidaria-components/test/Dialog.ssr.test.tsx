import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { Dialog, DialogTrigger, Heading } from "../src/Dialog";
import { Button } from "../src/Button";
import { ToggleButton } from "../src/ToggleButton";
import { Link } from "../src/Link";
import { JSDOM } from "jsdom";

function parseDOM(html: string): Document {
  return new JSDOM(html).window.document;
}

describe("Dialog SSR aria-labelledby resolution", () => {
  it("DialogTrigger around Button renders dialog aria-labelledby that resolves to button id in SSR", () => {
    const html = renderToString(() => (
      <DialogTrigger isOpen>
        <Button>Open Dialog</Button>
        <Dialog>
          <p>Dialog Content</p>
        </Dialog>
      </DialogTrigger>
    ));

    const doc = parseDOM(html);
    const dialog = doc.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();

    const labelledBy = dialog?.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();

    const triggerElement = doc.getElementById(labelledBy!);
    expect(triggerElement).not.toBeNull();
    expect(triggerElement?.tagName.toLowerCase()).toBe("button");
    expect(triggerElement?.textContent).toBe("Open Dialog");
  });

  it("DialogTrigger around ToggleButton renders dialog aria-labelledby that resolves to toggle button id in SSR", () => {
    const html = renderToString(() => (
      <DialogTrigger isOpen>
        <ToggleButton>Toggle Dialog</ToggleButton>
        <Dialog>
          <p>Dialog Content</p>
        </Dialog>
      </DialogTrigger>
    ));

    const doc = parseDOM(html);
    const dialog = doc.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();

    const labelledBy = dialog?.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();

    const triggerElement = doc.getElementById(labelledBy!);
    expect(triggerElement).not.toBeNull();
    expect(triggerElement?.tagName.toLowerCase()).toBe("button");
    expect(triggerElement?.textContent).toBe("Toggle Dialog");
  });

  it("DialogTrigger around Link renders dialog aria-labelledby that resolves to link id in SSR", () => {
    const html = renderToString(() => (
      <DialogTrigger isOpen>
        <Link href="#open">Open via Link</Link>
        <Dialog>
          <p>Dialog Content</p>
        </Dialog>
      </DialogTrigger>
    ));

    const doc = parseDOM(html);
    const dialog = doc.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();

    const labelledBy = dialog?.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();

    const triggerElement = doc.getElementById(labelledBy!);
    expect(triggerElement).not.toBeNull();
    expect(triggerElement?.tagName.toLowerCase()).toBe("a");
    expect(triggerElement?.textContent).toBe("Open via Link");
  });

  it("Dialog with Heading renders dialog aria-labelledby that resolves to heading id in SSR", () => {
    const html = renderToString(() => (
      <DialogTrigger isOpen>
        <Button>Open Dialog</Button>
        <Dialog>
          <Heading slot="title">SSR Dialog Title</Heading>
          <p>Dialog Content</p>
        </Dialog>
      </DialogTrigger>
    ));

    const doc = parseDOM(html);
    const dialog = doc.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();

    const labelledBy = dialog?.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();

    const headingElement = doc.getElementById(labelledBy!);
    expect(headingElement).not.toBeNull();
    expect(headingElement?.tagName.toLowerCase()).toBe("h2");
    expect(headingElement?.textContent).toBe("SSR Dialog Title");
  });
});
