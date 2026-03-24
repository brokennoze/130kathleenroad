param (
    [Parameter(Mandatory = $true, HelpMessage = "Your Google Cloud Project ID")]
    [string]$ProjectId
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Deploying Brochure Website to Google App Engine" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Login check
Write-Host "`n[1/3] Checking Google Cloud Authentication..." -ForegroundColor Yellow
gcloud auth print-access-token >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "You are not logged in. Initiating gcloud login..." -ForegroundColor Yellow
    gcloud auth login
}
else {
    Write-Host "Already authenticated." -ForegroundColor Green
}

# 2. Set the project
Write-Host "`n[2/3] Setting active project to '$ProjectId'..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# 3. Deploy to App Engine
Write-Host "`n[3/3] Deploying to App Engine..." -ForegroundColor Yellow
Write-Host "NOTE: This will create an App Engine application if one doesn't exist." -ForegroundColor Gray
gcloud app deploy app.yaml --quiet

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "Deployment Complete! 🎉" -ForegroundColor Green
$appUrl = gcloud app browse --no-launch-browser
Write-Host "Your website is live at: $appUrl" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
