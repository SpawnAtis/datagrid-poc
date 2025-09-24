import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5174,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port: 5174,
    host: true,
    allowedHosts: true,
  },
});
