import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/"],
  clean: true,
  dts: true,
  format: ["esm", "cjs"],
  outDir: "dist",
});
