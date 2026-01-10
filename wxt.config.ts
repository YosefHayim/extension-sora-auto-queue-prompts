import { defineConfig } from "wxt";
import { fileURLToPath } from "url";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://wxt.dev/api/config.html
export default defineConfig({
  // Use official WXT React module for better React integration
  modules: ["@wxt-dev/module-react"],

  // Add Vite plugins and resolve aliases for path resolution
  // Note: Entrypoints use relative paths (../src/) due to WXT's entrypoint loading phase
  // The @/ alias works for imports within src/ directory during bundling
  vite: () => ({
    plugins: [tsconfigPaths()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "~": path.resolve(__dirname, "./src"),
      },
    },
  }),
  manifest: {
    name: "Sora Auto Queue Prompts",
    version: "2.3.0",
    description: "Browser extension to automate prompt generation and queueing for Sora AI",
    permissions: ["activeTab", "storage", "scripting", "tabs", "downloads", "webRequest", "notifications"],
    host_permissions: ["*://sora.com/*", "*://sora.chatgpt.com/*", "https://browser-intake-datadoghq.com/*"],
    action: {
      default_popup: "popup.html",
      default_icon: {
        "16": "icon16.png",
        "48": "icon48.png",
        "128": "icon128.png",
      },
    },
    icons: {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png",
    },
    // Content scripts are now defined in entrypoints/content.ts using defineContentScript
    // No need to define them here when using defineContentScript API
  },
  // WXT automatically detects icons from public/ directory
  // Icons should be named: icon16.png, icon48.png, icon128.png

  // Configure auto-imports - disable WXT's storage since we have our own
  imports: {
    addons: {
      vueTemplate: false,
    },
    // Exclude WXT's storage to avoid conflict with our custom storage utility
    imports: [{ name: "storage", from: "wxt/storage", disabled: true }],
  },

  // Optional: Build hooks for customization
  hooks: {
    "build:manifestGenerated": (wxt, manifest) => {
      // Add any custom manifest modifications here if needed
      // For example, add development mode indicators
      if (wxt.config.mode === "development") {
        // Optional: Add dev indicator to name
        // manifest.name += " (DEV)";
      }
    },
  },
});
