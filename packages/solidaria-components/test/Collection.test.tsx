/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import {
  Collection,
  CollectionBuilder,
  CollectionRendererContext,
  DefaultCollectionRenderer,
  SectionContext,
  GroupContext,
  HeaderContext,
  HeadingContext,
  Group,
  Header,
  Section,
  flattenCollectionEntries,
  isCollectionSection,
  useCollectionRenderer,
} from "../src/Collection";

describe("Collection primitives", () => {
  it("renders Section with default class", () => {
    render(() => <Section>Content</Section>);
    const section = document.querySelector(".solidaria-Section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute("data-section");
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders Header as heading role", () => {
    render(() => <Header aria-level={2}>Header text</Header>);
    const header = screen.getByRole("heading");
    expect(header).toHaveClass("solidaria-Header");
    expect(header).toHaveAttribute("aria-level", "2");
    expect(header).toHaveAttribute("data-header");
  });

  it("renders Group as group role", () => {
    render(() => <Group>Items</Group>);
    const group = screen.getByRole("group");
    expect(group).toHaveClass("solidaria-Group");
    expect(group).toHaveAttribute("data-group");
    expect(group).toHaveTextContent("Items");
  });

  it("supports class and style render props", () => {
    render(() => (
      <Section
        class={(props) => (props.hasChildren ? "has-children" : "empty")}
        style={(props) => ({ opacity: props.hasChildren ? "1" : "0.5" })}
      >
        Child
      </Section>
    ));

    const section = document.querySelector(".has-children") as HTMLElement;
    expect(section).toBeInTheDocument();
    expect(section.style.opacity).toBe("1");
  });

  it("detects section entries and flattens sectioned collections", () => {
    const entries = [
      { id: "one" },
      {
        title: <span>Group</span>,
        items: [{ id: "two" }, { id: "three" }],
      },
    ];

    expect(isCollectionSection(entries[1])).toBe(true);
    expect(flattenCollectionEntries(entries).map((item) => item.id)).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  it("provides collection renderer context to descendants", () => {
    function Consumer() {
      const renderer = useCollectionRenderer<{ label: string }>();
      return <div>{renderer?.renderItem({ label: "Hello" })}</div>;
    }

    render(() => (
      <CollectionRendererContext.Provider
        value={{
          renderItem: (item: { label: string }) => <span>{item.label}</span>,
        }}
      >
        <Consumer />
      </CollectionRendererContext.Provider>
    ));

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("exports collection context primitives for parity", () => {
    expect(SectionContext).toBeTruthy();
    expect(GroupContext).toBeTruthy();
    expect(HeaderContext).toBeTruthy();
    expect(HeadingContext).toBeTruthy();
  });

  it("supports SectionContext renderer override", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(() => (
      <SectionContext.Provider
        value={{
          name: "ListBoxSection",
          render: (props, className) => (
            <article data-testid="section-override" class={className}>
              {props.children}
            </article>
          ),
        }}
      >
        <Section>Override content</Section>
      </SectionContext.Provider>
    ));

    expect(screen.getByTestId("section-override")).toHaveClass("solidaria-Section");
    expect(screen.getByText("Override content")).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("exports DefaultCollectionRenderer and renders root collections", () => {
    render(() => (
      <div>
        {DefaultCollectionRenderer.CollectionRoot({
          collection: [<span>A</span>, <span>B</span>],
        })}
      </div>
    ));

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("skips rendering content collection nodes in default renderer", () => {
    const contentNode = { type: "content", key: "content-1" } as unknown;

    render(() => (
      <div>
        {DefaultCollectionRenderer.CollectionRoot({
          collection: [<span>Visible item</span>, contentNode],
          renderDropIndicator: ({ key, dropPosition }) => (
            <span data-testid={`drop-${String(key)}-${dropPosition}`} />
          ),
        })}
      </div>
    ));

    expect(screen.getByText("Visible item")).toBeInTheDocument();
    expect(screen.queryByText("[object Object]")).not.toBeInTheDocument();
    expect(screen.getByTestId("drop-0-before")).toBeInTheDocument();
    expect(screen.getByTestId("drop-0-after")).toBeInTheDocument();
    expect(screen.queryByTestId("drop-content-1-before")).not.toBeInTheDocument();
    expect(screen.queryByTestId("drop-content-1-after")).not.toBeInTheDocument();
  });

  it("exports CollectionBuilder compatibility wrapper", () => {
    const out = CollectionBuilder({
      items: [{ id: "x", label: "X" }],
      children: (item: { id: string; label: string }) => item.label,
    }) as unknown[];
    expect(out).toHaveLength(1);
    expect(out[0]).toBe("X");
  });

  it("exports Collection compatibility wrapper", () => {
    const out = Collection({
      items: [{ id: "x", label: "X" }],
      children: (item: { id: string; label: string }) => ({ label: item.label }),
    }) as Array<Record<string, unknown>>;
    expect((out[0]?.value as { id: string })?.id).toBe("x");
  });
});
