import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { JSDOM } from "jsdom";
import { AlertDialog } from "../src/dialog";
function parseDOM(html: string): Document {
  return new JSDOM(html).window.document;
}

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
