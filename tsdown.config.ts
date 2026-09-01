import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  dts: true,
  deps: {
    neverBundle: ["vite"],
  },
  // Stale artifacts from older output layouts (e.g. dist/index.js) must not
  // linger, since package.json exports point at the current layout
  clean: true,
  target: false,
});
