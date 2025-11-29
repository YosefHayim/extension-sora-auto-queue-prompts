#!/usr/bin/env node

/**
 * Professional Build Logger
 * Provides structured, colorized logging for build processes
 */

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Text colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

class BuildLogger {
  constructor() {
    this.startTime = Date.now();
    this.currentStage = null;
  }

  formatTime(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString().replace("T", " ").substring(0, 19);
  }

  header(message) {
    console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  ${message}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  }

  stage(name) {
    this.currentStage = name;
    const elapsed = this.formatTime(Date.now() - this.startTime);
    console.log(
      `${colors.bright}${colors.blue}[${this.getTimestamp()}]${colors.reset} ${colors.bright}${colors.cyan}▶${colors.reset} ${colors.bright}${name}${colors.reset} ${colors.dim}(${elapsed})${colors.reset}`
    );
  }

  success(message, details = null) {
    const elapsed = this.formatTime(Date.now() - this.startTime);
    const prefix = `${colors.bright}${colors.blue}[${this.getTimestamp()}]${colors.reset} ${colors.bright}${colors.green}✓${colors.reset}`;
    console.log(`${prefix} ${colors.green}${message}${colors.reset} ${colors.dim}(${elapsed})${colors.reset}`);
    if (details) {
      console.log(`${colors.dim}  → ${details}${colors.reset}`);
    }
  }

  info(message, details = null) {
    const elapsed = this.formatTime(Date.now() - this.startTime);
    const prefix = `${colors.bright}${colors.blue}[${this.getTimestamp()}]${colors.reset} ${colors.bright}${colors.blue}ℹ${colors.reset}`;
    console.log(`${prefix} ${colors.white}${message}${colors.reset} ${colors.dim}(${elapsed})${colors.reset}`);
    if (details) {
      console.log(`${colors.dim}  → ${details}${colors.reset}`);
    }
  }

  warning(message, details = null) {
    const elapsed = this.formatTime(Date.now() - this.startTime);
    const prefix = `${colors.bright}${colors.blue}[${this.getTimestamp()}]${colors.reset} ${colors.bright}${colors.yellow}⚠${colors.reset}`;
    console.log(`${prefix} ${colors.yellow}${message}${colors.reset} ${colors.dim}(${elapsed})${colors.reset}`);
    if (details) {
      console.log(`${colors.dim}  → ${details}${colors.reset}`);
    }
  }

  error(message, details = null) {
    const elapsed = this.formatTime(Date.now() - this.startTime);
    const prefix = `${colors.bright}${colors.blue}[${this.getTimestamp()}]${colors.reset} ${colors.bright}${colors.red}✗${colors.reset}`;
    console.error(`${prefix} ${colors.red}${message}${colors.reset} ${colors.dim}(${elapsed})${colors.reset}`);
    if (details) {
      console.error(`${colors.dim}  → ${details}${colors.reset}`);
    }
  }

  step(message) {
    const elapsed = this.formatTime(Date.now() - this.startTime);
    console.log(`${colors.dim}  ${colors.cyan}•${colors.reset} ${colors.dim}${message}${colors.reset} ${colors.dim}(${elapsed})${colors.reset}`);
  }

  summary(stats) {
    const totalTime = this.formatTime(Date.now() - this.startTime);
    console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    if (stats) {
      Object.entries(stats).forEach(([key, value]) => {
        // Capitalize first letter of status value and add green checkmark before the value
        if (key === "Status") {
          const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
          console.log(`${colors.dim}  ${key}:${colors.reset} ${colors.bright}${colors.green}✓${colors.reset} ${colors.bright}${capitalizedValue}${colors.reset}`);
        } else {
          console.log(`${colors.dim}  ${key}:${colors.reset} ${colors.bright}${value}${colors.reset}`);
        }
      });
    }
    console.log(`${colors.dim}  Total time: ${totalTime}${colors.reset}\n`);
  }

  footer(message) {
    console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  }
}

module.exports = new BuildLogger();
