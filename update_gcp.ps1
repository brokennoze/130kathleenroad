param (
    [Parameter(Mandatory = $true, HelpMessage = "Your exact Google Cloud Storage Bucket Name (e.g., your-project-web-ab12cd)")]
    [string]$BucketName
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Updating Brochure Website on Google Cloud Storage" -ForegroundColor Cyan
Write-Host "Target: gs://$BucketName" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Login check
Write-Host "`n[1/2] Checking Google Cloud Authentication..." -ForegroundColor Yellow
gcloud auth print-access-token >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "You are not logged in. Initiating gcloud login..." -ForegroundColor Yellow
    gcloud auth login
}
else {
    Write-Host "Already authenticated." -ForegroundColor Green
}

# 2. Upload the files
Write-Host "`n[2/2] Syncing website files..." -ForegroundColor Yellow

# Upload HTML, CSS, JS
gcloud storage cp *.html gs://$BucketName/ --cache-control="no-cache, max-age=0"
gcloud storage cp styles.css gs://$BucketName/
gcloud storage cp script.js gs://$BucketName/
# Upload images folder recursively
gcloud storage cp -r images gs://$BucketName/

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "Update Complete! 🎉" -ForegroundColor Green
Write-Host "Your website has been updated and is live at:" -ForegroundColor White
Write-Host "https://storage.googleapis.com/$BucketName/index.html" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
