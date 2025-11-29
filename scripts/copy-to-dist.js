#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "..", "build", "chrome-mv3-prod");
const destDir = path.join(__dirname, "..", "dist");

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(sourceDir)) {
  console.error(`Error: Source directory ${sourceDir} does not exist`);
  process.exit(1);
}

// Clean destination directory
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

// Copy files
copyRecursiveSync(sourceDir, destDir);

// Fix manifest.json to include permissions
const manifestPath = path.join(destDir, "manifest.json");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // Add permissions if missing
  if (!manifest.permissions) {
    manifest.permissions = ["activeTab", "storage", "scripting", "tabs", "downloads", "webRequest"];
  }

  // Add host_permissions if missing
  if (!manifest.host_permissions) {
    manifest.host_permissions = ["https://*/*"];
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Fixed manifest.json with permissions`);
}

console.log(`✅ Successfully copied build to ${destDir}`);
