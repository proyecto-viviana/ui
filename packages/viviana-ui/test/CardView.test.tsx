import { FocusableContext } from "@proyecto-viviana/solidaria/interactions";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, render, screen, within } from "@solidjs/testing-library";
import {
  Card,
  CardPreview,
  CardView,
  Content,
  Image,
  Text,
  type CardViewSelectionStyle,
} from "../src";
import * as cardSubpath from "../src/Card";
import * as cardViewSubpath from "../src/CardView";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

afterEach(cleanup);

interface ProjectCard {
  id: string;
  title: string;
  status: string;
}

const projects: ProjectCard[] = [
  { id: "apollo", title: "Apollo", status: "Active" },
  { id: "zephyr", title: "Zephyr", status: "Queued" },
];

function stubClientWidth(width: number): () => void {
  const targets = [Element.prototype, HTMLElement.prototype];
  const originals = targets.map(
    (proto) => [proto, Object.getOwnPropertyDescriptor(proto, "clientWidth")] as const,
  );
  for (const proto of targets) {
    Object.defineProperty(proto, "clientWidth", {
      configurable: true,
      enumerable: true,
      get() {
        return width;
      },
    });
  }
  return () => {
    for (const [proto, original] of originals) {
      if (original) {
        Object.defineProperty(proto, "clientWidth", original);
      } else {
        delete (proto as { clientWidth?: unknown }).clientWidth;
      }
    }
  };
}

function assignMeasuredWidth(element: HTMLDivElement | null | undefined, width: number) {
  if (!element) {
    return;
  }
  Object.defineProperty(element, "clientWidth", {
    configurable: true,
    get() {
      return width;
    },
  });
}

function renderProjects(layout?: "grid" | "waterfall") {
  return render(() => (
    <CardView
      aria-label="Projects"
      items={projects}
      getKey={(item) => item.id}
      getTextValue={(item) => item.title}
      layout={layout}
      ref={(element) => assignMeasuredWidth(element, 360)}
    >
      {(item) => (
        <Card id={item.id} textValue={`${item.title} ${item.status}`}>
          <Content>
            <Text slot="title">{item.title}</Text>
            <Text slot="description">{item.status}</Text>
          </Content>
        </Card>
      )}
    </CardView>
  ));
}

describe("CardView (viviana-ui)", () => {
  it.each([false, true])(
    "forwards standalone caller tabindex to the final root (link=%s)",
    async (link) => {
      const user = setupUser();
      const [tabindex, setTabindex] = createSignal<number | undefined>(link ? -1 : 0);
      const rootRef = vi.fn();
      const childRef = vi.fn();
      render(() => (
        <>
          <button data-testid="before">Before</button>
          <Card
            id="caller-card"
            href={link ? "#target" : undefined}
            tabindex={tabindex()}
            ref={rootRef}
            data-testid="caller-card"
          >
            <span ref={childRef}>Stable child</span>
            {!link && <input aria-label="Draft" />}
          </Card>
          <button data-testid="after">After</button>
        </>
      ));
      const root = screen.getByTestId("caller-card");
      const child = screen.getByText("Stable child");
      expect(root.tagName).toBe(link ? "A" : "DIV");
      expect(root).toHaveAttribute("tabindex", link ? "-1" : "0");
      root.focus();
      expect(root).toHaveFocus();
      expect(root).not.toHaveAttribute("aria-selected");
      expect(root).not.toHaveAttribute("data-selected");
      const input = link ? undefined : screen.getByRole("textbox", { name: "Draft" });
      if (input) {
        await user.type(input, "retained");
      }
      for (const value of [0, -1, undefined, 0]) {
        setTabindex(value);
        flush();
        expect(screen.getByTestId("caller-card")).toBe(root);
        expect(screen.getByText("Stable child")).toBe(child);
        if (value === undefined && !link) expect(root).not.toHaveAttribute("tabindex");
        else if (value === undefined) expect(root.tabIndex).toBe(0);
        else expect(root).toHaveAttribute("tabindex", String(value));
        if (input) {
          expect(screen.getByRole("textbox", { name: "Draft" })).toBe(input);
          expect(input).toHaveValue("retained");
          expect(input).toHaveFocus();
        }
      }
      expect(rootRef).toHaveBeenCalledTimes(1);
      expect(rootRef).toHaveBeenCalledWith(root);
      expect(childRef).toHaveBeenCalledTimes(1);
      // user-event models tab order here; native-browser proof is a separate lane.
      screen.getByTestId("before").focus();
      await user.tab();
      expect(root).toHaveFocus();
      for (const value of [-1, undefined]) {
        setTabindex(value);
        flush();
        if (value === -1) {
          root.focus();
          expect(root).toHaveFocus();
        }
        screen.getByTestId("before").focus();
        await user.tab();
        expect(
          link ? (value === undefined ? root : screen.getByTestId("after")) : input,
        ).toHaveFocus();
      }
    },
  );

  it.each([false, true])(
    "preserves caller tabindex through linked Card disability cycles (initiallyDisabled=%s)",
    (initiallyDisabled) => {
      const [disabled, setDisabled] = createSignal(initiallyDisabled);
      render(() => (
        <Card
          id="disabled-link"
          href="#target"
          isDisabled={disabled()}
          tabindex={-1}
          data-testid="disabled-link"
        >
          <span>Disabled link child</span>
        </Card>
      ));
      for (const value of [initiallyDisabled, true, false, true, false]) {
        setDisabled(value);
        flush();
        // Link intentionally changes anchor/span roots when disability changes.
        const root = screen.getByTestId("disabled-link");
        if (value) {
          expect(root).toHaveAttribute("aria-disabled", "true");
          expect(root).not.toHaveAttribute("tabindex");
          root.focus();
          expect(root).not.toHaveFocus();
        } else {
          expect(root).not.toHaveAttribute("aria-disabled");
          expect(root).toHaveAttribute("tabindex", "-1");
          root.focus();
          expect(root).toHaveFocus();
        }
      }
    },
  );

  it("preserves live outer focus context precedence, ref and events", async () => {
    const user = setupUser();
    const [outerIndex, setOuterIndex] = createSignal<number | undefined>(0);
    const [callerIndex, setCallerIndex] = createSignal<number | undefined>(-1);
    const firstKey = vi.fn();
    const nextKey = vi.fn();
    const [keyHandler, setKeyHandler] = createSignal(firstKey);
    const outerRef = vi.fn();
    const cardRef = vi.fn();
    const childRef = vi.fn();
    const context = {
      get tabIndex() {
        return outerIndex();
      },
      get onKeyDown() {
        return keyHandler();
      },
      ref: outerRef,
    };
    render(() => (
      <FocusableContext value={context}>
        <Card
          id="context-card"
          href="#target"
          tabindex={callerIndex()}
          ref={cardRef}
          data-testid="context-card"
        >
          <span ref={childRef}>Context child</span>
        </Card>
      </FocusableContext>
    ));
    const root = screen.getByTestId("context-card");
    const child = screen.getByText("Context child");
    expect(root.tabIndex).toBe(0);
    root.focus();
    await user.keyboard("a");
    expect(firstKey).toHaveBeenCalledTimes(1);
    setKeyHandler(() => nextKey);
    setCallerIndex(0);
    setOuterIndex(-1);
    flush();
    expect(root.tabIndex).toBe(-1);
    await user.keyboard("b");
    expect(firstKey).toHaveBeenCalledTimes(1);
    expect(nextKey).toHaveBeenCalledTimes(1);
    setCallerIndex(-1);
    setOuterIndex(undefined);
    flush();
    expect(root.tabIndex).toBe(-1);
    setCallerIndex(undefined);
    flush();
    expect(root.tabIndex).toBe(0);
    expect(screen.getByTestId("context-card")).toBe(root);
    expect(screen.getByText("Context child")).toBe(child);
    expect(root).toHaveFocus();
    expect(outerRef).toHaveBeenCalledExactlyOnceWith(root);
    expect(cardRef).toHaveBeenCalledExactlyOnceWith(root);
    expect(childRef).toHaveBeenCalledExactlyOnceWith(child);
  });

  it.each([false, true])("keeps standalone cards nonselectable (link=%s)", async (link) => {
    const user = setupUser();
    render(() => (
      <Card id="standalone" href={link ? "#target" : undefined} data-testid="standalone">
        <Text slot="title">Standalone</Text>
      </Card>
    ));
    const root = screen.getByTestId("standalone");
    await user.click(root);
    expect(root).not.toHaveAttribute("aria-selected");
    expect(root).not.toHaveAttribute("data-selected");
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("keeps managed roving tabindex authoritative over conflicting caller values", async () => {
    const user = setupUser();
    render(() => (
      <CardView
        aria-label="Managed cards"
        items={projects}
        getKey={(item) => item.id}
        getTextValue={(item) => item.title}
        selectionMode="single"
        selectionStyle="highlight"
        defaultSelectedKeys={["apollo"]}
      >
        {(item) => (
          <Card id={item.id} textValue={item.title} tabindex={item.id === "apollo" ? -1 : 0}>
            <Text slot="title">{item.title}</Text>
          </Card>
        )}
      </CardView>
    ));
    const first = screen.getByRole("row", { name: "Apollo" });
    const second = screen.getByRole("row", { name: "Zephyr" });
    first.focus();
    flush();
    expect(first).toHaveFocus();
    expect(first).toHaveAttribute("tabindex", "0");
    expect(second).toHaveAttribute("tabindex", "-1");
    expect(first).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}");
    expect(second).toHaveFocus();
    expect(first).toHaveAttribute("tabindex", "-1");
    expect(second).toHaveAttribute("tabindex", "0");
    expect(first).toHaveAttribute("aria-selected", "false");
    expect(second).toHaveAttribute("aria-selected", "true");
  });

  it("exports the public Card and CardView subpath surfaces", () => {
    expect(cardSubpath.Card).toBe(Card);
    expect(cardSubpath.CardPreview).toBe(CardPreview);
    expect(cardSubpath.Text).toBe(Text);
    expect(cardSubpath.Content).toBe(Content);
    expect(cardViewSubpath.CardView).toBe(CardView);
    expect(cardViewSubpath.Card).toBe(Card);
    expect(cardViewSubpath.SkeletonCollection).toBeDefined();
  });

  it("renders standalone cards with S2 data attributes and slots", () => {
    render(() => (
      <Card
        data-testid="project-card"
        size="S"
        density="spacious"
        variant="tertiary"
        UNSAFE_style={{ width: "12rem" }}
      >
        <CardPreview data-testid="project-preview">
          <Image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" alt="" />
        </CardPreview>
        <Content>
          <Text slot="title">Apollo</Text>
          <Text slot="description">Active</Text>
        </Content>
      </Card>
    ));

    const card = screen.getByTestId("project-card");
    expect(card).toHaveAttribute("data-size", "S");
    expect(card).toHaveAttribute("data-density", "spacious");
    expect(card).toHaveAttribute("data-variant", "tertiary");
    expect(screen.getByTestId("project-preview")).toHaveAttribute("slot", "preview");
    expect(screen.getByText("Apollo")).toHaveAttribute("slot", "title");
    expect(screen.getByText("Active")).toHaveAttribute("slot", "description");
  });

  it("renders cards with grid semantics and S2 data attributes", () => {
    render(() => (
      <CardView
        aria-label="Projects"
        items={projects}
        getKey={(item) => item.id}
        getTextValue={(item) => item.title}
        size="S"
        density="compact"
        variant="secondary"
      >
        {(item) => (
          <Card id={item.id} textValue={`${item.title} ${item.status}`}>
            <Content>
              <Text slot="title">{item.title}</Text>
              <Text slot="description">{item.status}</Text>
            </Content>
          </Card>
        )}
      </CardView>
    ));

    const grid = screen.getByRole("grid", { name: "Projects" });
    expect(grid).toHaveAttribute("data-layout", "grid");
    expect(grid).toHaveAttribute("data-size", "S");
    expect(grid).toHaveAttribute("data-density", "compact");
    expect(grid).toHaveAttribute("data-variant", "secondary");
    expect(grid).toHaveAttribute("data-selection-style", "checkbox");

    const apollo = screen.getByRole("row", { name: /Apollo/ });
    expect(apollo).toHaveAttribute("data-size", "S");
    expect(apollo).toHaveAttribute("data-density", "regular");
    expect(apollo).toHaveAttribute("data-variant", "secondary");
    expect(screen.getByRole("row", { name: "Zephyr Queued" })).toBeInTheDocument();
  });

  it("supports controlled highlight selection with replace behavior", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    function Demo() {
      const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["apollo"]));
      return (
        <CardView
          aria-label="Projects"
          items={projects}
          getKey={(item) => item.id}
          getTextValue={(item) => item.title}
          selectionMode="single"
          selectionStyle="highlight"
          selectedKeys={selectedKeys()}
          onSelectionChange={(keys) => {
            const nextKeys = keys === "all" ? new Set(projects.map((item) => item.id)) : keys;
            setSelectedKeys(new Set(Array.from(nextKeys, String)));
            onSelectionChange(keys);
          }}
        >
          {(item) => (
            <Card id={item.id} textValue={`${item.title} ${item.status}`}>
              <Content>
                <Text slot="title">{item.title}</Text>
                <Text slot="description">{item.status}</Text>
              </Content>
            </Card>
          )}
        </CardView>
      );
    }

    render(() => <Demo />);

    const grid = screen.getByRole("grid", { name: "Projects" });
    expect(grid).toHaveAttribute("data-selection-style", "highlight");

    const apollo = screen.getByRole("row", { name: /Apollo/ });
    const zephyr = screen.getByRole("row", { name: /Zephyr/ });
    expect(apollo).toHaveAttribute("data-selected", "true");
    expect(zephyr).not.toHaveAttribute("data-selected");

    await user.click(zephyr);

    expect(apollo).not.toHaveAttribute("data-selected");
    expect(zephyr).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["zephyr"]));
  });

  it("supports checkbox selection with toggle behavior", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    function Demo(props: { selectionStyle: CardViewSelectionStyle }) {
      const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["apollo"]));
      return (
        <CardView
          aria-label="Projects"
          items={projects}
          getKey={(item) => item.id}
          getTextValue={(item) => item.title}
          selectionMode="multiple"
          selectionStyle={props.selectionStyle}
          selectedKeys={selectedKeys()}
          onSelectionChange={(keys) => {
            const nextKeys = keys === "all" ? new Set(projects.map((item) => item.id)) : keys;
            setSelectedKeys(new Set(Array.from(nextKeys, String)));
            onSelectionChange(keys);
          }}
        >
          {(item) => (
            <Card id={item.id} textValue={`${item.title} ${item.status}`}>
              <Content>
                <Text slot="title">{item.title}</Text>
                <Text slot="description">{item.status}</Text>
              </Content>
            </Card>
          )}
        </CardView>
      );
    }

    render(() => <Demo selectionStyle="checkbox" />);

    const grid = screen.getByRole("grid", { name: "Projects" });
    expect(grid).toHaveAttribute("data-selection-style", "checkbox");

    const apollo = screen.getByRole("row", { name: /Apollo/ });
    const zephyr = screen.getByRole("row", { name: /Zephyr/ });
    expect(apollo).toHaveAttribute("data-selected", "true");
    expect(within(apollo).getByRole("checkbox", { name: /Select/ })).toBeChecked();

    await user.click(zephyr);

    expect(apollo).toHaveAttribute("data-selected", "true");
    expect(zephyr).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["apollo", "zephyr"]));

    await user.click(apollo);

    expect(apollo).not.toHaveAttribute("data-selected");
    expect(zephyr).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["zephyr"]));
  });

  it("keeps renderActionBar selection in sync for uncontrolled CardView selection", async () => {
    const user = setupUser();

    render(() => (
      <CardView
        aria-label="Projects"
        items={projects}
        getKey={(item) => item.id}
        getTextValue={(item) => item.title}
        selectionMode="multiple"
        selectionStyle="checkbox"
        defaultSelectedKeys={["apollo"]}
        renderActionBar={(keys) => (
          <output data-testid="selection">
            {keys === "all" ? "all" : Array.from(keys).sort().join(",")}
          </output>
        )}
      >
        {(item) => (
          <Card id={item.id} textValue={`${item.title} ${item.status}`}>
            <Content>
              <Text slot="title">{item.title}</Text>
              <Text slot="description">{item.status}</Text>
            </Content>
          </Card>
        )}
      </CardView>
    ));

    expect(screen.getByTestId("selection")).toHaveTextContent("apollo");

    await user.click(screen.getByRole("row", { name: /Zephyr/ }));

    expect(screen.getByTestId("selection")).toHaveTextContent("apollo,zephyr");
  });

  it("moves highlight selection with End and ArrowRight in a two-column grid", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    render(() => (
      <div style={{ width: "360px" }}>
        <CardView
          aria-label="Projects"
          items={projects}
          getKey={(item) => item.id}
          getTextValue={(item) => item.title}
          selectionMode="single"
          selectionStyle="highlight"
          defaultSelectedKeys={["apollo"]}
          onSelectionChange={onSelectionChange}
        >
          {(item) => (
            <Card id={item.id} textValue={`${item.title} ${item.status}`}>
              <Content>
                <Text slot="title">{item.title}</Text>
                <Text slot="description">{item.status}</Text>
              </Content>
            </Card>
          )}
        </CardView>
      </div>
    ));

    const apollo = screen.getByRole("row", { name: /Apollo/ });
    apollo.focus();
    await user.keyboard("{End}");
    const next = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string>;
    expect([...next]).toEqual(["zephyr"]);
  });

  it("packs measured columns into --cardview-columns after layout", () => {
    const restore = stubClientWidth(360);
    try {
      renderProjects();
      const grid = screen.getByRole("grid", { name: "Projects" });
      expect(grid.clientWidth).toBe(360);
      const columns = grid.style.getPropertyValue("--cardview-columns");
      expect(columns).toMatch(/^[1-9]\d*$/);
      expect(columns).not.toBe("");
      expect(String(grid.getAttribute("style") ?? "")).not.toContain("auto-fit");
      expect(grid).toHaveAttribute("data-layout", "grid");
    } finally {
      restore();
    }
  });

  it("keeps waterfall layout while --cardview-columns stays a measured column count", () => {
    const restore = stubClientWidth(360);
    try {
      renderProjects("waterfall");
      const grid = screen.getByRole("grid", { name: "Projects" });
      expect(grid.clientWidth).toBe(360);
      expect(grid).toHaveAttribute("data-layout", "waterfall");
      expect(grid.style.getPropertyValue("--cardview-columns")).toMatch(/^[1-9]\d*$/);
    } finally {
      restore();
    }
  });
});
