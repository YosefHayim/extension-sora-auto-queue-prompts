#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const logger = require("./build-logger");

const sourceDir = path.join(__dirname, "..", "build", "chrome-mv3-prod");
const destDir = path.join(__dirname, "..", "dist");

function copyRecursiveSync(src, dest, logger) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), logger);
    });
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function countFiles(dir) {
  let count = 0;
  const items = fs.readdirSync(dir);
  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      count += countFiles(fullPath);
    } else {
      count++;
    }
  });
  return count;
}

function getDirectorySize(dir) {
  let size = 0;
  const items = fs.readdirSync(dir);
  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      size += getDirectorySize(fullPath);
    } else {
      size += stat.size;
    }
  });
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

logger.stage("Post-build Processing");

if (!fs.existsSync(sourceDir)) {
  logger.error("Source directory not found", sourceDir);
  process.exit(1);
}

logger.step("Cleaning destination directory");
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
  logger.success("Destination directory cleaned");
} else {
  logger.info("Destination directory does not exist, will be created");
}

logger.step("Copying build artifacts");
const copyStartTime = Date.now();
copyRecursiveSync(sourceDir, destDir, logger);
const copyTime = Date.now() - copyStartTime;

const fileCount = countFiles(destDir);
const totalSize = getDirectorySize(destDir);
logger.success(
  `Copied ${fileCount} files`,
  `Total size: ${formatBytes(totalSize)} (${copyTime}ms)`
);

logger.step("Validating and updating manifest.json");
const manifestPath = path.join(destDir, "manifest.json");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  let updated = false;

  // Add permissions if missing
  if (!manifest.permissions) {
    manifest.permissions = ["activeTab", "storage", "scripting", "tabs", "downloads", "webRequest"];
    updated = true;
  }

  // Add host_permissions if missing
  if (!manifest.host_permissions) {
    manifest.host_permissions = ["https://*/*"];
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    logger.success("Manifest.json updated", "Added required permissions");
  } else {
    logger.info("Manifest.json validated", "All permissions present");
  }
} else {
  logger.warning("Manifest.json not found", "Skipping manifest validation");
}

  logger.success(
    `Post-build processing completed`,
    `${fileCount} files (${formatBytes(totalSize)}) copied to ${destDir}`
  );
