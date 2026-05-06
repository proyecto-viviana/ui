# Bundle Size Benchmarks

Compares bundle sizes between Proyecto Viviana and React Spectrum across three scenarios.

## Methodology

### Tools

- **esbuild** - Bundling and minification
- **gzip-size** - Gzip compression (level 9)
- **brotli-size** - Brotli compression (level 11)

### Build Configuration

```typescript
{
  bundle: true,
  minify: true,
  treeShaking: true,
  platform: 'browser',
  format: 'esm',
  external: [], // Include ALL dependencies
}
```

### Scenarios

#### 1. Single Button

**What:** Minimal component import
**PV:** `import { Button } from '@proyecto-viviana/solid-spectrum'`
**RS:** `import { Button } from '@adobe/react-spectrum'`
**Why:** Shows "cost to add one button" including runtime overhead

#### 2. Multiple Components

**What:** Realistic multi-component usage
**PV:** Button + Select + DatePicker
**RS:** Button + Picker + DatePicker
**Why:** Shows how bundle size scales with component count (runtime amortization)

#### 3. Full Library

**What:** Import all exports
**PV:** `export * from '@proyecto-viviana/solid-spectrum'`
**RS:** `export * from '@adobe/react-spectrum'`
**Why:** Shows total library footprint (unrealistic but useful for comparison)

## Metrics Explained

- **Raw:** Unminified bundle size (readable code)
- **Minified:** Minified bundle size (whitespace removed, variables renamed)
- **Gzip:** Minified + gzip compressed (standard HTTP compression)
- **Brotli:** Minified + brotli compressed (modern CDN compression)

**Primary metric:** Gzip size (most common in production)

## How to Run

```bash
pnpm run bench:bundle
```

Results are saved to `results/bundle-sizes.json` and printed to console.

## Caveats

### ⚠️ Different Reactivity Models

- **SolidJS** (PV): Fine-grained reactivity compiled at build time → smaller runtime
- **React** (RS): Virtual DOM + reconciliation at runtime → larger runtime

This is NOT a quality comparison. React's model provides different trade-offs:

- React: More flexible, easier to debug, larger bundles
- SolidJS: More performant, smaller bundles, steeper learning curve

### ⚠️ Runtime Amortization

In real apps, the runtime cost is shared across ALL components:

- Adding 1 button: React tax is visible (~40KB runtime)
- Adding 10 components: Runtime cost is amortized (~4KB per component)

### ⚠️ Tree-Shaking Effectiveness

Bundle size depends on:

- How well the library is tree-shakeable
- Whether unused code can be eliminated
- Side effects that prevent dead code elimination

### ⚠️ Bundle Size ≠ Performance

Smaller bundles load faster, but execution speed depends on:

- Runtime efficiency (how fast code executes)
- Reactivity model (how updates propagate)
- Browser optimizations (JIT compilation)

A larger bundle may execute faster than a smaller one.

## Interpreting Results

**Good result:** PV is 30-50% smaller (expected due to SolidJS runtime size)
**Excellent result:** PV is >50% smaller (effective tree-shaking + reactivity)
**Unexpected result:** RS is smaller (indicates PV has bundling issues to fix)

## Version Tracking

Results include library versions to detect regressions:

- Compare results across commits
- Track performance impact of changes
- Document when dependencies update

## Limitations

- Does NOT measure execution speed (see runtime benchmarks)
- Does NOT measure real-world load times (see Web Vitals benchmarks)
- Does NOT include application code (just component library)
- Assumes HTTP/2 compression (modern browsers)
