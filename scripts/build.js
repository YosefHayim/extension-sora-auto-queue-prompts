#!/usr/bin/env node

/**
 * Build script for Sora Auto Queue Prompts extension
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Ensure icons are synced from icons/ to assets/ (Plasmo prefers assets/)
// Plasmo needs icon.png as the source, plus individual sizes
function syncIcons() {
  const iconSizes = [16, 48, 128];
  const iconsDir = path.join(__dirname, "..", "icons");
  const assetsDir = path.join(__dirname, "..", "assets");

  // Sync individual size icons
  iconSizes.forEach((size) => {
    const src = path.join(iconsDir, `icon${size}.png`);
    const dest = path.join(assetsDir, `icon${size}.png`);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✓ Synced icon${size}.png to assets/`);
    }
  });

  // Create icon.png from the largest icon (Plasmo uses this as source)
  const icon128Path = path.join(assetsDir, "icon128.png");
  const iconPath = path.join(assetsDir, "icon.png");
  if (fs.existsSync(icon128Path) && !fs.existsSync(iconPath)) {
    fs.copyFileSync(icon128Path, iconPath);
    console.log(`✓ Created icon.png from icon128.png`);
  }
}

function run(command, description) {
  console.log(`\n▶ ${description}...`);
  try {
    execSync(command, { stdio: "inherit" });
    console.log(`✓ ${description} completed\n`);
  } catch (error) {
    console.error(`\n✗ ${description} failed\n`);
    process.exit(1);
  }
}

// Sync icons from icons/ to assets/ before building
console.log("Syncing icons...");
syncIcons();

// Build CSS first, then build extension
run("pnpm build:css", "Compiling Tailwind CSS");
run("plasmo build", "Building extension");

// Fix manifest: Add missing permissions that Plasmo doesn't include
function fixManifest() {
  console.log("\n▶ Fixing manifest permissions...");
  const manifestPath = path.join(__dirname, "..", "build", "chrome-mv3-prod", "manifest.json");
  
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      
      // Add permissions if missing
      if (!manifest.permissions) {
        manifest.permissions = [
          "activeTab",
          "storage",
          "scripting",
          "tabs",
          "downloads",
          "webRequest"
        ];
      }
      
      // Add host_permissions if missing
      if (!manifest.host_permissions) {
        manifest.host_permissions = ["https://*/*"];
      }
      
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log("✓ Manifest permissions added\n");
    } catch (error) {
      console.error(`\n✗ Failed to fix manifest: ${error.message}\n`);
      process.exit(1);
    }
  } else {
    console.warn("⚠ Manifest not found, skipping fix");
  }
}

fixManifest();
