import { defineConfig } from "wxt";
import { fileURLToPath } from "url";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://wxt.dev/api/config.html
export default defineConfig({
  // Add Vite plugins and resolve aliases for path resolution
  vite: () => ({
    plugins: [tsconfigPaths()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
  manifest: {
    name: "Sora Auto Queue Prompts",
    version: "2.2.0",
    description: "Browser extension to automate prompt generation and queueing for Sora AI",
    permissions: ["activeTab", "storage", "scripting", "tabs", "downloads", "webRequest"],
    host_permissions: ["https://*/*"],
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

  // Optional: Configure auto-imports for better developer experience
  // This allows importing from src/components, src/utils, etc. without full paths
  imports: {
    // Auto-import from common directories
    dirs: ["src/components", "src/utils", "src/lib"],
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
