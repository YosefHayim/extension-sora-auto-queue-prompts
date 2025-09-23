# get-secret-to-dotenv.ps1
# Reads SECRET_NAME and SECRET_ARN from .env, fetches the secret via AWS CLI,
# and updates .env. If the secret is JSON, flattens top-level pairs to KEY=VALUE lines.
# Outputs: created / updated / no-op

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$EnvFile = ".env"

function Load-EnvVarsFromFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) { throw "Missing $Path. Add SECRET_NAME=... and SECRET_ARN=... first." }
    Get-Content $Path | ForEach-Object {
        if ($_ -match '^\s*([^#=\s]+)\s*=\s*(.*)\s*$') {
            $k = $matches[1]
            $v = $matches[2].Trim()
            # Strip surrounding quotes if present
            if ($v -match '^"(.*)"$') { $v = $matches[1] }
            elseif ($v -match "^'(.*)'$") { $v = $matches[1] }
            Set-Item -Path "env:$k" -Value $v
        }
    }
}

function Ensure-File {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType File -Path $Path | Out-Null
        return $true
    }
    return $false
}

function Upsert-Line {
    param(
        [string]$Path,
        [string]$Key,
        [string]$Value
    )
    $changed = $false
    $line = "$Key=$Value"

    $content = Get-Content $Path -Raw
    if ($content -match "^[`t` ]*$([regex]::Escape($Key))=") {
        $new = [System.Text.RegularExpressions.Regex]::Replace(
            $content,
            "^[`t` ]*$([regex]::Escape($Key))=.*$",
            [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $line },
            [System.Text.RegularExpressions.RegexOptions]::Multiline
        )
        if ($new -ne $content) {
            $new | Set-Content $Path -NoNewline
            $changed = $true
        }
    } else {
        Add-Content $Path $line
        $changed = $true
    }
    return $changed
}

function Is-Primitive {
    param($v)
    return ($null -eq $v) -or ($v -is [string]) -or ($v -is [int]) -or ($v -is [double]) -or ($v -is [bool]) -or ($v -is [decimal])
}

# Load required env vars from .env
Load-EnvVarsFromFile -Path $EnvFile
if (-not $env:SECRET_NAME) { throw "SECRET_NAME not set in $EnvFile" }
if (-not $env:SECRET_ARN)  { throw "SECRET_ARN not set in $EnvFile" }

# Fetch secret (SecretString)
$secretValue = aws secretsmanager get-secret-value --secret-id $env:SECRET_ARN --query SecretString --output text

$created = Ensure-File -Path $EnvFile
$changed = $false

# Try to parse JSON; if not JSON, fall back to single key upsert
$parsed = $null
$parsedOk = $true
try {
    $parsed = $secretValue | ConvertFrom-Json
} catch {
    $parsedOk = $false
}

if ($parsedOk -and $parsed -is [psobject]) {
    foreach ($prop in $parsed.PSObject.Properties) {
        $k = [string]$prop.Name
        $v = $prop.Value
        if (Is-Primitive $v) {
            $vStr = if ($null -eq $v) { "" } else { [string]$v }
            if (Upsert-Line -Path $EnvFile -Key $k -Value $vStr) { $changed = $true }
        }
        # Skip arrays/objects
    }
} else {
    # Non-JSON secret: write to SECRET_NAME key
    $val = [string]$secretValue
    if (Upsert-Line -Path $EnvFile -Key $env:SECRET_NAME -Value $val) { $changed = $true }
}

if ($created) {
    Write-Output "created: $EnvFile"
} elseif ($changed) {
    Write-Output "updated: $EnvFile"
} else {
    Write-Output "no-op: $EnvFile"
}
