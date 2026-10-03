# Starts the fastfood backend, prompting for the MySQL password if needed.
#
# Usage:
#   .\run.ps1                          # prompts for the root password
#   .\run.ps1 -DbUser fastfood -DbPassword fastfood
#   .\run.ps1 -DbPassword "my-secret"
param(
    [string]$DbUser = "root",
    [string]$DbPassword,
    [string]$DbName = "fastfood",
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

if (-not $DbPassword) {
    $secure = Read-Host -Prompt "MySQL password for '$DbUser'" -AsSecureString
    $DbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}

$env:DB_USERNAME = $DbUser
$env:DB_PASSWORD = $DbPassword
$env:DB_NAME = $DbName
$env:SERVER_PORT = "$Port"

Write-Host "Starting fastfood backend on http://localhost:$Port (db '$DbName' as '$DbUser')..." -ForegroundColor Green
mvn spring-boot:run