export default {
  manifest: {
    name: "Sora Auto Queue Prompts",
    version: "2.1.0",
    description: "Browser extension to automate prompt generation and queueing for Sora AI",
    permissions: ["activeTab", "storage", "scripting", "tabs", "downloads", "webRequest"],
    host_permissions: ["https://*/*"],
    action: {
      default_popup: "popup.html",
    },
  },
};
