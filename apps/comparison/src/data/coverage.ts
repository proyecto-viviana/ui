import type { ComponentControlGroup } from "./component-controls";
import type { ComparisonEntry } from "./comparison-manifest";
import { getVisualStateTargets } from "./visual-state-matrix";

export interface CoverageMetric {
  id: string;
  label: string;
  value: number;
  complete: number;
  total: number;
}

export interface ComponentCoverage {
  overall: number;
  metrics: readonly CoverageMetric[];
}

function percent(complete: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((complete / total) * 100);
}

function metric(id: string, label: string, complete: number, total: number): CoverageMetric {
  return {
    id,
    label,
    value: percent(complete, total),
    complete,
    total,
  };
}

export function getComponentCoverage(
  entry: ComparisonEntry,
  controlGroup: ComponentControlGroup,
): ComponentCoverage {
  const visualStates = getVisualStateTargets(entry);
  const styledLayer = entry.layers.styled;
  const implementedLayers = Object.values(entry.layers).filter((layer) => layer.solid === "live");
  const visualEvidenceStates = visualStates.filter(
    (state) => state.react !== "missing" && state.solid !== "missing",
  );
  const strictPairDiffStates = visualStates.filter((state) => state.pairDiff === "strict");

  const metrics = [
    metric(
      "api",
      "API",
      controlGroup.coverage === "modeled" ? Math.max(controlGroup.apiProps.length, 1) : 0,
      Math.max(controlGroup.apiProps.length, 1),
    ),
    metric("react", "React reference", styledLayer.react === "live" ? 1 : 0, 1),
    metric(
      "solid",
      "Solid implementation",
      implementedLayers.length,
      Object.keys(entry.layers).length,
    ),
    metric("behavior", "Behavior tests", entry.parity === "matched" ? 1 : 0, 1),
    metric("visual", "Visual states", visualEvidenceStates.length, visualStates.length),
    metric("pair", "Strict pair diff", strictPairDiffStates.length, visualStates.length),
  ];

  return {
    overall: Math.round(metrics.reduce((sum, item) => sum + item.value, 0) / metrics.length),
    metrics,
  };
}
