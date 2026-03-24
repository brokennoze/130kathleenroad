param (
    [Parameter(Mandatory = $true, HelpMessage = "Your exact custom domain name (e.g., www.130kathleenroad.co.uk)")]
    [string]$DomainName
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Setting up Custom Domain Bucket on Google Cloud" -ForegroundColor Cyan
Write-Host "Target Domain/Bucket: gs://$DomainName" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

Write-Host "`n⚠️ IMPORTANT: You MUST have already verified ownership of '$DomainName' in Google Webmaster Central using this exact Google account, otherwise this will fail!" -ForegroundColor Yellow
$proceed = Read-Host "Have you verified the domain? (y/n)"
if ($proceed -ne 'y') {
    Write-Host "Please follow the instructions in custom_domain_guide.md first." -ForegroundColor Red
    exit 1
}

# 1. Login check
Write-Host "`n[1/4] Checking Google Cloud Authentication..." -ForegroundColor Yellow
gcloud auth print-access-token >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    gcloud auth login
}

# 2. Create the exact named bucket
Write-Host "`n[2/4] Creating bucket gs://$DomainName..." -ForegroundColor Yellow
$createOutput = gcloud storage buckets create gs://$DomainName --location=europe-west2 --uniform-bucket-level-access 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create bucket. Did you verify the domain in Google Webmaster Central?" -ForegroundColor Red
    Write-Host $createOutput -ForegroundColor Red
    exit 1
}

# 3. Make public and configure website
Write-Host "`n[3/4] Making public and configuring static website..." -ForegroundColor Yellow
gcloud storage buckets add-iam-policy-binding gs://$DomainName --member="allUsers" --role="roles/storage.objectViewer" >$null 2>&1
gcloud storage buckets update gs://$DomainName --web-main-page-suffix=index.html >$null 2>&1

# 4. Upload files
Write-Host "`n[4/4] Uploading website files..." -ForegroundColor Yellow
gcloud storage cp *.html gs://$DomainName/
gcloud storage cp styles.css gs://$DomainName/
gcloud storage cp script.js gs://$DomainName/
gcloud storage cp -r images gs://$DomainName/

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "Bucket Setup Complete! 🎉" -ForegroundColor Green
Write-Host "Next Step: Go to your domain provider (e.g. GoDaddy) and add a CNAME record:" -ForegroundColor White
Write-Host "  Name: www" -ForegroundColor White
Write-Host "  Value: c.storage.googleapis.com" -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Cyan
