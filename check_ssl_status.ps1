param (
    [Parameter(Mandatory = $true, HelpMessage = "Your exact custom domain name (e.g., www.130kathleenroad.co.uk)")]
    [string]$DomainName
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Checking SSL Certificate Status for $DomainName" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Replace dots with dashes for the resource name
$ResourceName = $DomainName -replace '\.', '-'

# Fetch the status from gcloud
Write-Host "Fetching status from Google Cloud..." -ForegroundColor Yellow
$status = gcloud compute ssl-certificates describe "$ResourceName-cert" --global --format="value(managed.status)" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error fetching certificate status." -ForegroundColor Red
    Write-Host $status -ForegroundColor Red
    exit 1
}

Write-Host "`nCurrent Status: " -NoNewline
switch ($status.Trim()) {
    "PROVISIONING" {
        Write-Host "PROVISIONING ⏳" -ForegroundColor Yellow
        Write-Host "`nGoogle is currently verifying your DNS records and issuing the certificate."
        Write-Host "This usually takes 30-60 minutes after your DNS 'A Record' has fully propagated."
    }
    "ACTIVE" {
        Write-Host "ACTIVE ✅" -ForegroundColor Green
        Write-Host "`nYour SSL certificate is successfully issued and active! Your site is secure."
    }
    "PROVISIONING_FAILED" {
        Write-Host "FAILED ❌" -ForegroundColor Red
        Write-Host "`nGoogle could not verify your domain. Please check that:"
        Write-Host "1. Your A record is pointing to the correct Load Balancer IP Address."
        Write-Host "2. You don't have conflicting AAAA (IPv6) or CNAME records for 'www'."
    }
    "FAILED_NOT_VISIBLE" {
        Write-Host "FAILED (Domain Not Visible) ❌" -ForegroundColor Red
        Write-Host "`nGoogle's servers cannot see your domain's DNS records yet. Ensure your A record is set correctly."
    }
    default {
        Write-Host "$status" -ForegroundColor White
    }
}
Write-Host "=======================================================" -ForegroundColor Cyan
