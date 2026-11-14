param(
    [string]$NodeModules = 'E:/肥鱼不乐园/emotelab-skill/scripts/headless/node_modules',
    [switch]$Install,
    [switch]$PackOnly
)
$ErrorActionPreference = 'Stop'
if ($Install -and $PackOnly) { throw 'Use either -Install or -PackOnly.' }
$root = $PSScriptRoot
$modelName = 'PeizhengHairMotion'
$model = Join-Path $root $modelName
$previousNodePath = $env:NODE_PATH
$env:NODE_PATH = (Resolve-Path -LiteralPath $NodeModules).ProviderPath

try {
    python (Join-Path $root 'build.py')
    if ($LASTEXITCODE -ne 0) { throw 'Texture pack failed.' }
    node (Join-Path $root 'rebind.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'Mesh build failed.' }

    $zip = Join-Path $root 'Peizheng-art.zip'
    $zipItems = @(
        (Join-Path $root 'art'),
        (Join-Path $root 'bounds.json'),
        (Join-Path $root 'DisplayInfo'),
        $PSCommandPath,
        (Join-Path $root 'PACKING.md')
    )
    Compress-Archive -LiteralPath $zipItems -DestinationPath $zip -Force
    Write-Host "Art package: $zip"

    if (!$PackOnly) {
        $documents = [Environment]::GetFolderPath('MyDocuments')
        $destination = Join-Path $documents "EmoteLab/SpineModels/$modelName"
        if (!(Test-Path -LiteralPath $destination -PathType Container)) {
            throw "Existing EmoteLab model directory not found: $destination"
        }
        $updated = 0
        $displayInfo = Join-Path $root 'DisplayInfo'
        if (Test-Path -LiteralPath $displayInfo -PathType Container) {
            Copy-Item -LiteralPath $displayInfo -Destination $destination -Recurse -Force
            Write-Host "DisplayInfo synced: $displayInfo"
        }
        foreach ($source in Get-ChildItem -LiteralPath $model -File) {
            $target = Join-Path $destination $source.Name
            $hash = (Get-FileHash -LiteralPath $source.FullName).Hash
            if ((Test-Path -LiteralPath $target -PathType Leaf) -and
                ((Get-FileHash -LiteralPath $target).Hash -eq $hash)) {
                continue
            }
            Copy-Item -LiteralPath $source.FullName -Destination $target -Force
            if ((Get-FileHash -LiteralPath $target).Hash -ne $hash) {
                throw "Copy verification failed: $target"
            }
            $updated++
        }
        Write-Host "Installed and verified ($updated files updated): $destination"
        Write-Host 'Close and reload PeizhengHairMotion in EmoteLab to read the updated model.'
    } else {
        Write-Host 'PackOnly: EmoteLab installation was not updated.'
    }
} finally {
    $env:NODE_PATH = $previousNodePath
}
