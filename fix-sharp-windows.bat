@echo off
echo Fixing sharp installation for Windows...
echo.

REM Remove existing sharp installation
echo Removing existing sharp...
rmdir /s /q node_modules\sharp 2>nul
del pnpm-lock.yaml 2>nul

REM Install dependencies with scripts enabled
echo Installing dependencies...
pnpm install --ignore-scripts=false

echo.
echo Sharp installation complete!
echo You can now run: pnpm run build
pause
