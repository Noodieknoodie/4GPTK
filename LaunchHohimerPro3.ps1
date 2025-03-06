# HohimerPro Basic Launcher Script
# Simple script to backup database and launch the application

# ====== CONFIGURATION ======
# App will determine its own location
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppRoot = $ScriptPath

# App structure - using exact paths from your environment
$BackendDir = Join-Path $AppRoot "backend"
$FrontendDir = Join-Path $AppRoot "frontend"
$DataDir = Join-Path $BackendDir "data"
$BackupsDir = Join-Path $DataDir "backup_dbs"
$DBPath = Join-Path $DataDir "401k_payments.db"
$VenvDir = Join-Path $BackendDir "venv"

# Port configuration - as specified in your batch files
$BackendPort = 8000
$FrontendPort = 6069

# ====== BACKUP DATABASE ======
# Simple database backup function
function Backup-Database {
    # Create backups directory if it doesn't exist
    if (-not (Test-Path $BackupsDir)) {
        New-Item -ItemType Directory -Path $BackupsDir -Force | Out-Null
        Write-Host "Created backups directory."
    }
    
    # Check if database exists
    if (-not (Test-Path $DBPath)) {
        Write-Host "Database file not found at: $DBPath"
        return # Not a fatal error
    }
    
    # Create backup with timestamp
    try {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupPath = Join-Path $BackupsDir "401k_payments_backup_$timestamp.db"
        
        Copy-Item -Path $DBPath -Destination $backupPath -Force
        Write-Host "Database backed up to: $backupPath"
        
        # Keep only the last 30 backups
        $allBackups = Get-ChildItem -Path $BackupsDir -Filter "401k_payments_backup_*.db" | Sort-Object LastWriteTime -Descending
        
        if ($allBackups.Count -gt 30) {
            $backupsToDelete = $allBackups | Select-Object -Skip 30
            foreach ($backup in $backupsToDelete) {
                Remove-Item -Path $backup.FullName -Force
                Write-Host "Removed old backup: $($backup.Name)"
            }
        }
    }
    catch {
        Write-Host "Warning: Failed to backup database: $_"
    }
}

# ====== MAIN EXECUTION ======
Write-Host "=== HohimerPro Launcher ==="

# Backup the database
Backup-Database

# Launch backend
Write-Host "Starting backend..."
$backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $BackendDir && call venv\Scripts\activate.bat && uvicorn main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Hidden -PassThru

# Give the backend time to start
Start-Sleep -Seconds 3

# Launch frontend
Write-Host "Starting frontend..."
$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $FrontendDir && npm run dev -- --port 6069" -WindowStyle Hidden -PassThru

# Give the frontend time to start
Start-Sleep -Seconds 3

# Open app in browser
Write-Host "Opening application in browser..."
Start-Process "http://localhost:$FrontendPort"

Write-Host "HohimerPro is running. Close this window to stop the application."

# Set up a simple event handler for when this script closes
$exitHandler = {
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Write-Host "Stopping backend process..."
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        Write-Host "Stopping frontend process..."
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Also try to find and kill any related processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*next dev*" -or $_.CommandLine -like "*6069*" } | 
        ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
        
    Get-Process -Name "python*" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*uvicorn*" -or $_.CommandLine -like "*8000*" } | 
        ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
}

# Register the exit handler
try {
    $null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $exitHandler
}
catch {
    Write-Host "Could not register exit handler"
}

# Keep the script running
try {
    Wait-Process -Id $backendProcess.Id
}
catch {
    # This will execute when user closes the script or processes end
    & $exitHandler
}