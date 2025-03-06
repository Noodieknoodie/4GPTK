@echo off
setlocal enabledelayedexpansion

:: Configuration
set BACKEND_DIR=%~dp0backend
set FRONTEND_DIR=%~dp0frontend
set DATA_DIR=%~dp0data
set DB_FILE=%DATA_DIR%\401k_payments.db
set BACKUP_DIR=%DATA_DIR%\backups
set LAUNCH_SCRIPT=%~f0
set SHORTCUT_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\401k App.lnk
set ICON_PATH=%~dp0app-icon.ico  :: Replace with actual icon path

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with admin privileges
) else (
    echo Requesting admin privileges...
    powershell Start-Process -FilePath "%0" -Verb RunAs
    exit /b
)

:: Function to install Node.js v20
:InstallNode
echo Checking Node.js installation...
node --version 2>nul | find "v20." >nul
if %errorLevel% neq 0 (
    echo Installing Node.js v20...
    powershell -Command "(New-Object Net.WebClient).DownloadFile('https://nodejs.org/dist/v20.9.0/node-v20.9.0-x64.msi', 'node-installer.msi')"
    msiexec /i node-installer.msi /quiet ADDLOCAL=ALL
    del node-installer.msi
    set PATH=%PATH%;C:\Program Files\nodejs
    node --version | find "v20." >nul
    if %errorLevel% neq 0 (
        echo Failed to install Node.js v20
        exit /b 1
    )
)
exit /b 0

:: Function to install Rust
:InstallRust
echo Checking Rust installation...
rustc --version 2>nul
if %errorLevel% neq 0 (
    echo Installing Rust...
    powershell -Command "(New-Object Net.WebClient).DownloadFile('https://win.rustup.rs/x86_64', 'rustup-init.exe')"
    start /wait rustup-init.exe -y
    del rustup-init.exe
    set PATH=%PATH%;%USERPROFILE%\.cargo\bin
    rustc --version
    if %errorLevel% neq 0 (
        echo Failed to install Rust
        exit /b 1
    )
)
exit /b 0

:: Install Python dependencies
echo Installing Python dependencies...
cd "%BACKEND_DIR%"
pip install -r requirements.txt
if %errorLevel% neq 0 (
    echo Failed to install Python dependencies
    exit /b 1
)

:: Install frontend dependencies
echo Installing frontend dependencies...
cd "%FRONTEND_DIR%"
set MAX_RETRIES=3
set RETRY_COUNT=1

:RetryNpmInstall
echo Attempting npm install (Attempt !RETRY_COUNT!/!MAX_RETRIES!)
npm install --loglevel=error --no-audit --no-fund
if %errorLevel% neq 0 (
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! leq !MAX_RETRIES! (
        echo npm install failed, retrying...
        timeout /t 5 /nobreak >nul
        goto RetryNpmInstall
    )
    echo Failed to install npm packages after !MAX_RETRIES! attempts
    exit /b 1
)

:: Clean up potential lock files
del package-lock.json 2>nul
del yarn.lock 2>nul

:: Verify node_modules existence
if not exist "node_modules" (
    echo node_modules missing after installation
    exit /b 1
)

:: Create database backup
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if exist "%DB_FILE%" (
    set "timestamp=%date:/=-%_%time::=-%"
    set "timestamp=!timestamp: =0!"
    xcopy "%DB_FILE%" "%BACKUP_DIR%\401k_payments_!timestamp!.db.bak" /Y
)

:: Create
