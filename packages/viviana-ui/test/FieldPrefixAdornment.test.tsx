/** @vitest-environment jsdom */
import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { ComboBox, ComboBoxOption } from "../src/combobox";
import { NumberField } from "../src/numberfield";
import { ColorField } from "../src/color";

describe("field prefix adornment single instantiation (#611)", () => {
  it("instantiates prefix component exactly once across styled fields", () => {
    let probeInstantiations = 0;
    function Probe() {
      probeInstantiations++;
      return <span data-testid="probe">prefix</span>;
    }

    render(() => (
      <>
        <ComboBox label="Combo" prefix={<Probe />}>
          <ComboBoxOption id="1">One</ComboBoxOption>
        </ComboBox>
        <NumberField label="Number" prefix={<Probe />} />
        <ColorField label="Color" prefix={<Probe />} />
      </>
    ));

    expect(probeInstantiations).toBe(3);
    expect(screen.getAllByTestId("probe")).toHaveLength(3);
  });
});
