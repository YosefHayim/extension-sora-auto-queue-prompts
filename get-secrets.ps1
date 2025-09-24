# get-secrets.ps1
# Merge AWS secret into .env. Excludes SECRET_NAME/SECRET_ARN (case-insensitive). Sorts A-Z (case-insensitive).
# Secret may be: JSON object OR raw .env text OR SecretBinary (base64).
# Existing .env keys not in the secret are preserved.
# Also normalizes space-separated key=value blobs into one-pair-per-line.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$EnvFile = ".env"

function Load-EnvVarsFromFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) { throw "Missing $Path. Add SECRET_NAME=... and SECRET_ARN=... first." }
    Get-Content $Path | ForEach-Object {
        if ($_ -match '^\s*([^#=\s]+)\s*=\s*(.*)\s*$') {
            $k = $matches[1]; $v = $matches[2].Trim()
            if ($v -match '^"(.*)"$') { $v = $matches[1] }
            elseif ($v -match "^'(.*)'$") { $v = $matches[1] }
            Set-Item -Path "env:$k" -Value $v
        }
    }
}

function Normalize-EnvSeparators {
    param([Parameter(Mandatory)][string]$Text)
    # If we get "A=1 B=2 C=3" turn spaces between pairs into newlines.
    # Only split on whitespace that precedes KEY= pattern.
    $nl = [Environment]::NewLine
    ($Text -replace "(?<=\S)\s+(?=[A-Za-z_][A-Za-z0-9_]*\s*=\s*)", $nl)
}

function Parse-DotenvText {
    param([Parameter(Mandatory)][string]$Text)
    $pairs = @{}
    foreach ($line in ( $Text -split "`r?`n" )) {
        if ($line -match '^\s*#') { continue }
        if ($line -match '^\s*$') { continue }
        # allow optional leading "export "
        if ($line -match '^\s*(?:export\s+)?([^#=\s]+)\s*=\s*(.*)\s*$') {
            $k = $matches[1]
            $v = $matches[2]
            if ($v -match '^"(.*)"$') { $v = $matches[1] }
            elseif ($v -match "^'(.*)'$") { $v = $matches[1] }
            $pairs[$k] = $v
        }
    }
    $pairs
}

function Format-EnvValue {
    param([Parameter(Mandatory)][string]$Value)
    # Quote values that contain spaces, tabs, #, quotes, or leading/trailing whitespace.
    $needsQuote = ($Value -match '\s' -or $Value -match '[#"]' -or $Value -match "^\s" -or $Value -match "\s$")
    if ($needsQuote) {
        $escaped = $Value -replace '"', '\"'
        return '"{0}"' -f $escaped
    }
    return $Value
}

# 1) Load control vars
Load-EnvVarsFromFile -Path $EnvFile
if (-not $env:SECRET_NAME) { throw "SECRET_NAME not set in $EnvFile" }
if (-not $env:SECRET_ARN)  { throw "SECRET_ARN not set in $EnvFile" }

# 2) Load existing .env into map
$existing = [System.Collections.Generic.Dictionary[string,string]]::new([StringComparer]::OrdinalIgnoreCase)
if (Test-Path $EnvFile) {
    foreach ($line in (Get-Content -Raw $EnvFile) -split "`r?`n") {
        if ($line -match '^\s*(?:export\s+)?([^#=\s]+)\s*=\s*(.*)\s*$') {
            $existing[$matches[1]] = $matches[2]
        }
    }
}

# 3) Fetch secret (prefer SecretString; fall back to SecretBinary)
$secretString = aws secretsmanager get-secret-value --secret-id $env:SECRET_ARN --query SecretString --output text 2>$null
if ($LASTEXITCODE -ne 0) { $secretString = $null }

if (-not $secretString -or $secretString -eq 'None') {
    $secretBinaryB64 = aws secretsmanager get-secret-value --secret-id $env:SECRET_ARN --query SecretBinary --output text
    if ($LASTEXITCODE -ne 0 -or -not $secretBinaryB64 -or $secretBinaryB64 -eq 'None') {
        throw "Failed fetching secret for $($env:SECRET_ARN)"
    }
    $bytes = [Convert]::FromBase64String(([string]$secretBinaryB64))
    $secretString = [System.Text.Encoding]::UTF8.GetString($bytes)
}

# Coerce to a single string even if AWS CLI yields an array of lines
$secretString = [string]::Join("`n", @($secretString))

# 4) Convert secret -> pairs
$secretPairs = [System.Collections.Generic.Dictionary[string,string]]::new([StringComparer]::OrdinalIgnoreCase)
$parsedOk = $true
try {
    $obj = $secretString | ConvertFrom-Json -ErrorAction Stop
} catch { $parsedOk = $false }

if ($parsedOk -and $obj -is [psobject]) {
    foreach ($p in $obj.PSObject.Properties) {
        $k = [string]$p.Name; $v = $p.Value
        if ($null -eq $v) { $secretPairs[$k] = "" }
        elseif ($v -is [string] -or $v -is [int] -or $v -is [double] -or $v -is [decimal] -or $v -is [bool]) {
            $secretPairs[$k] = [string]$v
        }
        # skip arrays/objects
    }
} else {
    # Treat as raw .env content; normalize spaces between pairs to newlines first.
    $normalized = Normalize-EnvSeparators -Text ([string]$secretString)
    $parsed = Parse-DotenvText -Text $normalized
    foreach ($k in $parsed.Keys) { $secretPairs[$k] = $parsed[$k] }
}

# 5) Remove control/debug keys; never emit them (case-insensitive)
foreach ($h in @($secretPairs, $existing)) {
    foreach ($k in @($h.Keys)) {
        if ($k -imatch '^secret_name$' -and $h[$k] -imatch 'all\s+secr?ets\s+rec(ei|ie)ved') { [void]$h.Remove($k) }
    }
}

# 6) Merge: overlay secret on existing, sort A-Z (by first letter, case-insensitive)
foreach ($k in $secretPairs.Keys) { $existing[$k] = $secretPairs[$k] }

$lines =
    $existing.GetEnumerator() |
    Sort-Object Key |
    ForEach-Object {
        $k = $_.Key.Trim()
        $v = [string]$_.Value
        "$k=$(Format-EnvValue -Value $v)"
    }

# 7) Write atomically, ensure trailing newline
$temp = [System.IO.Path]::GetTempFileName()
$nl = [System.Environment]::NewLine
[System.IO.File]::WriteAllText($temp, ($lines -join $nl) + $nl, [System.Text.Encoding]::UTF8)
Move-Item -Force $temp $EnvFile

Write-Output ("updated: {0} ({1} keys, sorted A-Z; SECRET_NAME/SECRET_ARN excluded)" -f $EnvFile, $existing.Count)
