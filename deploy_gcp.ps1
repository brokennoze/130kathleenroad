param (
    [Parameter(Mandatory = $true, HelpMessage = "Your Google Cloud Project ID")]
    [string]$ProjectId
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Deploying Brochure Website to Google Cloud Storage" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Login check
Write-Host "`n[1/6] Checking Google Cloud Authentication..." -ForegroundColor Yellow
gcloud auth print-access-token >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "You are not logged in. Initiating gcloud login..." -ForegroundColor Yellow
    gcloud auth login
}
else {
    Write-Host "Already authenticated." -ForegroundColor Green
}

# 2. Set the project
Write-Host "`n[2/6] Setting active project to '$ProjectId'..." -ForegroundColor Yellow
$projectCheck = gcloud projects describe $ProjectId 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Project '$ProjectId' could not be found or you don't have access to it." -ForegroundColor Red
    Write-Host $projectCheck -ForegroundColor Red
    exit 1
}
gcloud config set project $ProjectId

# 3. Generate a GUARANTEED unique bucket name
$RandomSuffix = -join ((48..57) + (97..122) | Get-Random -Count 6 | % { [char]$_ })
$BucketName = "$ProjectId-web-$RandomSuffix"

# 4. Create the bucket
Write-Host "`n[3/6] Creating universally unique bucket: gs://$BucketName..." -ForegroundColor Yellow
$createOutput = gcloud storage buckets create gs://$BucketName --location=europe-west2 --uniform-bucket-level-access 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create bucket. Google Cloud says:" -ForegroundColor Red
    Write-Host $createOutput -ForegroundColor Red
    Write-Host "`nCommon reasons for this:" -ForegroundColor Cyan
    Write-Host "1. Billing is not enabled for Project '$ProjectId'." -ForegroundColor Cyan
    Write-Host "   (Fix this in the Cloud Console > Billing, or run setup_gcp_project.ps1)" -ForegroundColor Cyan
    Write-Host "2. You don't have the necessary IAM permissions." -ForegroundColor Cyan
    exit 1
}

# 5. Make the bucket public
Write-Host "`n[4/6] Making the bucket publicly accessible to view..." -ForegroundColor Yellow
$iamOutput = gcloud storage buckets add-iam-policy-binding gs://$BucketName --member="allUsers" --role="roles/storage.objectViewer" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to make bucket public:" -ForegroundColor Red
    Write-Host $iamOutput -ForegroundColor Red
    exit 1
}

# 6. Configure as a website
Write-Host "`n[5/6] Configuring bucket to act as a static website..." -ForegroundColor Yellow
$webOutput = gcloud storage buckets update gs://$BucketName --web-main-page-suffix=index.html 2>&1

# 7. Upload the files
Write-Host "`n[6/6] Uploading website files..." -ForegroundColor Yellow

# Upload HTML, CSS, JS
gcloud storage cp *.html gs://$BucketName/
gcloud storage cp styles.css gs://$BucketName/
gcloud storage cp script.js gs://$BucketName/
# Upload images folder recursively
gcloud storage cp -r images gs://$BucketName/

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "Deployment Complete! 🎉" -ForegroundColor Green
Write-Host "Your universally unique bucket was created successfully." -ForegroundColor White
Write-Host "Your website is live at: https://storage.googleapis.com/$BucketName/index.html" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
