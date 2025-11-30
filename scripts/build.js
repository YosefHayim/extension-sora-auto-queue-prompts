#!/usr/bin/env node

/**
 * Build script for Sora Auto Queue Prompts extension
 */

const { execSync } = require("child_process");

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

// Build CSS first, then build extension
run("pnpm build:css", "Compiling Tailwind CSS");
run("plasmo build", "Building extension");
