/** @jsxImportSource solid-js */
/**
 * Server-rendered Meter surface for the D12 hydration oracle.
 *
 * The styled Meter wraps the shared headless Meter and Label. This island keeps
 * that real component chain intact so D12 can compare the server relationship
 * with the hydrated relationship.
 */
import { createSignal, onMount } from "solid-js";
import {
  Meter as SolidSpectrumMeter,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";

export default function SolidMeterIsland() {
  const [hydrated, setHydrated] = createSignal(false);

  onMount(() => {
    setHydrated(true);
  });

  return (
    <SolidSpectrumProvider colorScheme="light" background="base">
      <div data-comparison-hydrated={hydrated() ? "true" : undefined}>
        <SolidSpectrumMeter label="Storage" value={72} />
      </div>
    </SolidSpectrumProvider>
  );
}
