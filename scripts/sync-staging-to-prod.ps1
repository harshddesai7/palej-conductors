# Sync Staging to Production Script
# Usage: .\scripts\sync-staging-to-prod.ps1 [-DryRun]
# 
# This script syncs verified staging changes to production

param(
    [switch]$DryRun = $false,
    [string]$Branch = "master"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Staging -> Production Sync Script ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$STAGING_REPO = "https://github.com/harshddesai7/palej-app-staging.git"
$PROD_REPO = "https://github.com/harshddesai7/palej-conductors.git"
$PROD_REMOTE_NAME = "production"

# Step 1: Verify current repo is staging
Write-Host "[1/6] Verifying staging repository..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin
if ($currentRemote -notlike "*palej-app-staging*") {
    Write-Host "ERROR: Current repo is not staging!" -ForegroundColor Red
    Write-Host "Expected: $STAGING_REPO" -ForegroundColor Red
    Write-Host "Got: $currentRemote" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Staging repository confirmed" -ForegroundColor Green

# Step 2: Check git status
Write-Host ""
Write-Host "[2/6] Checking git status..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "WARNING: Uncommitted changes detected:" -ForegroundColor Yellow
    Write-Host $status
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Aborted." -ForegroundColor Red
        exit 1
    }
}
Write-Host "OK: Working directory clean" -ForegroundColor Green

# Step 3: Add production remote if not exists
Write-Host ""
Write-Host "[3/6] Setting up production remote..." -ForegroundColor Yellow
$remotes = git remote
if ($remotes -notcontains $PROD_REMOTE_NAME) {
    Write-Host "Adding production remote: $PROD_REPO" -ForegroundColor Yellow
    git remote add $PROD_REMOTE_NAME $PROD_REPO
    Write-Host "OK: Production remote added" -ForegroundColor Green
} else {
    Write-Host "OK: Production remote already exists" -ForegroundColor Green
}

# Verify production remote URL
$prodUrl = git remote get-url $PROD_REMOTE_NAME
if ($prodUrl -notlike "*palej-conductors*") {
    Write-Host "ERROR: Production remote URL incorrect!" -ForegroundColor Red
    Write-Host "Expected: $PROD_REPO" -ForegroundColor Red
    Write-Host "Got: $prodUrl" -ForegroundColor Red
    exit 1
}

# Step 4: Fetch production state
Write-Host ""
Write-Host "[4/6] Fetching production state..." -ForegroundColor Yellow
git fetch $PROD_REMOTE_NAME $Branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to fetch production" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Production state fetched" -ForegroundColor Green

# Step 5: Show what will be synced
Write-Host ""
Write-Host "[5/6] Analyzing changes..." -ForegroundColor Yellow
$currentCommit = git rev-parse HEAD
$prodCommit = git rev-parse "${PROD_REMOTE_NAME}/${Branch}"

if ($currentCommit -eq $prodCommit) {
    Write-Host "OK: Staging and production are already in sync!" -ForegroundColor Green
    exit 0
}

$commitCount = git rev-list --count "${prodCommit}..${currentCommit}"
Write-Host "Commits to sync: $commitCount" -ForegroundColor Yellow

Write-Host ""
Write-Host "Recent commits to sync:" -ForegroundColor Yellow
git log --oneline "${prodCommit}..${currentCommit}" -10

if ($DryRun) {
    Write-Host ""
    Write-Host "=== DRY RUN MODE ===" -ForegroundColor Yellow
    Write-Host "Would push $currentCommit to production/$Branch" -ForegroundColor Yellow
    exit 0
}

# Step 6: Confirm before push
Write-Host ""
Write-Host "[6/6] Ready to sync..." -ForegroundColor Yellow
Write-Host "Staging commit: $currentCommit" -ForegroundColor Yellow
Write-Host "Production commit: $prodCommit" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will push staging changes to production." -ForegroundColor Yellow
Write-Host "Vercel will automatically deploy after push." -ForegroundColor Yellow
$response = Read-Host "Continue? (y/N)"
if ($response -ne "y" -and $response -ne "Y") {
    Write-Host "Aborted." -ForegroundColor Red
    exit 1
}

# Push to production (force push since repos may have diverged)
Write-Host ""
Write-Host "Pushing to production..." -ForegroundColor Yellow
Write-Host "Note: Using force push since staging and production are separate repos" -ForegroundColor Yellow
$pushRef = "${currentCommit}:refs/heads/${Branch}"
git push $PROD_REMOTE_NAME $pushRef --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Push failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "OK: Successfully synced to production!" -ForegroundColor Green
Write-Host "Production URL: https://palej-conductors.vercel.app" -ForegroundColor Green
Write-Host "Vercel will auto-deploy. Check dashboard for status." -ForegroundColor Green
Write-Host ""
