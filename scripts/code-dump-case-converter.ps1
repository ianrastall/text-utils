[CmdletBinding()]
param(
    [string]$OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

if (-not $OutputPath) {
    $OutputPath = Join-Path $repoRoot 'context/code-dump-case-converter.txt'
} elseif (-not [System.IO.Path]::IsPathRooted($OutputPath)) {
    $OutputPath = Join-Path $repoRoot $OutputPath
}

$targetRelPath = 'case-converter.html'
$targetFullPath = Join-Path $repoRoot $targetRelPath

if (-not (Test-Path -LiteralPath $targetFullPath)) {
    throw "Unable to find target tool page: $targetFullPath"
}

function Get-RelativePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    return [System.IO.Path]::GetRelativePath($repoRoot, $Path).Replace('\', '/')
}

function Get-LanguageTag {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        '.html' { return 'html' }
        '.css' { return 'css' }
        '.js' { return 'javascript' }
        '.xml' { return 'xml' }
        '.ps1' { return 'powershell' }
        default { return 'text' }
    }
}

function Get-NumberedFileContent {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $lines = Get-Content -LiteralPath $Path
    $builder = New-Object System.Text.StringBuilder

    for ($i = 0; $i -lt $lines.Count; $i++) {
        [void]$builder.AppendLine(("{0,4}: {1}" -f ($i + 1), $lines[$i]))
    }

    return $builder.ToString().TrimEnd("`r", "`n")
}

$targetHtml = Get-Content -LiteralPath $targetFullPath -Raw

$localDependencies = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
$externalDependencies = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)

$assetPatterns = @(
    '<link[^>]+href\s*=\s*"([^"]+)"',
    '<script[^>]+src\s*=\s*"([^"]+)"'
)

foreach ($pattern in $assetPatterns) {
    $matches = [regex]::Matches($targetHtml, $pattern)
    foreach ($match in $matches) {
        $reference = $match.Groups[1].Value.Trim()
        if (-not $reference) {
            continue
        }

        $referencePath = ($reference -split '[?#]')[0]

        if ($referencePath -match '^(https?:)?//') {
            [void]$externalDependencies.Add($reference)
            continue
        }

        if ($referencePath -match '^(data:|mailto:|javascript:)') {
            continue
        }

        $resolvedPath = Join-Path $repoRoot $referencePath
        if (Test-Path -LiteralPath $resolvedPath) {
            [void]$localDependencies.Add((Get-RelativePath -Path $resolvedPath))
        }
    }
}

$incomingPattern = "case-converter\.html|id\s*:\s*['""]case-converter['""]"
$incomingReferences = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)

$codeFiles = Get-ChildItem -Path $repoRoot -Recurse -File |
    Where-Object {
        $_.Extension -in @('.html', '.js', '.css', '.xml') -and
        $_.FullName -notmatch '[\\/]\.git[\\/]' -and
        $_.FullName -ne $targetFullPath
    }

foreach ($file in $codeFiles) {
    if (Select-String -Path $file.FullName -Pattern $incomingPattern -Quiet) {
        [void]$incomingReferences.Add((Get-RelativePath -Path $file.FullName))
    }
}

$orderedFiles = New-Object System.Collections.Generic.List[string]
$seen = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)

function Add-OrderedFile {
    param(
        [string]$RelativePath
    )

    if (-not $RelativePath) {
        return
    }

    if ($seen.Add($RelativePath)) {
        $orderedFiles.Add($RelativePath)
    }
}

Add-OrderedFile -RelativePath $targetRelPath

foreach ($path in ($localDependencies | Sort-Object)) {
    Add-OrderedFile -RelativePath $path
}

foreach ($path in ($incomingReferences | Sort-Object)) {
    Add-OrderedFile -RelativePath $path
}

$builder = New-Object System.Text.StringBuilder
$generatedUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ss UTC')
$outputRelativePath = Get-RelativePath -Path $OutputPath

[void]$builder.AppendLine('# Case Converter Targeted Code Dump')
[void]$builder.AppendLine()
[void]$builder.AppendLine("Generated: $generatedUtc")
[void]$builder.AppendLine(('Repository: `{0}`' -f $repoRoot))
[void]$builder.AppendLine(('Target tool: `{0}`' -f $targetRelPath))
[void]$builder.AppendLine(('Output file: `{0}`' -f $outputRelativePath))
[void]$builder.AppendLine()

[void]$builder.AppendLine('## Included Files')
foreach ($path in $orderedFiles) {
    [void]$builder.AppendLine(('- `{0}`' -f $path))
}
[void]$builder.AppendLine()

[void]$builder.AppendLine('## Direct Local Dependencies (from target HTML)')
if ($localDependencies.Count -eq 0) {
    [void]$builder.AppendLine('- None detected')
} else {
    foreach ($path in ($localDependencies | Sort-Object)) {
        [void]$builder.AppendLine(('- `{0}`' -f $path))
    }
}
[void]$builder.AppendLine()

[void]$builder.AppendLine('## Incoming References (files that point to the tool)')
if ($incomingReferences.Count -eq 0) {
    [void]$builder.AppendLine('- None detected')
} else {
    foreach ($path in ($incomingReferences | Sort-Object)) {
        [void]$builder.AppendLine(('- `{0}`' -f $path))
    }
}
[void]$builder.AppendLine()

[void]$builder.AppendLine('## External Dependencies (from target HTML)')
if ($externalDependencies.Count -eq 0) {
    [void]$builder.AppendLine('- None detected')
} else {
    foreach ($reference in ($externalDependencies | Sort-Object)) {
        [void]$builder.AppendLine(('- `{0}`' -f $reference))
    }
}
[void]$builder.AppendLine()

[void]$builder.AppendLine('## File Dumps')
[void]$builder.AppendLine()

foreach ($relativePath in $orderedFiles) {
    $fullPath = Join-Path $repoRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath)) {
        [void]$builder.AppendLine(('### `{0}`' -f $relativePath))
        [void]$builder.AppendLine()
        [void]$builder.AppendLine('Missing at dump time.')
        [void]$builder.AppendLine()
        continue
    }

    $language = Get-LanguageTag -Path $fullPath
    $content = Get-NumberedFileContent -Path $fullPath

    [void]$builder.AppendLine(('### `{0}`' -f $relativePath))
    [void]$builder.AppendLine()
    [void]$builder.AppendLine(('```{0}' -f $language))
    [void]$builder.AppendLine($content)
    [void]$builder.AppendLine('```')
    [void]$builder.AppendLine()
}

$outputDirectory = Split-Path -Parent $OutputPath
if ($outputDirectory -and -not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($OutputPath, $builder.ToString(), $utf8NoBom)

Write-Host "Case Converter dump complete: $OutputPath"
Write-Host "Files included: $($orderedFiles.Count)"
