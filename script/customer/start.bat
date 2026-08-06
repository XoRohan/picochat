@echo off

setlocal
set "WWW_ROOT=customer-website"
set "LISTEN_HOST=127.0.0.1"
set "LISTEN_PORT=8010"

where pnpm >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Customer Server not started
    echo.
    echo pnpm is required.
    echo.
    echo 1. Install the Node LTS from https://nodejs.org/
    echo 2. Run: corepack enable pnpm
    echo 3. Re-run this script.
    echo =======================
    exit /b 1
)

cd /d "%WWW_ROOT%" || exit /b 1
echo Serving Customer Website on http://%LISTEN_HOST%:%LISTEN_PORT% (^C to stop^).
pnpm install || exit /b 1
pnpm dev
