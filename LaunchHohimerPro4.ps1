# HohimerPro Debug Launcher
# This version will stay open and show any errors

# Create log file
$logFile = Join-Path $PSScriptRoot "launcher_log.txt"
"Launch started at $(Get-Date)" | Out-File -FilePath $logFile -Append

# Function to log messages to both console and file
function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $message" | Out-File -FilePath $logFile -Append
    Write-Host "$timestamp - $message"
}

# Catch all errors
$ErrorActionPreference = "Stop"

try {
    Write-Log "Script started"
    
    # App will determine its own location
    $ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    $AppRoot = $ScriptPath
    
    Write-Log "App root: $AppRoot"
    
    # App structure - using exact paths from your environment
    $BackendDir = Join-Path $AppRoot "backend"
    $FrontendDir = Join-Path $AppRoot "frontend"
    $DataDir = Join-Path $BackendDir "data"
    $BackupsDir = Join-Path $DataDir "backup_dbs"
    $DBPath = Join-Path $DataDir "401k_payments.db"
    $VenvDir = Join-Path $BackendDir "venv"
    
    # Check if directories exist
    Write-Log "Checking paths..."
    if (-not (Test-Path $BackendDir)) { 
        Write-Log "ERROR: Backend directory not found at: $BackendDir" 
        throw "Backend directory not found"
    }
    if (-not (Test-Path $FrontendDir)) { 
        Write-Log "ERROR: Frontend directory not found at: $FrontendDir"
        throw "Frontend directory not found" 
    }
    
    Write-Log "Starting HohimerPro..."
    
    # Backup the database
    Write-Log "Attempting database backup..."
    if (Test-Path $DataDir) {
        # Create backups directory if it doesn't exist
        if (-not (Test-Path $BackupsDir)) {
            New-Item -ItemType Directory -Path $BackupsDir -Force | Out-Null
            Write-Log "Created backups directory."
        }
        
        # Check if database exists
        if (Test-Path $DBPath) {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $backupPath = Join-Path $BackupsDir "401k_payments_backup_$timestamp.db"
            
            Copy-Item -Path $DBPath -Destination $backupPath -Force
            Write-Log "Database backed up to: $backupPath"
        } else {
            Write-Log "WARNING: Database file not found at: $DBPath"
        }
    } else {
        Write-Log "WARNING: Data directory not found at: $DataDir"
    }
    
    # Launch backend
    Write-Log "Starting backend..."
    
    # Check if venv exists
    if (-not (Test-Path $VenvDir)) {
        Write-Log "ERROR: Virtual environment not found at: $VenvDir"
        throw "Virtual environment not found"
    }
    
    # Check if virtual environment activate script exists
    $activateScript = Join-Path $VenvDir "Scripts\activate.bat"
    if (-not (Test-Path $activateScript)) {
        Write-Log "ERROR: Virtual environment activate script not found at: $activateScript"
        throw "Virtual environment activate script not found"
    }
    
    $backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $BackendDir && call venv\Scripts\activate.bat && uvicorn main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal -PassThru
    Write-Log "Backend process started with ID: $($backendProcess.Id)"
    
    # Check if node_modules exists
    $nodeModulesPath = Join-Path $FrontendDir "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Log "WARNING: node_modules not found at: $nodeModulesPath"
        Write-Log "You may need to run 'npm install' in the frontend directory"
    }
    
    # Give the backend time to start
    Write-Log "Waiting for backend to initialize..."
    Start-Sleep -Seconds 3
    
    # Launch frontend
    Write-Log "Starting frontend..."
    $frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $FrontendDir && npm run dev -- --port 6069" -WindowStyle Normal -PassThru
    Write-Log "Frontend process started with ID: $($frontendProcess.Id)"
    
    # Give the frontend time to start
    Write-Log "Waiting for frontend to initialize..."
    Start-Sleep -Seconds 5
    
    # Open app in browser
    Write-Log "Opening application in browser..."
    Start-Process "http://localhost:6069"
    
    Write-Log "HohimerPro is running."
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Green
    Write-Host "HohimerPro is running! Check the browser window that opened." -ForegroundColor Green
    Write-Host "This window will stay open for troubleshooting." -ForegroundColor Green
    Write-Host "Check the log file at: $logFile" -ForegroundColor Green
    Write-Host "Press any key to stop the application..." -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Green
    
    # Wait for user to press a key
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Cleanup
    Write-Log "Stopping processes..."
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Log "Stopped backend process"
    }
    
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Log "Stopped frontend process"
    }
    
    # Also try to find and kill any related processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*next dev*" -or $_.CommandLine -like "*6069*" } | 
        ForEach-Object { 
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue 
            Write-Log "Stopped Node process: $($_.Id)"
        }
        
    Get-Process -Name "python*" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*uvicorn*" -or $_.CommandLine -like "*8000*" } | 
        ForEach-Object { 
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue 
            Write-Log "Stopped Python process: $($_.Id)"
        }
    
    Write-Log "Application shutdown complete."
}
catch {
    $errorMessage = $_.Exception.Message
    Write-Log "ERROR: $errorMessage"
    Write-Log "ERROR DETAILS: $($_.Exception.StackTrace)"
    
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Red
    Write-Host "ERROR: $errorMessage" -ForegroundColor Red
    Write-Host "See the log file for more details: $logFile" -ForegroundColor Red
    Write-Host "Press any key to exit..." -ForegroundColor Red
    Write-Host "======================================================" -ForegroundColor Red
    
    # Wait for user to press a key before exiting
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}