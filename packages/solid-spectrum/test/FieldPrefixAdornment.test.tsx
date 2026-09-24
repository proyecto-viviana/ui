import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { TextField } from "../src/textfield";
import { ComboBox, ComboBoxItem } from "../src/combobox";
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
        <TextField label="Text" prefix={<Probe />} />
        <ComboBox label="Combo" prefix={<Probe />}>
          <ComboBoxItem id="1">One</ComboBoxItem>
        </ComboBox>
        <NumberField label="Number" prefix={<Probe />} />
        <ColorField label="Color" prefix={<Probe />} />
      </>
    ));

    expect(probeInstantiations).toBe(4);
    expect(screen.getAllByTestId("probe")).toHaveLength(4);
  });
});
