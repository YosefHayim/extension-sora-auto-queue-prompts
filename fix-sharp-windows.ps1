# Fix Sharp Installation on Windows
# This script resolves the sharp module installation issues on Windows by:
# 1. Cleaning up the node_modules and lock files
# 2. Reinstalling dependencies with proper sharp version
# 3. Rebuilding sharp for the current platform

Write-Host "Fixing sharp installation for Windows..." -ForegroundColor Cyan

# Step 1: Clean up existing installations
Write-Host "`nStep 1: Cleaning up existing installation..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path "pnpm-lock.yaml") {
    Write-Host "Removing pnpm-lock.yaml..." -ForegroundColor Gray
    Remove-Item -Force pnpm-lock.yaml
}

# Step 2: Clear pnpm cache for sharp
Write-Host "`nStep 2: Clearing pnpm cache for sharp..." -ForegroundColor Yellow
pnpm store prune

# Step 3: Install dependencies
Write-Host "`nStep 3: Installing dependencies..." -ForegroundColor Yellow
pnpm install --no-frozen-lockfile

# Step 4: Rebuild sharp for Windows
Write-Host "`nStep 4: Rebuilding sharp for Windows x64..." -ForegroundColor Yellow
pnpm rebuild sharp

# Step 5: Verify sharp installation
Write-Host "`nStep 5: Verifying sharp installation..." -ForegroundColor Yellow
$sharpTest = pnpm exec node -e "try { require('sharp'); console.log('Sharp is working correctly'); process.exit(0); } catch(e) { console.error('Sharp failed:', e.message); process.exit(1); }"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSharp installation complete and verified!" -ForegroundColor Green
    Write-Host "`nYou can now run: pnpm run build" -ForegroundColor Cyan
} else {
    Write-Host "`nSharp verification failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}
