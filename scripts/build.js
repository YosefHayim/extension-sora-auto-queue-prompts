#!/usr/bin/env node

/**
 * Build script for Sora Auto Queue Prompts extension
 * Updated for WXT framework
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Ensure icons are synced from icons/ to public/ (WXT uses public/ directory)
function syncIcons() {
  const iconSizes = [16, 48, 128];
  const iconsDir = path.join(__dirname, "..", "icons");
  const publicDir = path.join(__dirname, "..", "public");

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Sync individual size icons to public/
  iconSizes.forEach((size) => {
    const src = path.join(iconsDir, `icon${size}.png`);
    const dest = path.join(publicDir, `icon${size}.png`);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✓ Synced icon${size}.png to public/`);
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

// Sync icons from icons/ to public/ before building
console.log("Syncing icons...");
syncIcons();

// Build extension using WXT
run("pnpm build", "Building extension with WXT");
