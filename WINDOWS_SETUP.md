# Windows Build Fix for Sharp Module

This document explains how to fix the Sharp module installation issue on Windows.

## Problem

The `sharp` module requires native binaries for Windows. When pnpm's security settings block build scripts, these binaries don't get installed, causing build failures.

## Solution Options

### Option 1: Run the Fix Script (Recommended)

We've provided automated scripts to fix the issue:

**Using PowerShell (Recommended):**
```powershell
.\fix-sharp-windows.ps1
```

**Using Command Prompt:**
```cmd
fix-sharp-windows.bat
```

### Option 2: Manual Steps

If the scripts don't work, follow these manual steps:

1. **Delete existing sharp installation:**
   ```cmd
   rmdir /s /q node_modules\sharp
   del pnpm-lock.yaml
   ```

2. **Install with scripts enabled:**
   ```cmd
   pnpm install --ignore-scripts=false
   ```

3. **Build the project:**
   ```cmd
   pnpm run build
   ```

### Option 3: Use npm instead of pnpm

If pnpm continues to have issues, you can use npm:

1. **Remove pnpm files:**
   ```cmd
   del pnpm-lock.yaml
   rmdir /s /q node_modules
   ```

2. **Install with npm:**
   ```cmd
   npm install
   ```

3. **Build with npm:**
   ```cmd
   npm run build
   ```

## Configuration Files

The repository includes:

- `.npmrc` - Configuration for sharp binary downloads
- `package.json` - Updated with correct dependency versions

## Verification

After running the fix, verify the installation:

```cmd
node -e "console.log(require('sharp'))"
```

This should output sharp version information without errors.

## Common Issues

### "Cannot find module 'sharp-win32-x64.node'"
- Run the fix script or manual steps above
- Ensure you're using the `--ignore-scripts=false` flag

### "Permission denied" errors
- Run PowerShell or Command Prompt as Administrator
- Check your antivirus isn't blocking the installation

### Still having issues?
1. Clear all caches: `pnpm store prune`
2. Try using npm instead of pnpm
3. Check Node.js version (v18+ recommended)

## Technical Details

The issue occurs because:
1. Sharp is a native module that needs platform-specific binaries
2. pnpm blocks build scripts by default for security
3. Without the build script, sharp's Windows binary isn't downloaded
4. The `.npmrc` file configures the binary download URLs
5. The `--ignore-scripts=false` flag allows the necessary scripts to run
