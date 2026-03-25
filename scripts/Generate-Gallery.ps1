$htmlFilePath = Join-Path $PSScriptRoot "..\gallery.html"
$imagesDirPath = Join-Path $PSScriptRoot "..\images"
$htmlContent = [System.IO.File]::ReadAllText($htmlFilePath)

# Markers
$startMarker = "<!-- AUTO-GENERATED-GALLERY-START -->"
$endMarker = "<!-- AUTO-GENERATED-GALLERY-END -->"

# Generate Gallery HTML
$galleryHtml = ""

$subDirs = Get-ChildItem -Path $imagesDirPath -Directory | Sort-Object {
    if ($_.Name -match '(\d+)') { [int]$matches[1] } else { 999 }
}, Name

foreach ($dir in $subDirs) {
    # Check if directory has images
    $images = Get-ChildItem -Path $dir.FullName -File | Where-Object { $_.Extension -match '\.(jpg|jpeg|png|webp|gif)$' } | Sort-Object Name
    if ($images.Count -eq 0) {
        continue
    }

    # Format Title (Strip leading numbers/underscores)
    $displayName = $dir.Name -replace '^[^a-zA-Z]+', ''
    $rawName = $displayName -replace '[-_]', ' '
    # Capitalize Words
    $titleParts = $rawName.Split(' ') | ForEach-Object {
        if ($_.Length -gt 0) {
            $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower()
        }
    }
    $title = $titleParts -join ' '
    
    $galleryHtml += "`n        <section class=`"gallery-category reveal-up`">`n"
    $galleryHtml += "            <div class=`"category-header`">`n"
    $galleryHtml += "                <h2>$title</h2>`n"
    $galleryHtml += "            </div>`n"
    $galleryHtml += "            <div class=`"gallery-grid`">`n"
    
    foreach ($img in $images) {
        $imgRawName = $img.BaseName -replace '[-_]', ' '
        $imgTitleParts = $imgRawName.Split(' ') | ForEach-Object {
            if ($_.Length -gt 0) {
                $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower()
            }
        }
        $imgTitle = $imgTitleParts -join ' '
        
        $dirEncoded = [uri]::EscapeDataString($dir.Name)
        $imgEncoded = [uri]::EscapeDataString($img.Name)
        $relPath = "images/$dirEncoded/$imgEncoded"
        
        $galleryHtml += "                <div class=`"gallery-item`">`n"
        $galleryHtml += "                    <img src=`"$relPath`" alt=`"$imgTitle`">`n"
        $galleryHtml += "                    <div class=`"gallery-overlay`">`n"
        $galleryHtml += "                        <span>$imgTitle</span>`n"
        $galleryHtml += "                    </div>`n"
        $galleryHtml += "                </div>`n"
    }
    
    $galleryHtml += "            </div>`n"
    $galleryHtml += "        </section>`n"
}

$replacement = "$startMarker`n$galleryHtml`n        $endMarker"

$startIndex = $htmlContent.IndexOf($startMarker)
$endIndex = $htmlContent.IndexOf($endMarker)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $endIndex += $endMarker.Length
    $before = $htmlContent.Substring(0, $startIndex)
    $after = $htmlContent.Substring($endIndex)
    
    $newHtmlContent = $before + $replacement + $after
    [System.IO.File]::WriteAllText($htmlFilePath, $newHtmlContent)
    Write-Host "Gallery updated successfully."
} else {
    Write-Host "Markers not found in HTML file!"
}
