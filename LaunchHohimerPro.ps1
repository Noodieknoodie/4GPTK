# HohimerPro Installer and Launcher
# Handles installations if needed and launches the app

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
    $PythonRequirements = Join-Path $BackendDir "requirements.txt"
    
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
    
    #======== INSTALLATION FUNCTIONS ========
    
    function Test-CommandExists {
        param(
            [string]$Command
        )
        
        try {
            if (Get-Command $Command -ErrorAction SilentlyContinue) {
                return $true
            }
        }
        catch {
            return $false
        }
        return $false
    }
    
    function Test-PythonVersion {
        param(
            [string]$MinVersion = "3.8"
        )
        
        try {
            $pythonVersion = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
            $versionComparison = [System.Version]$pythonVersion -ge [System.Version]$MinVersion
            
            return $versionComparison
        }
        catch {
            return $false
        }
    }
    
    function Test-NodeVersion {
        param(
            [string]$DesiredVersion = "18"
        )
        
        try {
            $nodeVersionOutput = node -v
            # Extract just the major version number (v18.x.x -> 18)
            $majorVersion = $nodeVersionOutput -replace 'v(\d+)\..*', '$1'
            
            return $majorVersion -ge $DesiredVersion
        }
        catch {
            return $false
        }
    }
    
    function Test-AdminPrivileges {
        # Check if the current PowerShell session is running with admin privileges
        $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object System.Security.Principal.WindowsPrincipal($identity)
        return $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
    }
    
    function Invoke-ElevatedIfNeeded {
        param (
            [Parameter(Mandatory=$true)]
            [scriptblock]$ScriptBlock,
            [string]$OperationName = "operation"
        )
        
        # Try running normally first
        try {
            Write-Log "Attempting $OperationName..."
            & $ScriptBlock
            return $true
        }
        catch {
            $errorMsg = $_.Exception.Message
            # Check if the error seems like a permissions issue
            if ($errorMsg -match "access is denied|permission|privileges|administrator|elevated") {
                Write-Log "Warning: Failed due to permissions: $errorMsg"
                # Will continue to elevation attempt
            }
            else {
                # Some other error occurred
                Write-Log "Error: Failed: $errorMsg"
                return $false
            }
        }
        
        # If we're already running as admin, no need to re-elevate
        if (Test-AdminPrivileges) {
            try {
                Write-Log "Retrying $OperationName with current admin privileges..."
                & $ScriptBlock
                return $true
            }
            catch {
                Write-Log "Error: Failed even with admin privileges: $($_.Exception.Message)"
                return $false
            }
        }
        
        # If we get here, we need to elevate
        Write-Log "Warning: $OperationName requires administrator privileges. Requesting elevation..."
        
        # Prepare a script that will run our code block
        $tempScript = Join-Path $env:TEMP "ElevatedOperation_$(Get-Random).ps1"
        
        # Write a script that will run the operation
        @"
    # This is an auto-generated script to perform elevated operations
    Set-Location "$PWD"
    Write-Host "Running with elevated privileges: $OperationName"
    
    # Run the operation
    $($ScriptBlock.ToString())
    
    Write-Host "Elevated operation complete. Press any key to continue..."
    `$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
"@ | Out-File $tempScript -Encoding utf8
        
        # Start the new script with elevated privileges
        try {
            Start-Process powershell.exe -ArgumentList "-NoProfile", "-ExecutionPolicy Bypass", "-File", "`"$tempScript`"" -Verb RunAs -Wait
            
            # Since we can't directly get the return value from the elevated process, 
            # we'll just check if it completed without throwing an exception
            Write-Log "Success: Elevated operation appears to have completed."
            
            # Clean up
            if (Test-Path $tempScript) {
                Remove-Item $tempScript -Force
            }
            
            return $true
        }
        catch {
            Write-Log "Error: Failed to run with elevation: $($_.Exception.Message)"
            return $false
        }
    }
    
    function Install-Python {
        Write-Log "Python not found or version too old. Installing Python..."
        
        $installResult = Invoke-ElevatedIfNeeded -OperationName "Python installation" -ScriptBlock {
            try {
                $pythonUrl = "https://www.python.org/ftp/python/3.11.0/python-3.11.0-amd64.exe"
                $pythonInstaller = Join-Path $env:TEMP "python_installer.exe"
                
                Write-Host "Downloading Python installer..."
                Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonInstaller -UseBasicParsing
                
                Write-Host "Installing Python (this may take a while)..."
                Start-Process -FilePath $pythonInstaller -ArgumentList "/quiet", "InstallAllUsers=1", "PrependPath=1" -Wait
                
                # Refresh environment variables
                $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
                
                # Verify installation worked
                Start-Sleep -Seconds 2
                if (-not (Test-CommandExists "python")) {
                    throw "Python installation appeared to succeed but command is still not available"
                }
                
                Write-Host "Python installed successfully."
                return $true
            }
            catch {
                Write-Host "Error: Failed to install Python: $_"
                Write-Host "Please install Python 3.8 or newer manually from https://www.python.org/downloads/"
                return $false
            }
        }
        
        return $installResult
    }
    
    function Install-Node {
        Write-Log "Node.js not found or version too old. Installing Node.js..."
        
        $installResult = Invoke-ElevatedIfNeeded -OperationName "Node.js installation" -ScriptBlock {
            try {
                $nodeUrl = "https://nodejs.org/dist/v18.19.1/node-v18.19.1-x64.msi"
                $nodeInstaller = Join-Path $env:TEMP "node_installer.msi"
                
                Write-Host "Downloading Node.js installer..."
                Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
                
                Write-Host "Installing Node.js (this may take a while)..."
                Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $nodeInstaller, "/quiet", "/norestart" -Wait
                
                # Refresh environment variables
                $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
                
                # Verify installation worked
                Start-Sleep -Seconds 2
                if (-not (Test-CommandExists "node")) {
                    throw "Node.js installation appeared to succeed but command is still not available"
                }
                
                Write-Host "Node.js installed successfully."
                return $true
            }
            catch {
                Write-Host "Error: Failed to install Node.js: $_"
                Write-Host "Please install Node.js v18 or newer manually from https://nodejs.org/"
                return $false
            }
        }
        
        return $installResult
    }
    
    function Invoke-WebRequestWithRetry {
        param (
            [string]$Uri,
            [string]$OutFile,
            [int]$MaxRetries = 3
        )
        
        $retryCount = 0
        $success = $false
        $sleepSeconds = 2
        
        while (-not $success -and $retryCount -lt $MaxRetries) {
            try {
                if ($retryCount -gt 0) {
                    Write-Log "Retry attempt $retryCount downloading $Uri"
                    Start-Sleep -Seconds $sleepSeconds
                    # Exponential backoff
                    $sleepSeconds = $sleepSeconds * 2
                }
                
                Invoke-WebRequest -Uri $Uri -OutFile $OutFile -UseBasicParsing
                $success = $true
            }
            catch {
                $retryCount++
                if ($retryCount -ge $MaxRetries) {
                    throw "Failed to download after $MaxRetries attempts: $_"
                }
            }
        }
    }
    
    #======== CHECK DEPENDENCIES ========
    
    # Quick launch support - skip dependency checks if run within the last 24 hours
    $DependencyCheckFile = Join-Path $AppRoot ".dependency_check_timestamp"
    $SkipDependencyChecks = $false
    
    # Check if we've recently verified dependencies (within 24 hours)
    if (Test-Path $DependencyCheckFile) {
        $lastCheckTime = Get-Content $DependencyCheckFile | Get-Date
        $timeSinceLastCheck = (Get-Date) - $lastCheckTime
        if ($timeSinceLastCheck.TotalHours -lt 24) {
            $SkipDependencyChecks = $true
            Write-Log "Dependencies checked recently, skipping checks for faster startup."
        }
    }
    
    if (-not $SkipDependencyChecks) {
        Write-Log "Checking system dependencies..."
        
        # Check Python
        $pythonInstalled = Test-CommandExists "python"
        $pythonVersionOk = Test-PythonVersion
        
        if (-not $pythonInstalled -or -not $pythonVersionOk) {
            Write-Log "Python not found or version too old."
            $pythonSuccess = Install-Python
            if (-not $pythonSuccess) {
                Write-Log "Error: Cannot continue without Python. Exiting."
                throw "Python installation failed"
            }
        } else {
            Write-Log "Python already installed with correct version."
        }
        
        # Check Node.js
        $nodeInstalled = Test-CommandExists "node"
        $nodeVersionOk = Test-NodeVersion
        
        if (-not $nodeInstalled -or -not $nodeVersionOk) {
            Write-Log "Node.js not found or version too old."
            $nodeSuccess = Install-Node
            if (-not $nodeSuccess) {
                Write-Log "Error: Cannot continue without Node.js. Exiting."
                throw "Node.js installation failed"
            }
        } else {
            Write-Log "Node.js already installed with correct version."
        }
        
        # Update dependency check timestamp file for faster future launches
        Get-Date | Out-File $DependencyCheckFile
        Write-Log "Dependency check complete."
    }
    
    #======== BACKUP DATABASE ========
    
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
            
            # Keep only the last 30 backups
            $allBackups = Get-ChildItem -Path $BackupsDir -Filter "401k_payments_backup_*.db" | Sort-Object LastWriteTime -Descending
            
            if ($allBackups.Count -gt 30) {
                $backupsToDelete = $allBackups | Select-Object -Skip 30
                foreach ($backup in $backupsToDelete) {
                    Remove-Item -Path $backup.FullName -Force
                    Write-Log "Removed old backup: $($backup.Name)"
                }
            }
        } else {
            Write-Log "Warning: Database file not found at: $DBPath"
        }
    } else {
        Write-Log "Warning: Data directory not found at: $DataDir"
    }
    
    #======== INSTALL FRONTEND DEPENDENCIES IF NEEDED ========
    
    $nodeModulesPath = Join-Path $FrontendDir "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Log "Node modules not found, installing frontend dependencies..."
        Push-Location $FrontendDir
        try {
            # Run npm install
            $process = Start-Process -FilePath "npm" -ArgumentList "install" -NoNewWindow -PassThru -Wait
            if ($process.ExitCode -ne 0) {
                Write-Log "Warning: npm install might have encountered issues. Continuing anyway..."
            } else {
                Write-Log "Frontend dependencies installed successfully."
            }
        }
        catch {
            Write-Log "Warning: Failed to install frontend dependencies: $_"
            Write-Log "Continuing anyway..."
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Log "Frontend dependencies already installed."
    }
    
    #======== LAUNCH APPLICATION ========
    
    # Launch backend
    Write-Log "Starting backend..."
    $backendBatPath = Join-Path $AppRoot "run_backend.bat"
    
    # Use the batch file if it exists, otherwise run the command directly
    if (Test-Path $backendBatPath) {
        $backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c ""$backendBatPath""" -WindowStyle Normal -PassThru
    } else {
        $backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $BackendDir && uvicorn main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal -PassThru
    }
    
    Write-Log "Backend process started with ID: $($backendProcess.Id)"
    
    # Give the backend time to start
    Write-Log "Waiting for backend to initialize..."
    Start-Sleep -Seconds 3
    
    # Launch frontend
    Write-Log "Starting frontend..."
    $frontendBatPath = Join-Path $AppRoot "run_frontend.bat"
    
    # Use the batch file if it exists, otherwise run the command directly
    if (Test-Path $frontendBatPath) {
        $frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c ""$frontendBatPath""" -WindowStyle Normal -PassThru
    } else {
        $frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $FrontendDir && npm run dev -- --port 6069" -WindowStyle Normal -PassThru
    }
    
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