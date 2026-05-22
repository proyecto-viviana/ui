import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@solidjs/testing-library";
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

interface ProjectCard {
  id: string;
  title: string;
  status: string;
}

const projects: ProjectCard[] = [
  { id: "apollo", title: "Apollo", status: "Active" },
  { id: "zephyr", title: "Zephyr", status: "Queued" },
];

describe("CardView (solid-spectrum)", () => {
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
    expect(screen.getByRole("row", { name: /Zephyr/ })).toBeInTheDocument();
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
    expect(within(apollo).getByRole("checkbox", { name: "Select" })).toBeChecked();

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
});
