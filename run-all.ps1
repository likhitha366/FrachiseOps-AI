$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm.cmd run dev" -WorkingDirectory (Join-Path $projectRoot "backend")
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm.cmd run dev" -WorkingDirectory (Join-Path $projectRoot "frontend")

Write-Host "Backend:  http://localhost:5000"
Write-Host "Frontend: http://localhost:3000"
