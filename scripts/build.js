#!/usr/bin/env node

/**
 * Build script for Sora Auto Queue Prompts extension
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Ensure icons are synced from icons/ to assets/ (Plasmo prefers assets/)
function syncIcons() {
  const iconSizes = [16, 48, 128];
  const iconsDir = path.join(__dirname, "..", "icons");
  const assetsDir = path.join(__dirname, "..", "assets");

  iconSizes.forEach((size) => {
    const src = path.join(iconsDir, `icon${size}.png`);
    const dest = path.join(assetsDir, `icon${size}.png`);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✓ Synced icon${size}.png to assets/`);
    }
  });
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
