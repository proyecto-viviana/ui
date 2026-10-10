/** Diagnostic client twin. Expected reproduction is unverified until an admitted run. */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { LAND_CARDS, LandingLinkedCardsFixture } from "./fixtures/landing-hydration";

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/viviana-ui-landing-linked-cards-ssr.html"),
  "utf8",
);

function inspect(container: HTMLElement) {
  const cards = LAND_CARDS.map((card) => {
    const anchors = container.querySelectorAll<HTMLAnchorElement>(
      `a[href="/examples/${card.slug}"]`,
    );
    expect(anchors).toHaveLength(1);
    return anchors[0];
  });
  expect(container.querySelectorAll("a")).toHaveLength(3);
  expect(LAND_CARDS).toHaveLength(3);
  expect(cards).toHaveLength(3);
  const cardElements: Element[] = [];
  cards.forEach((card, index) => {
    const expected = LAND_CARDS[index];
    expect(card.getAttribute("href")).toBe(`/examples/${expected.slug}`);
    const previews = card.querySelectorAll<HTMLElement>('[slot="preview"]');
    const images = card.querySelectorAll<HTMLImageElement>("img");
    const headings = card.querySelectorAll<HTMLHeadingElement>("h2");
    expect(previews).toHaveLength(1);
    expect(images).toHaveLength(1);
    expect(headings).toHaveLength(1);
    expect(previews[0].textContent).toContain(expected.tag);
    expect(previews[0].contains(images[0])).toBe(true);
    expect(images[0].getAttribute("src")).toBe(expected.thumb);
    expect(images[0].getAttribute("alt")).toBe("");
    expect(headings[0].textContent).toBe(expected.title);
    const content = headings[0].parentElement;
    expect(content).not.toBeNull();
    expect(content!.tagName).toBe("DIV");
    const metadata = content!.querySelectorAll('span[data-rsp-slot="text"]');
    expect(metadata).toHaveLength(1);
    expect(metadata[0].textContent).toBe(expected.meta);
    // Retain every server element in each actual card closure, including preview tag/content.
    cardElements.push(card, ...Array.from(card.querySelectorAll("*")));
  });
  expect(cardElements.length).toBeGreaterThan(3);
  const inputs = container.querySelectorAll<HTMLInputElement>("input");
  const labels = container.querySelectorAll<HTMLLabelElement>("label");
  expect(inputs).toHaveLength(2);
  expect(labels).toHaveLength(1);
  const email = inputs[0];
  const input = inputs[1];
  expect(email.getAttribute("aria-label")).toBe("Email address");
  expect(email.type).toBe("email");
  expect(email.name).toBe("");
  expect(email.placeholder).toBe("you@school.edu");
  expect(email.labels).toHaveLength(0);
  expect(email.id.length).toBeGreaterThan(0);
  expect(email.id).not.toBe(input.id);
  expect(input.type).toBe("text");
  expect(input.name).toBe("");
  expect(input.getAttribute("aria-label")).toBeNull();
  expect(email.compareDocumentPosition(cards[0]) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
  const label = labels[0];
  expect(input.id.length).toBeGreaterThan(0);
  expect(label.textContent).toContain("Following landing cards");
  expect(label.htmlFor).toBe(input.id);
  expect(cards[2].compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
  const identified = Array.from(container.querySelectorAll<HTMLElement>("[id]"));
  expect(identified).toEqual([email, label, input]);
  expect(input.getAttribute("aria-labelledby")).toBe(label.id);
  const ids = identified.map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  return {
    cardElements,
    email,
    emailId: email.id,
    input,
    label,
    inputId: input.id,
    labelFor: label.htmlFor,
    identified,
    ids,
  };
}

describe("landing linked-card diagnostic hydration", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("adopts the exact server nodes and IDs through completion and deferred verification", async () => {
    let server: ReturnType<typeof inspect> | undefined;
    let adoptedContainer: HTMLElement | undefined;
    let checkedBeforeVerify = false;
    const assertRetained = () => {
      expect(server).toBeDefined();
      expect(adoptedContainer).toBeDefined();
      const current = inspect(adoptedContainer!);
      expect(current.cardElements).toHaveLength(server!.cardElements.length);
      server!.cardElements.forEach((node, index) => expect(current.cardElements[index]).toBe(node));
      expect(current.email).toBe(server!.email);
      expect(current.emailId).toBe(server!.emailId);
      expect(current.input).toBe(server!.input);
      expect(current.label).toBe(server!.label);
      expect(current.inputId).toBe(server!.inputId);
      expect(current.labelFor).toBe(server!.labelFor);
      expect(current.identified).toHaveLength(server!.identified.length);
      server!.identified.forEach((node, index) => expect(current.identified[index]).toBe(node));
      expect(current.ids).toEqual(server!.ids);
    };
    const container = await hydrateOverSsr(ssrHtml, () => <LandingLinkedCardsFixture />, {
      beforeHydrate(container) {
        adoptedContainer = container;
        server = inspect(container);
      },
      beforeVerify() {
        assertRetained();
        checkedBeforeVerify = true;
      },
    });
    expect(container).toBe(adoptedContainer);
    expect(checkedBeforeVerify).toBe(true);
    // The helper has awaited actual completion, run the verifier, and drained its deferred tail.
    assertRetained();
  });
});
