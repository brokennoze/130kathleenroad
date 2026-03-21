param (
    [Parameter(Mandatory=$true, HelpMessage="A globally unique Project ID (e.g., kathleen-road-web-123)")]
    [string]$ProjectId
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Setting up a new Google Cloud Project" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Login check
Write-Host "`n[1/5] Checking Google Cloud Authentication..." -ForegroundColor Yellow
gcloud auth print-access-token >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "You are not logged in. Initiating gcloud login..." -ForegroundColor Yellow
    gcloud auth login
} else {
    Write-Host "Already authenticated." -ForegroundColor Green
}

# 2. Create the project
Write-Host "`n[2/5] Creating Project '$ProjectId' (this must be globally unique)..." -ForegroundColor Yellow
gcloud projects create $ProjectId
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create project. Please ensure the Project ID '$ProjectId' is completely unique and contains only lowercase letters, numbers, and hyphens." -ForegroundColor Red
    exit 1
}

# 3. Set Default Project
Write-Host "`n[3/5] Setting '$ProjectId' as your active default project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# 4. Billing Setup
Write-Host "`n[4/5] Retrieving your Billing Accounts..." -ForegroundColor Yellow
gcloud beta billing accounts list
Write-Host "`nWithout an active Billing Account, you cannot create storage buckets or host websites." -ForegroundColor Cyan
$billingId = Read-Host "Please copy a BILLING_ACCOUNT_ID from the list above and paste it here"

if ([string]::IsNullOrWhiteSpace($billingId)) {
    Write-Host "No billing account provided. You must link one manually in the Google Cloud Console before deploying." -ForegroundColor Red
} else {
    Write-Host "`nLinking billing account '$billingId' to project '$ProjectId'..." -ForegroundColor Yellow
    gcloud beta billing projects link $ProjectId --billing-account=$billingId
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to link billing account. You may need to do this manually in the cloud console." -ForegroundColor Red
    } else {
        Write-Host "Billing account linked successfully." -ForegroundColor Green
    }
}

# 5. Enable Storage API (Usually default, but good to ensure)
Write-Host "`n[5/5] Ensuring Cloud Storage API is enabled for your project (this can take a moment)..." -ForegroundColor Yellow
gcloud services enable storage-component.googleapis.com
gcloud services enable storage-api.googleapis.com

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "Project Setup Complete! 🎉" -ForegroundColor Green
Write-Host "You can now run your deployment script using:" -ForegroundColor White
Write-Host "  .\deploy_gcp.ps1 -ProjectId `"$ProjectId`" -BucketName `"$ProjectId-bucket`"" -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Cyan
