import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/main.ts",
      name: "f-box-react",
      formats: ["es", "umd", "cjs"],
      fileName: (format) => {
        if (format === "es") return "index.mjs";
        if (format === "umd") return "index.js";
        if (format === "cjs") return "index.cjs";
        return `index.${format}.js`;
      },
    },
    rollupOptions: {
      external: ["f-box-core", "react", "react-dom"],
    },
  },
  plugins: [
    dts({
      outDir: "dist/types",
      exclude: ["tests/**/*"],
    }),
  ],
});
