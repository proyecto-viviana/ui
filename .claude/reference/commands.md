# Commands Reference

## Development

```bash
vp install             # Install all dependencies
vp run dev             # Start dev server (localhost:3000)
```

## Testing

```bash
vp run test:run        # Run tests
vp run test:watch      # Watch mode
vp run typecheck       # TypeScript validation
vp run pr:check:fast   # Mirror blocking non-Playwright PR checks
vp run pr:check        # Mirror full blocking PR checks
vp run ci:a11y         # Blocking AA + smoke accessibility gate, excluding color-contrast
vp run a11y:full       # Stricter manual accessibility audit, including contrast

# Run specific file
vp exec vitest run packages/solidaria/test/createButton.test.tsx

# Run with coverage
vp exec vitest run --coverage
```

## Building

```bash
# Build all packages (in dependency order)
vp run build

# Build individual packages
vp run build:stately
vp run build:solidaria
vp run build:components
vp run build:solid-spectrum
vp run build:viviana-ui

# Build web app
vp run build:web
```

## Package-Specific

```bash
# In any package directory
vp run build            # Build package
```

## Deployment

```bash
cd apps/web
vp run deploy           # Deploy to Cloudflare Workers
```

## Troubleshooting

```bash
# Clear node_modules and reinstall
rm -rf node_modules packages/*/node_modules apps/*/node_modules
vp install

# Clear build artifacts
rm -rf packages/*/dist apps/*/dist
```
