import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import { presetUno } from "unocss";
import { presetDaisy } from "unocss-preset-daisy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS({
      presets: [presetUno(), presetDaisy()],
    }),
  ],
  resolve: {
    alias: {
      "@dorilama/instantdb-vue": path.resolve(__dirname, "../../src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
