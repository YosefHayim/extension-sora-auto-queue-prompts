#!/usr/bin/env node

/**
 * Package Extension for Chrome Web Store
 *
 * This script builds and packages the extension as a ZIP file
 * ready for upload to the Chrome Web Store Developer Dashboard.
 *
 * Usage: node scripts/package-extension.js
 * Or: pnpm zip:chrome
 */

import archiver from "archiver";
import { createWriteStream } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Read package.json for version info
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));
const { name, version } = packageJson;

// Output directories
const outputDir = path.join(rootDir, ".output");
const chromeDir = path.join(outputDir, "chrome-mv3");
const distDir = path.join(rootDir, "dist");

// Zip file name with version
const zipFileName = `${name}-v${version}-chrome.zip`;
const zipFilePath = path.join(distDir, zipFileName);

/**
 * Execute a command and log output
 * @param {string} command - Command to execute
 * @param {string} description - Description of the command
 */
function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { cwd: rootDir, stdio: "inherit" });
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    process.exit(1);
  }
}

/**
 * Create a ZIP archive of the built extension
 * @returns {Promise<void>}
 */
async function createZip() {
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Remove existing zip if present
  if (fs.existsSync(zipFilePath)) {
    fs.unlinkSync(zipFilePath);
  }

  console.log(`\n📦 Creating ZIP archive: ${zipFileName}...`);

  const output = createWriteStream(zipFilePath);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Maximum compression
  });

  // Track archive size
  let totalSize = 0;

  archive.on("entry", (entry) => {
    totalSize += entry.stats?.size ?? 0;
  });

  archive.on("warning", (err) => {
    if (err.code === "ENOENT") {
      console.warn("⚠️  Warning:", err.message);
    } else {
      throw err;
    }
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  // Add the entire chrome-mv3 directory contents to the zip
  archive.directory(chromeDir, false);

  await archive.finalize();

  // Wait for the output stream to finish
  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
  });

  const stats = fs.statSync(zipFilePath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log(`✅ ZIP created successfully!`);
  console.log(`   📁 File: ${zipFilePath}`);
  console.log(`   📊 Size: ${sizeMB} MB`);
}

/**
 * Validate the build output
 */
function validateBuild() {
  console.log("\n🔍 Validating build output...");

  const requiredFiles = ["manifest.json", "popup.html"];

  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(chromeDir, file)));

  if (missingFiles.length > 0) {
    console.error(`❌ Missing required files: ${missingFiles.join(", ")}`);
    process.exit(1);
  }

  // Check manifest.json is valid
  const manifestPath = path.join(chromeDir, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  if (!manifest.manifest_version || manifest.manifest_version !== 3) {
    console.error("❌ Invalid manifest_version. Must be 3 for Chrome Web Store.");
    process.exit(1);
  }

  if (!manifest.name || !manifest.version) {
    console.error("❌ Missing required manifest fields: name, version");
    process.exit(1);
  }

  console.log(`✅ Build validation passed`);
  console.log(`   📋 Extension: ${manifest.name}`);
  console.log(`   📋 Version: ${manifest.version}`);
  console.log(`   📋 Manifest Version: ${manifest.manifest_version}`);
}

/**
 * Main function
 */
async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  🚀 Packaging Extension for Chrome Web Store");
  console.log(`  📦 ${name} v${version}`);
  console.log("═══════════════════════════════════════════════════════════");

  // Step 1: Clean previous builds
  runCommand("pnpm clean", "Cleaning previous builds");

  // Step 2: Build for production
  runCommand("pnpm build:prod", "Building extension for production");

  // Step 3: Validate build
  validateBuild();

  // Step 4: Create ZIP
  await createZip();

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  ✅ Packaging complete!");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("\n📤 Next steps:");
  console.log("   1. Go to: https://chrome.google.com/webstore/devconsole");
  console.log("   2. Click 'New Item' or select your existing extension");
  console.log(`   3. Upload: ${zipFilePath}`);
  console.log("   4. Fill in store listing details");
  console.log("   5. Submit for review");
  console.log("");
}

main().catch((error) => {
  console.error("❌ Packaging failed:", error.message);
  process.exit(1);
});
