import { defineConfig } from "wxt";

// https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Sora Auto Queue Prompts",
    version: "2.1.0",
    description: "Browser extension to automate prompt generation and queueing for Sora AI",
    permissions: ["activeTab", "storage", "scripting", "tabs", "downloads", "webRequest"],
    host_permissions: ["https://*/*"],
    action: {
      default_popup: "popup.html",
    },
    content_scripts: [
      {
        matches: ["*://sora.chatgpt.com/*", "*://sora.com/*"],
        js: ["content.js"],
        run_at: "document_end",
      },
    ],
  },
  // WXT automatically detects icons from public/ directory
  // Icons should be named: icon16.png, icon48.png, icon128.png
});
