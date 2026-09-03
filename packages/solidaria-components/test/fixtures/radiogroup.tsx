import { Radio, RadioGroup } from "../../src/RadioGroup";

export const PLANS = ["free", "pro", "team"] as const;

/**
 * The `/showcase/selection` shape: a labelled group with a description and no
 * error message, plus a bare group with neither. The group's description /
 * error ids reach each radio through `radioGroupData`, which is what made
 * `createRadio` probe the DOM for them.
 */
export function RadioGroupFixture() {
  return (
    <>
      <RadioGroup aria-label="Plan" description="Billed monthly" data-testid="described">
        {PLANS.map((plan) => (
          <Radio value={plan}>{plan}</Radio>
        ))}
      </RadioGroup>
      <RadioGroup aria-label="Bare" data-testid="bare">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>
    </>
  );
}
