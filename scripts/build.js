#!/usr/bin/env node

/**
 * Professional Build Orchestrator
 * Coordinates the build process with structured logging
 */

const { execSync } = require("child_process");
const logger = require("./build-logger");

function executeCommand(command, description, options = {}) {
  logger.step(description);
  try {
    const output = execSync(command, {
      stdio: options.silent ? "pipe" : "inherit",
      encoding: "utf8",
      ...options,
    });
    if (options.silent && output) {
      logger.info("Command output captured");
    }
    return { success: true, output };
  } catch (error) {
    logger.error(`Failed: ${description}`, error.message);
    if (options.silent && error.stdout) {
      console.error(error.stdout);
    }
    throw error;
  }
}

function main() {
  try {
    logger.header("Sora Auto Queue Prompts - Build Process");
    
    logger.info("Starting build", `Target: Chrome MV3`);
    logger.info("Build configuration", "Production mode");

    // Step 1: Clean distribution directory
    logger.stage("Clean");
    executeCommand("pnpm clean:dist", "Removing previous build artifacts");

    // Step 2: Build CSS
    logger.stage("CSS Compilation");
    executeCommand("pnpm build:css", "Compiling Tailwind CSS", { silent: true });

    // Step 3: Plasmo build
    logger.stage("Extension Build");
    logger.info("Building with Plasmo", "Bundling extension files");
    executeCommand("plasmo build", "Building extension bundle", { silent: true });

    // Step 4: Post-build processing
    logger.stage("Post-build");
    executeCommand("pnpm copy:dist", "Processing build artifacts");

    logger.summary({
      "Build target": "chrome-mv3",
      "Build mode": "production",
      "Status": "Success",
    });

  } catch (error) {
    logger.error("Build failed", error.message);
    process.exit(1);
  }
}

main();

