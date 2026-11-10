import { defineConfig } from "astro/config";

// A standalone, statically built experiment. No server adapter is needed.
export default defineConfig({
  output: "static"
});
