import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  external: ["vite"],
  sourcemap: true,
  dts: true,
});
