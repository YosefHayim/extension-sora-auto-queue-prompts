Write-Host "Fixing sharp installation for Windows..." -ForegroundColor Cyan
Write-Host ""

# Remove existing sharp installation
Write-Host "Removing existing sharp..." -ForegroundColor Yellow
if (Test-Path "node_modules\sharp") {
    Remove-Item -Recurse -Force "node_modules\sharp"
}
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item -Force "pnpm-lock.yaml"
}

# Install dependencies with scripts enabled
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install --ignore-scripts=false

Write-Host ""
Write-Host "Sharp installation complete!" -ForegroundColor Green
Write-Host "You can now run: pnpm run build" -ForegroundColor Green
