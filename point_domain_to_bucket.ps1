param (
    [Parameter(Mandatory = $true, HelpMessage = "Your custom domain (e.g., 130kathleenroad.co.uk)")]
    [string]$DomainName,

    [Parameter(Mandatory = $true, HelpMessage = "The name of the new GCS bucket (e.g., kathleen-road-web-12345-web-zt4xhg)")]
    [string]$NewBucketName
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Pointing $DomainName to bucket $NewBucketName" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Ensure we're logged in
gcloud auth print-access-token >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    gcloud auth login
}

# 1. Format Resource Name
$ResourceName = $DomainName -replace '\.', '-'
$BackendName = "$ResourceName-backend"

# 2. Configure the bucket for static hosting
Write-Host "`n[1/3] Configuring bucket gs://$NewBucketName for static hosting..." -ForegroundColor Yellow
gcloud storage buckets update "gs://$NewBucketName" --web-main-page-suffix=index.html --web-error-page=index.html 2>&1
gcloud storage buckets add-iam-policy-binding "gs://$NewBucketName" --member="allUsers" --role="roles/storage.objectViewer" 2>&1

# 3. Update the Load Balancer Backend Bucket
Write-Host "`n[2/3] Updating Load Balancer backend '$BackendName' to point to '$NewBucketName'..." -ForegroundColor Yellow
$updateOutput = gcloud compute backend-buckets update $BackendName --gcs-bucket-name=$NewBucketName 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to update backend bucket. Searching for existing backends..." -ForegroundColor Red
    gcloud compute backend-buckets list --format="table(name, gcsBucketName)"
    Write-Host "`nPlease ensure the backend name is correct. If your domain is '130kathleenroad.co.uk', the expected backend name is '$BackendName'." -ForegroundColor Yellow
} else {
    Write-Host "✅ Backend bucket updated successfully!" -ForegroundColor Green
}

# 4. Final steps
Write-Host "`n[3/3] Finalizing..." -ForegroundColor Yellow
Write-Host "`nYour domain $DomainName should now be pointing at the new bucket." -ForegroundColor Green
Write-Host "Note: It may take a few minutes for the cache to clear." -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
