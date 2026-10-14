$srcDir = 'C:\Users\ADMIN\.gemini\antigravity\scratch\military-asset-management'
$tempStaging = 'C:\Users\ADMIN\.gemini\antigravity\scratch\staging_zip'
$zipTarget = 'C:\Users\ADMIN\.gemini\antigravity\scratch\military-asset-management.zip'
$dumpSrc = 'C:\Users\ADMIN\.gemini\antigravity\scratch\military-asset-management\database_dump.sql'
$artifactDir = 'C:\Users\ADMIN\.gemini\antigravity\brain\ccea169c-1a3a-4712-934a-8ce52d28b3f0'

if (Test-Path $tempStaging) {
    Remove-Item $tempStaging -Recurse -Force
}
New-Item -ItemType Directory -Path $tempStaging | Out-Null

Get-ChildItem -Path $srcDir -Exclude 'node_modules', '.git', 'dist' | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $tempStaging -Recurse -Force
}

Get-ChildItem -Path $tempStaging -Recurse -Directory -Filter 'node_modules' | Remove-Item -Recurse -Force
Get-ChildItem -Path $tempStaging -Recurse -Directory -Filter 'dist' | Remove-Item -Recurse -Force

if (Test-Path $zipTarget) {
    Remove-Item $zipTarget -Force
}
Compress-Archive -Path (Join-Path $tempStaging '*') -DestinationPath $zipTarget -CompressionLevel Optimal

$desktopOne = 'C:\Users\ADMIN\OneDrive\Desktop'
$desktopTwo = 'C:\Users\ADMIN\Desktop'
$downloads = 'C:\Users\ADMIN\Downloads'

if (Test-Path $desktopOne) {
    Copy-Item -Path $zipTarget -Destination (Join-Path $desktopOne 'military-asset-management.zip') -Force
    Copy-Item -Path $dumpSrc -Destination (Join-Path $desktopOne 'database_dump.sql') -Force
    Write-Host "Updated in $desktopOne"
}
if (Test-Path $desktopTwo) {
    Copy-Item -Path $zipTarget -Destination (Join-Path $desktopTwo 'military-asset-management.zip') -Force
    Copy-Item -Path $dumpSrc -Destination (Join-Path $desktopTwo 'database_dump.sql') -Force
    Write-Host "Updated in $desktopTwo"
}
if (Test-Path $downloads) {
    Copy-Item -Path $zipTarget -Destination (Join-Path $downloads 'military-asset-management.zip') -Force
    Copy-Item -Path $dumpSrc -Destination (Join-Path $downloads 'database_dump.sql') -Force
    Write-Host "Updated in $downloads"
}
if (Test-Path $artifactDir) {
    Copy-Item -Path $zipTarget -Destination (Join-Path $artifactDir 'military-asset-management.zip') -Force
    Write-Host "Updated in artifactDir"
}

Remove-Item $tempStaging -Recurse -Force
Get-Item $zipTarget | Select-Object FullName, Length, LastWriteTime
