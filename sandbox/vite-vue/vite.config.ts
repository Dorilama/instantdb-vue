import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@dorilama/instantdb-vue": path.resolve(__dirname, "../../src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
