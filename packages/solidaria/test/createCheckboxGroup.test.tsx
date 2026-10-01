/**
 * Tests for createCheckboxGroup
 *
 * Ported from @react-aria/checkbox's useCheckboxGroup.test.tsx
 * with adaptations for SolidJS patterns.
 */

import { describe, it, expect, vi, beforeAll } from "vite-plus/test";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal, createEffect, createRoot, Show } from "solid-js";
import {
  createCheckboxGroup,
  createCheckboxGroupItem,
  createCheckboxGroupState,
  type AriaCheckboxGroupProps,
  type AriaCheckboxGroupItemProps,
  type CheckboxGroupState,
} from "../src/checkbox";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// Test components
function Checkbox(props: AriaCheckboxGroupItemProps & { checkboxGroupState: CheckboxGroupState }) {
  let inputRef: HTMLInputElement | null = null;

  const result = createCheckboxGroupItem(
    () => ({
      value: props.value,
      isReadOnly: props.isReadOnly,
      isDisabled: props.isDisabled,
      isRequired: props.isRequired,
      onChange: props.onChange,
      children: props.children,
      validationBehavior: props.validationBehavior,
    }),
    props.checkboxGroupState,
    () => inputRef,
  );

  // Use a derived signal for checked state to ensure reactivity
  const isChecked = () => props.checkboxGroupState.value().includes(props.value);

  // Access inputProps once per render to avoid reactivity issues
  const getInputProps = () => result.inputProps;

  return (
    <label>
      <input
        ref={(el) => (inputRef = el)}
        type="checkbox"
        value={props.value}
        name={getInputProps().name}
        checked={isChecked()}
        disabled={getInputProps().disabled}
        aria-readonly={getInputProps()["aria-readonly"]}
        aria-required={getInputProps()["aria-required"]}
        aria-describedby={getInputProps()["aria-describedby"]}
        required={getInputProps().required}
        onChange={getInputProps().onChange}
      />
      {props.children}
    </label>
  );
}

function CheckboxGroup(props: {
  groupProps: AriaCheckboxGroupProps;
  checkboxProps: AriaCheckboxGroupItemProps[];
}) {
  const state = createCheckboxGroupState(() => props.groupProps);
  const group = createCheckboxGroup(() => props.groupProps, state);

  // Access checkbox props outside JSX to avoid proxy issues
  const getCheckboxProps = (index: number): AriaCheckboxGroupItemProps => {
    const cp = props.checkboxProps[index];
    return {
      value: cp.value,
      children: cp.children,
      isReadOnly: cp.isReadOnly,
      isDisabled: cp.isDisabled,
      isRequired: cp.isRequired,
      onChange: cp.onChange,
      validationBehavior: cp.validationBehavior,
    };
  };

  return (
    <div {...group.groupProps} data-invalid={group.isInvalid ? "true" : undefined}>
      {props.groupProps.label && <span {...group.labelProps}>{props.groupProps.label}</span>}
      <Checkbox checkboxGroupState={state} {...getCheckboxProps(0)} />
      <Checkbox checkboxGroupState={state} {...getCheckboxProps(1)} />
      <Checkbox checkboxGroupState={state} {...getCheckboxProps(2)} />
    </div>
  );
}

describe("createCheckboxGroup", () => {
  let user: ReturnType<typeof setupUser>;

  beforeAll(() => {
    user = setupUser();
  });

  it("basic checkbox sanity check", async () => {
    function SimpleCheckbox() {
      const [checked, setChecked] = createSignal(false);
      return (
        <label>
          <input
            type="checkbox"
            checked={checked()}
            onChange={(e) => setChecked(e.currentTarget.checked)}
          />
          Simple
        </label>
      );
    }

    render(() => <SimpleCheckbox />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("checkbox with external state", async () => {
    const [values, setValues] = createSignal<string[]>([]);

    function ExternalCheckbox(props: {
      value: string;
      values: () => string[];
      onChange: (v: string[]) => void;
    }) {
      return (
        <label>
          <input
            type="checkbox"
            value={props.value}
            checked={props.values().includes(props.value)}
            onChange={(e) => {
              const current = props.values();
              if (e.currentTarget.checked) {
                props.onChange([...current, props.value]);
              } else {
                props.onChange(current.filter((v) => v !== props.value));
              }
            }}
          />
          {props.value}
        </label>
      );
    }

    render(() => (
      <div>
        <ExternalCheckbox value="a" values={values} onChange={setValues} />
        <ExternalCheckbox value="b" values={values} onChange={setValues} />
      </div>
    ));

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(false);

    await user.click(checkboxes[0]);
    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes[1].checked).toBe(false);
  });

  it("handles defaults", async () => {
    const onChangeSpy = vi.fn();

    function DebugCheckboxGroup() {
      const state = createCheckboxGroupState(() => ({
        label: "Favorite Pet",
        onChange: onChangeSpy,
      }));
      const { groupProps: checkboxGroupProps, labelProps } = createCheckboxGroup(
        () => ({ label: "Favorite Pet", onChange: onChangeSpy }),
        state,
      );
      return (
        <div {...checkboxGroupProps}>
          <span {...labelProps}>Favorite Pet</span>
          <Checkbox checkboxGroupState={state} value="dogs">
            Dogs
          </Checkbox>
          <Checkbox checkboxGroupState={state} value="cats">
            Cats
          </Checkbox>
          <Checkbox checkboxGroupState={state} value="dragons">
            Dragons
          </Checkbox>
        </div>
      );
    }

    render(() => <DebugCheckboxGroup />);

    const checkboxGroup = screen.getByRole("group");
    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxGroup).toBeInTheDocument();
    expect(checkboxes.length).toBe(3);

    expect(checkboxes[0]).not.toHaveAttribute("name");
    expect(checkboxes[1]).not.toHaveAttribute("name");
    expect(checkboxes[2]).not.toHaveAttribute("name");

    expect(checkboxes[0].value).toBe("dogs");
    expect(checkboxes[1].value).toBe("cats");
    expect(checkboxes[2].value).toBe("dragons");

    expect(checkboxes[0].checked).toBeFalsy();
    expect(checkboxes[1].checked).toBeFalsy();
    expect(checkboxes[2].checked).toBeFalsy();

    const dragons = screen.getByLabelText("Dragons");
    await user.click(dragons);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(["dragons"]);

    // Force a microtask tick to let effects run
    await Promise.resolve();

    expect(checkboxes[0].checked).toBeFalsy();
    expect(checkboxes[1].checked).toBeFalsy();
    expect(checkboxes[2].checked).toBeTruthy();
  });

  it("can have a default value", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", value: ["cats"] }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    expect((screen.getByLabelText("Cats") as HTMLInputElement).checked).toBe(true);
  });

  it("name can be controlled", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ name: "awesome-solidaria", label: "Favorite Pet" }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    expect(checkboxes[0]).toHaveAttribute("name", "awesome-solidaria");
    expect(checkboxes[1]).toHaveAttribute("name", "awesome-solidaria");
    expect(checkboxes[2]).toHaveAttribute("name", "awesome-solidaria");
  });

  it("supports labeling", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet" }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group");

    const labelId = checkboxGroup.getAttribute("aria-labelledby");
    expect(labelId).toBeDefined();
    const label = document.getElementById(labelId!);
    expect(label).toHaveTextContent("Favorite Pet");
  });

  it("supports aria-label", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ "aria-label": "My Favorite Pet" }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group");

    expect(checkboxGroup).toHaveAttribute("aria-label", "My Favorite Pet");
  });

  it("supports custom props", () => {
    render(() => (
      <CheckboxGroup
        groupProps={
          { label: "Favorite Pet", "data-testid": "favorite-pet" } as AriaCheckboxGroupProps
        }
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group");

    expect(checkboxGroup).toHaveAttribute("data-testid", "favorite-pet");
  });

  it("sets aria-disabled and makes checkboxes disabled when isDisabled is true", async () => {
    const groupOnChangeSpy = vi.fn();
    const checkboxOnChangeSpy = vi.fn();
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", isDisabled: true, onChange: groupOnChangeSpy }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons", onChange: checkboxOnChangeSpy },
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group");
    expect(checkboxGroup).toHaveAttribute("aria-disabled", "true");

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[0]).toHaveAttribute("disabled");
    expect(checkboxes[1]).toHaveAttribute("disabled");
    expect(checkboxes[2]).toHaveAttribute("disabled");

    const dragons = screen.getByLabelText("Dragons");

    await user.click(dragons);

    expect(groupOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxes[2].checked).toBeFalsy();
  });

  it("doesn't set aria-disabled or make checkboxes disabled by default", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet" }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group");
    expect(checkboxGroup).not.toHaveAttribute("aria-disabled");

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[0]).not.toHaveAttribute("disabled");
    expect(checkboxes[1]).not.toHaveAttribute("disabled");
    expect(checkboxes[2]).not.toHaveAttribute("disabled");
  });

  it("doesn't set aria-disabled or make checkboxes disabled when isDisabled is false", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", isDisabled: false }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group");
    expect(checkboxGroup).not.toHaveAttribute("aria-disabled");

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[0]).not.toHaveAttribute("disabled");
    expect(checkboxes[1]).not.toHaveAttribute("disabled");
    expect(checkboxes[2]).not.toHaveAttribute("disabled");
  });

  it("keeps a group-disabled checkbox disabled when the item passes isDisabled false", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", isDisabled: true }}
        checkboxProps={[
          { value: "dogs", children: "Dogs", isDisabled: false },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toHaveAttribute("disabled");
    expect(checkboxes[1]).toHaveAttribute("disabled");
    expect(checkboxes[2]).toHaveAttribute("disabled");
  });

  it('sets aria-readonly="true" on each checkbox when group is readonly', async () => {
    const groupOnChangeSpy = vi.fn();
    const checkboxOnChangeSpy = vi.fn();
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", isReadOnly: true, onChange: groupOnChangeSpy }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons", onChange: checkboxOnChangeSpy },
        ]}
      />
    ));

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[0]).toHaveAttribute("aria-readonly", "true");
    expect(checkboxes[1]).toHaveAttribute("aria-readonly", "true");
    expect(checkboxes[2]).toHaveAttribute("aria-readonly", "true");
    expect(checkboxes[2].checked).toBeFalsy();

    const dragons = screen.getByLabelText("Dragons");

    await user.click(dragons);

    expect(groupOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxes[2].checked).toBeFalsy();
  });

  it("keeps a group-readonly checkbox readonly when the item passes isReadOnly false", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", isReadOnly: true }}
        checkboxProps={[
          { value: "dogs", children: "Dogs", isReadOnly: false },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toHaveAttribute("aria-readonly", "true");
    expect(checkboxes[1]).toHaveAttribute("aria-readonly", "true");
    expect(checkboxes[2]).toHaveAttribute("aria-readonly", "true");
  });

  it("should not update state for readonly checkbox", async () => {
    const groupOnChangeSpy = vi.fn();
    const checkboxOnChangeSpy = vi.fn();
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", onChange: groupOnChangeSpy }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          {
            value: "dragons",
            children: "Dragons",
            isReadOnly: true,
            onChange: checkboxOnChangeSpy,
          },
        ]}
      />
    ));

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    const dragons = screen.getByLabelText("Dragons");

    await user.click(dragons);

    expect(groupOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxes[2].checked).toBeFalsy();
  });

  it("supports selecting multiple values", async () => {
    const onChangeSpy = vi.fn();
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", onChange: onChangeSpy }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    // Select first checkbox
    await user.click(screen.getByLabelText("Dogs"));
    expect(onChangeSpy).toHaveBeenCalledWith(["dogs"]);
    expect(checkboxes[0].checked).toBeTruthy();

    // Select second checkbox
    await user.click(screen.getByLabelText("Cats"));
    expect(onChangeSpy).toHaveBeenCalledWith(["dogs", "cats"]);
    expect(checkboxes[0].checked).toBeTruthy();
    expect(checkboxes[1].checked).toBeTruthy();

    // Unselect first checkbox
    await user.click(screen.getByLabelText("Dogs"));
    expect(onChangeSpy).toHaveBeenCalledWith(["cats"]);
    expect(checkboxes[0].checked).toBeFalsy();
    expect(checkboxes[1].checked).toBeTruthy();
  });

  it("supports controlled selection", async () => {
    const ControlledCheckboxGroup = () => {
      const [value, setValue] = createSignal(["cats"]);

      return (
        <CheckboxGroup
          groupProps={{
            label: "Favorite Pet",
            value: value(),
            onChange: setValue,
          }}
          checkboxProps={[
            { value: "dogs", children: "Dogs" },
            { value: "cats", children: "Cats" },
            { value: "dragons", children: "Dragons" },
          ]}
        />
      );
    };

    render(() => <ControlledCheckboxGroup />);

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[1].checked).toBeTruthy();

    await user.click(screen.getByLabelText("Dogs"));
    expect(checkboxes[0].checked).toBeTruthy();
    expect(checkboxes[1].checked).toBeTruthy();

    await user.click(screen.getByLabelText("Cats"));
    expect(checkboxes[0].checked).toBeTruthy();
    expect(checkboxes[1].checked).toBeFalsy();
  });

  it("defaults required group items to native validation", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{
          "aria-label": "Favorite Pet",
          isRequired: true,
        }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute("required");
      expect(checkbox).not.toHaveAttribute("aria-required");
    });
  });

  it("propagates group validationBehavior to items", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{
          "aria-label": "Favorite Pet",
          isRequired: true,
          validationBehavior: "native",
        }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" },
        ]}
      />
    ));

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute("required");
      expect(checkbox).not.toHaveAttribute("aria-required");
    });
  });

  it("shows a required group as invalid only while nothing is selected", async () => {
    render(() => (
      <CheckboxGroup
        groupProps={{
          label: "Favorite Pet",
          isRequired: true,
          validationBehavior: "aria",
        }}
        checkboxProps={[
          { value: "dogs", children: "Dogs", validationBehavior: "native" },
          { value: "cats", children: "Cats", validationBehavior: "native" },
          { value: "dragons", children: "Dragons", validationBehavior: "native" },
        ]}
      />
    ));

    const group = screen.getByRole("group");
    const dragons = screen.getByLabelText("Dragons");

    await user.click(dragons);
    expect(group).not.toHaveAttribute("data-invalid");

    await user.click(dragons);
    expect(group).toHaveAttribute("data-invalid", "true");

    await user.click(dragons);
    expect(group).not.toHaveAttribute("data-invalid");
  });

  it("clears a group validate error once the selection satisfies it", async () => {
    function ValidatingGroup() {
      const state = createCheckboxGroupState(() => ({
        label: "Favorite Pet",
        validationBehavior: "native" as const,
        validate: (value: readonly string[]) =>
          value.length === 0 ? "Select at least one option" : null,
      }));
      const group = createCheckboxGroup(() => ({ label: "Favorite Pet" }), state);
      return (
        <div
          {...group.groupProps}
          data-invalid={group.isInvalid ? "true" : undefined}
          data-errors={group.validationErrors.join("|")}
        >
          <span {...group.labelProps}>Favorite Pet</span>
          <Checkbox checkboxGroupState={state} value="dogs" validationBehavior="native">
            Dogs
          </Checkbox>
          <Checkbox checkboxGroupState={state} value="cats" validationBehavior="native">
            Cats
          </Checkbox>
          <Checkbox checkboxGroupState={state} value="dragons" validationBehavior="native">
            Dragons
          </Checkbox>
        </div>
      );
    }

    render(() => <ValidatingGroup />);
    const group = screen.getByRole("group");
    const dragons = screen.getByLabelText("Dragons") as HTMLInputElement;

    await user.click(dragons);
    expect(group).not.toHaveAttribute("data-invalid");
    expect(dragons.validity.customError).toBe(false);

    await user.click(dragons);
    expect(group).toHaveAttribute("data-invalid", "true");
    expect(group).toHaveAttribute("data-errors", "Select at least one option");

    await user.click(dragons);
    expect(group).not.toHaveAttribute("data-invalid");
    expect(dragons.validity.customError).toBe(false);
    expect(dragons.validationMessage).toBe("");
  });

  it("exposes validation metadata from state", () => {
    createRoot((dispose) => {
      const state = createCheckboxGroupState({ isInvalid: true });
      const aria = createCheckboxGroup(() => ({ "aria-label": "Favorite Pet" }), state);

      expect(aria.isInvalid).toBe(true);
      expect(aria.validationErrors).toEqual([]);
      expect(aria.validationDetails.customError).toBe(true);
      expect(aria.validationDetails.valid).toBe(false);

      dispose();
    });
  });

  it("retargets group and item aria-describedby reactively when isInvalid changes live", async () => {
    const [isInvalid, setIsInvalid] = createSignal(false);

    function DynamicCheckboxGroup() {
      const state = createCheckboxGroupState(() => ({
        isInvalid: isInvalid(),
      }));
      const group = createCheckboxGroup(
        () => ({
          "aria-label": "Favorite Pet",
          isInvalid: isInvalid(),
          description: "Choose a pet",
          errorMessage: "Selection required",
        }),
        state,
      );

      return (
        <div {...group.groupProps}>
          <Checkbox checkboxGroupState={state} value="dogs" children="Dogs" />
          <Show when={!group.isInvalid}>
            <span {...group.descriptionProps}>Choose a pet</span>
          </Show>
          <Show when={group.isInvalid}>
            <span {...group.errorMessageProps}>Selection required</span>
          </Show>
        </div>
      );
    }

    render(() => <DynamicCheckboxGroup />);

    const groupEl = screen.getByRole("group");
    const checkbox = screen.getByRole("checkbox");

    const descEl = screen.getByText("Choose a pet");
    const descId = descEl.getAttribute("id")!;
    expect(groupEl).toHaveAttribute("aria-describedby", descId);
    expect(checkbox).toHaveAttribute("aria-describedby", descId);

    setIsInvalid(true);

    const errorEl = await screen.findByText("Selection required");
    const errorId = errorEl.getAttribute("id")!;

    await waitFor(() => {
      expect(groupEl).toHaveAttribute("aria-describedby", errorId);
      expect(checkbox).toHaveAttribute("aria-describedby", errorId);
    });

    setIsInvalid(false);

    await screen.findByText("Choose a pet");

    await waitFor(() => {
      expect(groupEl).toHaveAttribute("aria-describedby", descId);
      expect(checkbox).toHaveAttribute("aria-describedby", descId);
    });
  });
});
