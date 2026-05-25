import { defineConfig } from "vite-plus";
import macros from "unplugin-parcel-macros";

const ignoredPaths = [
  ".git/**",
  ".vite-hooks/**",
  "node_modules/**",
  "dist/**",
  "coverage/**",
  "playwright-report/**",
  "test-results/**",
  "react-spectrum/**",
  "apps/**/dist/**",
  "packages/**/dist/**",
];

export default defineConfig({
  plugins: [macros.vite()],
  fmt: {
    ignorePatterns: ignoredPaths,
    semi: true,
    singleQuote: false,
    sortPackageJson: true,
  },
  lint: {
    ignorePatterns: ignoredPaths,
    options: {
      typeAware: true,
      typeCheck: false,
    },
    rules: {
      "eslint/no-unassigned-vars": "off",
      "eslint/no-unused-expressions": "off",
      "eslint/no-unused-vars": "off",
      "typescript/await-thenable": "off",
      "typescript/no-base-to-string": "off",
      "typescript/no-duplicate-enum-values": "off",
      "typescript/no-floating-promises": "off",
      "typescript/no-misused-spread": "off",
      "typescript/no-redundant-type-constituents": "off",
      "typescript/require-array-sort-compare": "off",
      "typescript/restrict-template-expressions": "off",
      "typescript/unbound-method": "off",
      "unicorn/no-useless-fallback-in-spread": "off",
    },
  },
  staged: {
    "*.{js,jsx,ts,tsx,mjs,cjs,json,jsonc,css,md,yml,yaml}": "vp check --fix",
  },
});
