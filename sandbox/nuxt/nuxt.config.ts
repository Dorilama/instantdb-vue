import path from "node:path";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  runtimeConfig: { public: { instantAppId: process.env["INSTANT_APP_ID"] } },
  alias: {
    "@dorilama/instantdb-vue": path.resolve(__dirname, "../../src"),
  },
});
