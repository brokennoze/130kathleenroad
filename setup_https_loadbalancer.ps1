param (
    [Parameter(Mandatory = $true, HelpMessage = "Your exact custom domain name (e.g., www.130kathleenroad.co.uk)")]
    [string]$DomainName
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Setting up HTTPS Load Balancer for $DomainName" -ForegroundColor Cyan
Write-Host "This will secure your site with an SSL Certificate!" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Ensure we're logged in
gcloud auth print-access-token >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    gcloud auth login
}

# 0. We need to replace dots with dashes for resource names in GCP
$ResourceName = $DomainName -replace '\.', '-'

# 1. Reserve Static IP
Write-Host "`n[1/6] Reserving Global Static IP Address..." -ForegroundColor Yellow
gcloud compute addresses create "$ResourceName-ip" --network-tier=PREMIUM --global 2>&1
$ipAddress = gcloud compute addresses describe "$ResourceName-ip" --global --format="value(address)"
Write-Host "Reserved IP: $ipAddress" -ForegroundColor Green

# 2. Create Backend Bucket
Write-Host "`n[2/6] Creating Backend Bucket pointing to gs://$DomainName..." -ForegroundColor Yellow
gcloud compute backend-buckets create "$ResourceName-backend" --gcs-bucket-name=$DomainName 2>&1

# 3. Create SSL Certificate
Write-Host "`n[3/6] Creating Google-managed SSL Certificate..." -ForegroundColor Yellow
gcloud compute ssl-certificates create "$ResourceName-cert" --domains=$DomainName --global 2>&1

# 4. Create URL Map
Write-Host "`n[4/6] Creating URL Map to route traffic to the bucket..." -ForegroundColor Yellow
gcloud compute url-maps create "$ResourceName-url-map" --default-backend-bucket="$ResourceName-backend" 2>&1

# 5. Create Target HTTPS Proxy
Write-Host "`n[5/6] Creating Target HTTPS Proxy..." -ForegroundColor Yellow
gcloud compute target-https-proxies create "$ResourceName-https-proxy" --url-map="$ResourceName-url-map" --ssl-certificates="$ResourceName-cert" 2>&1

# 6. Create Global Forwarding Rule
Write-Host "`n[6/6] Creating Forwarding Rule (connecting IP to Proxy)..." -ForegroundColor Yellow
gcloud compute forwarding-rules create "$ResourceName-https-rule" --address="$ResourceName-ip" --global --target-https-proxy="$ResourceName-https-proxy" --ports=443 2>&1

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "Infrastructure Setup Complete! 🎉" -ForegroundColor Green
Write-Host "`nCRITICAL FINAL DNS STEP:" -ForegroundColor Red
Write-Host "1. Go to your domain provider (GoDaddy, etc.)" -ForegroundColor White
Write-Host "2. DELETE the CNAME record for 'www' that points to 'c.storage.googleapis.com'" -ForegroundColor White
Write-Host "3. CREATE a new 'A' record:" -ForegroundColor White
Write-Host "   Name/Host: www" -ForegroundColor White
Write-Host "   Value/Points to: $ipAddress" -ForegroundColor White
Write-Host "`nGoogle will automatically provision the SSL certificate once it sees the DNS change." -ForegroundColor Yellow
Write-Host "Note: It can take 30-60 minutes for the SSL certificate to fully activate after the DNS updates." -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
