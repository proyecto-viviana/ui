/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import {
  ActionButton,
  ActionButtonGroup,
  Button,
  Form,
  LinkButton,
  Menu,
  MenuItem,
  MenuTrigger,
  NotificationBadge,
  NumberField,
  Skeleton,
  TextField,
  ToggleButton,
} from "../src";

describe("Form (solid-spectrum)", () => {
  it("renders an S2 styled form root", () => {
    const { container } = render(() => (
      <Form aria-label="Project form" data-testid="form-root">
        <TextField label="Name" />
      </Form>
    ));

    const form = screen.getByTestId("form-root");
    expect(form.tagName).toBe("FORM");
    expect(form.className).not.toBe("solidaria-Form");
    expect(form.className).not.toBe("");
    expect(container.querySelector("input")).toBeInTheDocument();
  });

  it("supports validation behavior and unsafe escape hatches", () => {
    render(() => (
      <Form
        validationBehavior="aria"
        UNSAFE_className="custom-form"
        UNSAFE_style={{ margin: "2px" }}
        data-testid="form-root"
      >
        <TextField label="Name" />
      </Form>
    ));

    const form = screen.getByTestId("form-root") as HTMLFormElement;
    expect(form).toHaveAttribute("novalidate");
    expect(form).toHaveClass("custom-form");
    expect(form.style.margin).toBe("2px");
  });

  it("forwards native form props and events through the S2 wrapper", () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const onReset = vi.fn();

    render(() => (
      <Form
        aria-label="Project form"
        action="/projects"
        method="post"
        target="_blank"
        autoComplete="off"
        encType="multipart/form-data"
        name="projectForm"
        rel="noopener"
        data-testid="form-root"
        onSubmit={onSubmit}
        onReset={onReset}
      >
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
      </Form>
    ));

    const form = screen.getByTestId("form-root") as HTMLFormElement;
    expect(form).toHaveAttribute("action", "/projects");
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("target", "_blank");
    expect(form).toHaveAttribute("autocomplete", "off");
    expect(form).toHaveAttribute("enctype", "multipart/form-data");
    expect(form).toHaveAttribute("name", "projectForm");
    expect(form).toHaveAttribute("rel", "noopener");

    fireEvent.submit(form);
    fireEvent.reset(form);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("forwards documented ARIA description props through the S2 wrapper", () => {
    render(() => (
      <>
        <span id="form-description">Description</span>
        <div id="form-details">Details</div>
        <Form
          aria-label="Project form"
          aria-describedby="form-description"
          aria-details="form-details"
        >
          <TextField label="Name" />
        </Form>
      </>
    ));

    const form = screen.getByRole("form", { name: "Project form" });
    expect(form).toHaveAttribute("aria-describedby", "form-description");
    expect(form).toHaveAttribute("aria-details", "form-details");
  });

  it("does not leak S2 visual props as root marker attributes", () => {
    render(() => (
      <Form
        aria-label="Project form"
        size="XL"
        labelPosition="side"
        labelAlign="end"
        necessityIndicator="label"
        isRequired
        isDisabled
        isEmphasized
      >
        <TextField label="Name" />
      </Form>
    ));

    const form = screen.getByRole("form", { name: "Project form" });
    expect(form).not.toHaveAttribute("data-size");
    expect(form).not.toHaveAttribute("data-label-position");
    expect(form).not.toHaveAttribute("data-label-align");
    expect(form).not.toHaveAttribute("data-necessity-indicator");
    expect(form).not.toHaveAttribute("data-required");
    expect(form).not.toHaveAttribute("data-disabled");
    expect(form).not.toHaveAttribute("data-emphasized");
  });

  it("exposes the S2 form root ref", () => {
    const callbackRef = vi.fn();
    const objectRef: { current: HTMLFormElement | null } = { current: null };

    render(() => (
      <>
        <Form aria-label="Callback form" ref={callbackRef}>
          <TextField label="Name" />
        </Form>
        <Form aria-label="Object form" ref={objectRef}>
          <TextField label="Email" />
        </Form>
      </>
    ));

    const callbackForm = screen.getByRole("form", { name: "Callback form" });
    const objectForm = screen.getByRole("form", { name: "Object form" });
    expect(callbackRef).toHaveBeenCalledWith(callbackForm);
    expect(objectRef.current).toBe(objectForm);
  });

  it("drops native required when Form validationBehavior is aria and isRequired is inherited", () => {
    render(() => (
      <Form validationBehavior="aria" isRequired aria-label="Aria form">
        <TextField label="Name" description="Inherited from the parent form." />
      </Form>
    ));

    const input = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
    expect(input).not.toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input.validity.valueMissing).toBe(false);
  });

  it("drops native required when Form validationBehavior is aria and TextField sets isRequired", () => {
    render(() => (
      <Form validationBehavior="aria" aria-label="Aria field form">
        <TextField label="Name" isRequired />
      </Form>
    ));

    const input = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
    expect(input).not.toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input.validity.valueMissing).toBe(false);
  });

  it("provides S2 field props to TextField and Button children", () => {
    render(() => (
      <Form
        size="XL"
        labelPosition="side"
        labelAlign="end"
        necessityIndicator="label"
        isRequired
        isDisabled
      >
        <TextField label="Project" />
        <Button>Submit</Button>
      </Form>
    ));

    const input = screen.getByRole("textbox") as HTMLInputElement;
    const button = screen.getByRole("button", { name: "Submit" }) as HTMLButtonElement;

    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(button).toBeDisabled();
    expect(screen.getByText("(required)")).toBeInTheDocument();
  });

  // The Form's size reaches all four buttons, and a local size still wins.
  // Upstream applies useFormProps before the size default in each of them.
  it.each([
    ["Button", Button],
    ["ActionButton", ActionButton],
    ["ToggleButton", ToggleButton],
    ["LinkButton", LinkButton],
  ] as const)("gives %s the Form's size", (_name, Component) => {
    const C = Component as (props: Record<string, unknown>) => ReturnType<typeof Button>;
    render(() => (
      <>
        <Form size="XL">
          <C>inherited</C>
          <C size="S">local</C>
        </Form>
        <C size="XL">xl</C>
        <C size="S">s</C>
        <C>m</C>
      </>
    ));
    const cls = (text: string) =>
      screen.getByText(text).closest('button, a, [role="link"]')!.className;

    expect(cls("xl")).not.toBe(cls("m"));
    expect(cls("inherited")).toBe(cls("xl"));
    expect(cls("local")).toBe(cls("s"));
  });

  // Upstream ends every button's isDisabled on the Form/Skeleton proxy:
  // `props = useFormProps(props)` and then `isDisabled={props.isDisabled ?? ctx.isDisabled}`
  // (`@react-spectrum/s2@1.7.0/src/ActionButton.tsx:334,358`; Button and
  // LinkButton just spread the proxied props). So the Form disables all four,
  // a local `isDisabled={false}` still opts out, and a Skeleton wins over it.
  it.each([
    ["Button", Button],
    ["ActionButton", ActionButton],
    ["ToggleButton", ToggleButton],
    ["LinkButton", LinkButton],
  ] as const)("disables %s through the Form and the Skeleton", (_name, Component) => {
    const C = Component as (props: Record<string, unknown>) => ReturnType<typeof Button>;
    render(() => (
      <>
        <Form isDisabled>
          <C>inherited</C>
          <C isDisabled={false}>opted out</C>
        </Form>
        <Skeleton isLoading>
          <C isDisabled={false}>skeleton</C>
        </Skeleton>
      </>
    ));
    // A disabled button carries `disabled`; a disabled Link carries `data-disabled`.
    const isDisabled = (text: string) => {
      const control = screen.getByText(text).closest('button, a, [role="link"]')!;
      return control.hasAttribute("disabled") || control.hasAttribute("data-disabled");
    };

    expect(isDisabled("inherited")).toBe(true);
    expect(isDisabled("opted out")).toBe(false);
    expect(isDisabled("skeleton")).toBe(true);
  });

  // Upstream's ActionButtonGroup is the last resort for isDisabled, below the
  // button's own prop (`props.isDisabled ?? isDisabled`), while its size wins
  // (`size = props.size || 'M'` as the ctx destructuring default).
  it("keeps ActionButtonGroup's isDisabled below the button's own prop", () => {
    render(() => (
      <>
        <ActionButtonGroup isDisabled>
          <ActionButton>grouped</ActionButton>
          <ActionButton isDisabled={false}>opted out of the group</ActionButton>
        </ActionButtonGroup>
        <Form isDisabled>
          <ActionButtonGroup>
            <ActionButton>grouped in a form</ActionButton>
          </ActionButtonGroup>
        </Form>
      </>
    ));

    expect(screen.getByRole("button", { name: "grouped" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "opted out of the group" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "grouped in a form" })).toBeDisabled();
  });

  // ToggleButton is the one button that still hands the element a flag after the
  // proxy spread: `menuTriggerButtonProps()` carried the MenuTrigger's
  // `isDisabled`, which `MenuTrigger` publishes as a concrete boolean
  // (`packages/solidaria-components/src/Menu.tsx:417`), so a present `false`
  // shadowed the Form and the Skeleton. Upstream's MenuTrigger never sets the
  // flag on the trigger at all — RAC spreads only `menuTriggerProps` through a
  // `PressResponder` (`react-aria-components@1.21.0` `Menu`) — so ours stays the
  // last resort, below the group, the button's own prop and the proxy.
  it("keeps the MenuTrigger's isDisabled below the Form and the Skeleton", () => {
    render(() => (
      <>
        <Form isDisabled>
          <MenuTrigger>
            <ToggleButton>in a form</ToggleButton>
            <Menu aria-label="Form actions">
              <MenuItem id="a">A</MenuItem>
            </Menu>
          </MenuTrigger>
        </Form>
        <Skeleton isLoading>
          <MenuTrigger>
            <ToggleButton isDisabled={false}>in a skeleton</ToggleButton>
            <Menu aria-label="Skeleton actions">
              <MenuItem id="a">A</MenuItem>
            </Menu>
          </MenuTrigger>
        </Skeleton>
        <MenuTrigger isDisabled>
          <ToggleButton>under a disabled trigger</ToggleButton>
          <Menu aria-label="Disabled actions">
            <MenuItem id="a">A</MenuItem>
          </Menu>
        </MenuTrigger>
        <MenuTrigger>
          <ToggleButton>under a plain trigger</ToggleButton>
          <Menu aria-label="Plain actions">
            <MenuItem id="a">A</MenuItem>
          </Menu>
        </MenuTrigger>
      </>
    ));

    const trigger = (text: string) => screen.getByText(text).closest("button")!;

    expect(trigger("in a form")).toBeDisabled();
    expect(trigger("in a skeleton")).toBeDisabled();
    expect(trigger("under a disabled trigger")).toBeDisabled();
    expect(trigger("under a plain trigger")).not.toBeDisabled();
  });

  // Upstream hands NotificationBadgeContext the RACButton render prop, not the
  // group value: `:381` is `{({isDisabled}) =>`, which shadows the `ctx`
  // destructuring at `:348`, so `:436` passes the resolved
  // `props.isDisabled ?? ctx.isDisabled` of `:358`
  // (`@react-spectrum/s2@1.7.0/src/ActionButton.tsx:348,358,381,436`), and the
  // group greys the badge as well as the button. The proxy alone misses it.
  it("gives ActionButton's NotificationBadge the resolved isDisabled", () => {
    render(() => (
      <>
        <ActionButton isDisabled>
          <NotificationBadge value={5} data-testid="own-badge" />
        </ActionButton>
        <ActionButton>
          <NotificationBadge value={5} data-testid="enabled-badge" />
        </ActionButton>
        <ActionButtonGroup isDisabled>
          <ActionButton>
            <NotificationBadge value={5} data-testid="grouped-badge" />
          </ActionButton>
        </ActionButtonGroup>
        <Form isDisabled>
          <ActionButton>
            <NotificationBadge value={5} data-testid="form-badge" />
          </ActionButton>
        </Form>
      </>
    ));

    const cls = (testId: string) => screen.getByTestId(testId).className;

    expect(cls("own-badge")).not.toBe(cls("enabled-badge"));
    expect(cls("grouped-badge")).toBe(cls("own-badge"));
    expect(cls("form-badge")).toBe(cls("own-badge"));
  });

  it("lets local form-aware child props override form context outside Skeleton", () => {
    render(() => (
      <Form isDisabled isRequired>
        <TextField label="Project" isDisabled={false} isRequired={false} />
        <Button isDisabled={false}>Submit</Button>
      </Form>
    ));

    const input = screen.getByRole("textbox") as HTMLInputElement;
    const button = screen.getByRole("button", { name: "Submit" }) as HTMLButtonElement;

    expect(input).not.toBeDisabled();
    expect(input).not.toBeRequired();
    expect(button).not.toBeDisabled();
  });

  it("disables form-aware descendants inside Skeleton even when children opt out", () => {
    render(() => (
      <Skeleton isLoading>
        <Form>
          <TextField label="Loading" isDisabled={false} />
          <Button isDisabled={false}>Submit</Button>
        </Form>
      </Skeleton>
    ));

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("paints HelpText and aria-invalid after a blocked native required submit", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());

    render(() => (
      <Form aria-label="Project form" onSubmit={onSubmit}>
        <TextField label="Project name" isRequired description="Inherited from the parent form." />
        <button type="submit">Submit</button>
      </Form>
    ));

    const input = screen.getByRole("textbox", { name: "Project name" }) as HTMLInputElement;
    const form = screen.getByRole("form", { name: "Project form" }) as HTMLFormElement;
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("Inherited from the parent form.")).toBeInTheDocument();

    form.requestSubmit();

    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
    expect(screen.queryByText("Inherited from the parent form.")).not.toBeInTheDocument();
    expect(screen.getByText(input.validationMessage)).toBeInTheDocument();
  });

  it("paints HelpText after a blocked native required NumberField submit", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());

    render(() => (
      <Form aria-label="Quantity form" onSubmit={onSubmit}>
        <NumberField label="Quantity" isRequired description="Inherited from the parent form." />
        <button type="submit">Submit</button>
      </Form>
    ));

    const input = screen.getByRole("textbox", { name: "Quantity" }) as HTMLInputElement;
    const form = screen.getByRole("form", { name: "Quantity form" }) as HTMLFormElement;
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("Inherited from the parent form.")).toBeInTheDocument();

    form.requestSubmit();

    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
    expect(screen.queryByText("Inherited from the parent form.")).not.toBeInTheDocument();
    expect(screen.getByText(input.validationMessage)).toBeInTheDocument();
  });
});
