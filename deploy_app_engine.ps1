$ProjectId = "kathleen-road-web-12345"
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Deploying Brochure Website to Google App Engine" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Login check
Write-Host "`n[1/4] Checking Google Cloud Authentication..." -ForegroundColor Yellow
gcloud auth print-access-token >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "You are not logged in. Initiating gcloud login..." -ForegroundColor Yellow
    gcloud auth login
}
else {
    Write-Host "Already authenticated." -ForegroundColor Green
}

# 2. Set the project
Write-Host "`n[2/4] Setting active project to '$ProjectId'..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# 3. Environment Injection
Write-Host "`n[3/4] Injecting environment variables from .env into app.yaml.deploy..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Write-Host "❌ Error: .env file not found. Create it from .env.example first." -ForegroundColor Red
    exit 1
}

# Save the template content
$template_yaml = Get-Content app.yaml -Raw

# Load .env variables
$env_lines = Get-Content .env

# Load .env variables and inject into a temporary string
$deploy_yaml = $template_yaml

foreach ($line in $env_lines) {
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim()

        # Strip surrounding quotes if present
        if ($val -match '^"(.*)"$') { $val = $matches[1] }
        elseif ($val -match "^'(.*)'$") { $val = $matches[1] }
        
        # Mask sensitive values in logs
        $logVal = $val
        if ($key -ilike "*PASS*" -or $key -ilike "*SECRET*" -or $key -ilike "*KEY*") {
            $logVal = "********"
        }
        Write-Host "   Injecting: $key = $logVal" -ForegroundColor Gray

        # Replace the placeholder ${KEY} with the actual value from .env
        $placeholder = [regex]::Escape('${' + $key + '}')
        $deploy_yaml = $deploy_yaml -replace $placeholder, $val
    }
}

Write-Host "`nPreview of injected env_variables (masked):" -ForegroundColor Cyan
$deploy_yaml_masked = $deploy_yaml
foreach ($line in $env_lines) {
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim()
        if ($key -ilike "*PASS*" -or $key -ilike "*SECRET*" -or $key -ilike "*KEY*") {
            $placeholder = [regex]::Escape($val)
            $deploy_yaml_masked = $deploy_yaml_masked -replace $placeholder, "********"
        }
    }
}
Write-Host $deploy_yaml_masked

# 4. Swap and Deploy
Write-Host "`n[4/4] Deploying to App Engine..." -ForegroundColor Yellow

# Backup template and put real app.yaml in place
Rename-Item app.yaml app.yaml.template
# Use .NET to write UTF-8 without BOM for gcloud compatibility
$absolutePath = Join-Path (Get-Location) "app.yaml"
[System.IO.File]::WriteAllText($absolutePath, $deploy_yaml)

try {
    gcloud app deploy --quiet
}
finally {
    # Restore template
    if (Test-Path app.yaml.template) {
        Remove-Item app.yaml
        Rename-Item app.yaml.template app.yaml
    }
}

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "Deployment Complete! 🎉" -ForegroundColor Green
$appUrl = gcloud app browse --no-launch-browser
Write-Host "Your website is live at: $appUrl" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
