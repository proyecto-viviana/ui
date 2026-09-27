/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render } from "@solidjs/testing-library";
import { useContext } from "solid-js";
import { createId } from "@proyecto-viviana/solidaria";
import { DIRECTORY_DRAG_TYPE as directoryDragType } from "@proyecto-viviana/solid-stately";
import {
  DIRECTORY_DRAG_TYPE,
  FormValidationContext,
  I18nProvider,
  isDirectoryDropItem,
  isFileDropItem,
  isRTL,
  isTextDropItem,
  parseColor,
  SSRProvider,
  UNSTABLE_Toast,
  UNSTABLE_ToastContent,
  UNSTABLE_ToastQueue,
  useFilter,
  useLocale,
} from "../src/index";

afterEach(cleanup);

const textItem = {
  kind: "text" as const,
  types: new Set(["text/plain"]),
  getText: () => Promise.resolve("hello"),
};

const fileItem = {
  kind: "file" as const,
  type: "text/plain",
  name: "note.txt",
  getFile: () => Promise.resolve(new File(["hello"], "note.txt")),
  getText: () => Promise.resolve("hello"),
};

const directoryItem = {
  kind: "directory" as const,
  name: "photos",
  async *getEntries() {},
};

function EmailProbe() {
  const errors = useContext(FormValidationContext) as unknown;
  const value = typeof errors === "function" ? (errors as () => Record<string, unknown>)() : errors;
  const email = (value as Record<string, unknown> | undefined)?.email;
  return <span data-testid="email">{typeof email === "string" ? email : ""}</span>;
}

describe("solidaria-components re-exports", () => {
  it("classifies drop items by kind and re-exports the directory drag type", () => {
    expect(DIRECTORY_DRAG_TYPE).toBe(directoryDragType);

    expect(isTextDropItem(textItem)).toBe(true);
    expect(isFileDropItem(textItem)).toBe(false);
    expect(isDirectoryDropItem(textItem)).toBe(false);

    expect(isFileDropItem(fileItem)).toBe(true);
    expect(isTextDropItem(fileItem)).toBe(false);
    expect(isDirectoryDropItem(fileItem)).toBe(false);

    expect(isDirectoryDropItem(directoryItem)).toBe(true);
    expect(isFileDropItem(directoryItem)).toBe(false);
    expect(isTextDropItem(directoryItem)).toBe(false);
  });

  it("reports RTL for Arabic and LTR for English", () => {
    expect(isRTL("ar")).toBe(true);
    expect(isRTL("en")).toBe(false);
  });

  it("publishes the provider locale and direction through useLocale", () => {
    let arabic = "";
    let english = "";

    render(() => (
      <>
        <I18nProvider locale="ar-SA">
          {(() => {
            const locale = useLocale();
            arabic = `${locale().locale}:${locale().direction}`;
            return null;
          })()}
        </I18nProvider>
        <I18nProvider locale="en-US">
          {(() => {
            const locale = useLocale();
            english = `${locale().locale}:${locale().direction}`;
            return null;
          })()}
        </I18nProvider>
      </>
    ));

    expect(arabic).toBe("ar-SA:rtl");
    expect(english).toBe("en-US:ltr");
  });

  it("matches case and diacritics through useFilter at base sensitivity", () => {
    let matched = false;
    let missed = true;

    render(() => (
      <I18nProvider locale="en-US">
        {(() => {
          const filter = useFilter({ sensitivity: "base" });
          matched = filter().contains("Café", "cafe");
          missed = filter().contains("Hello", "xyz");
          return null;
        })()}
      </I18nProvider>
    ));

    expect(matched).toBe(true);
    expect(missed).toBe(false);
  });

  it("prefixes generated ids with the SSRProvider prefix", () => {
    let outerId = "";
    let innerId = "";

    render(() => (
      <SSRProvider prefix="outer">
        {(() => {
          outerId = createId();
          return (
            <SSRProvider prefix="inner">
              {(() => {
                innerId = createId();
                return null;
              })()}
            </SSRProvider>
          );
        })()}
      </SSRProvider>
    ));

    expect(outerId).toMatch(/^solidaria-outer-/);
    expect(innerId).toMatch(/^solidaria-outer-inner-/);
  });

  it("parses short hex colors into RGB channels", () => {
    const white = parseColor("#fff");
    expect(white.getChannelValue("red")).toBe(255);
    expect(white.getChannelValue("green")).toBe(255);
    expect(white.getChannelValue("blue")).toBe(255);

    const red = parseColor("#f00");
    expect(red.getChannelValue("red")).toBe(255);
    expect(red.getChannelValue("green")).toBe(0);
    expect(red.getChannelValue("blue")).toBe(0);

    expect(() => parseColor("#zzzzzz")).toThrow();
  });

  it("provides validation errors through FormValidationContext", () => {
    const { getByTestId } = render(() => (
      <FormValidationContext value={{ email: "Required" }}>
        <EmailProbe />
      </FormValidationContext>
    ));

    expect(getByTestId("email").textContent).toBe("Required");
  });

  it("adds and closes toasts on UNSTABLE_ToastQueue", () => {
    const queue = new UNSTABLE_ToastQueue<{ title: string }>();
    const seen: string[][] = [];
    const unsubscribe = queue.subscribe((toasts) => {
      seen.push(toasts.map((toast) => toast.content.title));
    });

    const key = queue.add({ title: "Saved" });
    expect(seen.at(-1)).toEqual(["Saved"]);

    queue.close(key);
    expect(seen.at(-1)).toEqual([]);
    unsubscribe();
  });

  it("renders UNSTABLE_ToastContent as the toast message, not the toast shell", () => {
    const { getByText } = render(() => <UNSTABLE_ToastContent>Saved</UNSTABLE_ToastContent>);

    expect(getByText("Saved")).toHaveAttribute("data-solidaria-toast-content");
    expect(UNSTABLE_ToastContent).not.toBe(UNSTABLE_Toast);
  });
});
