#!/usr/bin/env node

/**
 * Script to replace @/ path aliases with relative imports
 * This is needed because vite-node (used by WXT) doesn't support path aliases
 */

const fs = require('fs');
const path = require('path');

function getRelativePath(fromFile, toPath) {
  // Remove @/ prefix
  const targetPath = toPath.replace(/^@\//, '');
  
  // Get directory of source file
  const fromDir = path.dirname(fromFile);
  
  // Calculate relative path from source directory to target
  const targetFile = path.join('src', targetPath);
  const relative = path.relative(fromDir, targetFile);
  
  // Ensure it starts with ./
  return relative.startsWith('.') ? relative : `./${relative}`;
}

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  
  const newLines = lines.map(line => {
    // Match import statements with @/ paths
    const importMatch = line.match(/^(\s*import\s+.*?\s+from\s+['"])(@\/[^'"]+)(['"])/);
    if (importMatch) {
      const prefix = importMatch[1];
      const aliasPath = importMatch[2];
      const suffix = importMatch[3];
      const relativePath = getRelativePath(filePath, aliasPath);
      modified = true;
      return `${prefix}${relativePath}${suffix}`;
    }
    
    // Match export ... from statements
    const exportMatch = line.match(/^(\s*export\s+.*?\s+from\s+['"])(@\/[^'"]+)(['"])/);
    if (exportMatch) {
      const prefix = exportMatch[1];
      const aliasPath = exportMatch[2];
      const suffix = exportMatch[3];
      const relativePath = getRelativePath(filePath, aliasPath);
      modified = true;
      return `${prefix}${relativePath}${suffix}`;
    }
    
    return line;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
    return true;
  }
  
  return false;
}

function findAndFixFiles(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += findAndFixFiles(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (fixImportsInFile(filePath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

// Start from src directory
const srcDir = path.join(__dirname, '..', 'src');
console.log('Fixing @/ imports in src directory...');
const fixed = findAndFixFiles(srcDir);
console.log(`\nFixed ${fixed} files.`);

