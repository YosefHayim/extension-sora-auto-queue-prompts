# Windows Setup Guide

## Sharp Module Installation Issue

### Problem

On Windows, the `sharp` module may fail to build correctly due to version conflicts in the dependency tree. The `plasmo` package depends on an older version of sharp (0.32.6), which conflicts with the required version (0.34.5) for proper Windows support.

**Error Symptoms:**
```
Error: Something went wrong installing the "sharp" module
Cannot find module '../build/Release/sharp-win32-x64.node'
```

### Solution

We've implemented two fixes:

#### 1. Package.json Configuration

The `package.json` now includes:
- Sharp as a direct dependency (`"sharp": "^0.34.5"`)
- pnpm overrides to force all packages to use the same sharp version

```json
{
  "dependencies": {
    "sharp": "^0.34.5"
  },
  "pnpm": {
    "overrides": {
      "sharp": "^0.34.5"
    }
  }
}
```

#### 2. Automated Fix Script

Run the `fix-sharp-windows.ps1` PowerShell script:

```powershell
.\fix-sharp-windows.ps1
```

This script will:
1. Clean up existing node_modules and lock files
2. Clear pnpm cache for sharp
3. Reinstall all dependencies with the correct sharp version
4. Rebuild sharp for Windows x64 platform
5. Verify the installation

### Manual Fix (if needed)

If the automated script doesn't work, try these steps:

1. **Clean installation:**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force pnpm-lock.yaml
   pnpm install
   ```

2. **Rebuild sharp:**
   ```powershell
   pnpm rebuild sharp
   ```

3. **Verify installation:**
   ```powershell
   pnpm exec node -e "require('sharp'); console.log('Sharp is working')"
   ```

### Alternative: Using npm Instead of pnpm

If pnpm continues to cause issues, you can use npm:

1. Remove pnpm files:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force pnpm-lock.yaml
   ```

2. Install with npm:
   ```bash
   npm install
   ```

3. Build:
   ```bash
   npm run build
   ```

### Why This Happens

The issue occurs because:
1. Plasmo has a dependency on sharp@0.32.6
2. Sharp@0.32.6 doesn't have proper Windows x64 prebuilt binaries
3. pnpm's strict dependency management keeps both versions
4. The build process picks up the older, incompatible version

The fix forces all packages to use sharp@0.34.5, which has proper Windows support.

### Verification

After running the fix, you should see:
```
Sharp installation complete and verified!
You can now run: pnpm run build
```

Then you can successfully run:
```powershell
pnpm run build
```

## Troubleshooting

### Issue: "Access Denied" when removing node_modules

Run PowerShell as Administrator or use:
```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
```

### Issue: pnpm command not found

Install pnpm first:
```powershell
npm install -g pnpm
```

### Issue: Still getting sharp errors after fix

Try clearing all caches:
```powershell
pnpm store prune
Remove-Item -Recurse -Force $env:LOCALAPPDATA\pnpm-cache
Remove-Item -Recurse -Force node_modules
pnpm install
```

## Additional Resources

- [Sharp Installation Documentation](https://sharp.pixelplumbing.com/install)
- [pnpm Overrides Documentation](https://pnpm.io/package_json#pnpmoverrides)
- [Plasmo Framework Documentation](https://docs.plasmo.com/)
