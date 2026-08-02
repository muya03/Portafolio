import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// PORT / BASE_PATH are injected by Replit. Outside Replit (macOS, Windows, a
// plain Linux checkout) they are not set, so we fall back to sane defaults and
// only validate the value when one is actually provided.
//
// 5173 is Vite's own default: on macOS port 5000 is taken by the AirPlay
// Receiver, so it must not be used as the fallback here.
const DEFAULT_PORT = 5173;

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : DEFAULT_PORT;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// "/" serves the site from the domain root. Override with BASE_PATH when
// deploying to a subfolder (e.g. BASE_PATH=/portfolio/).
const basePath = process.env.BASE_PATH || "/";

// Replit needs the dev server bound to 0.0.0.0 to be reachable. Locally you can
// set HOST=localhost to avoid the macOS firewall prompt and stay off the LAN.
const host = process.env.HOST || "0.0.0.0";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    // Replit must keep the assigned port; locally we let Vite pick the next
    // free one instead of failing outright when the port is busy.
    strictPort: process.env.PORT !== undefined,
    host,
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host,
    allowedHosts: true,
  },
});
