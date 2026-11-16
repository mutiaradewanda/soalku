# Run explicitly in the application shell; Maven tests never import .env.
param([string]$Path = (Join-Path $PSScriptRoot '../.env'))
$ErrorActionPreference = 'Stop'
$allowed = @('DB_URL','DB_USERNAME','DB_PASSWORD','JWT_SECRET','JWT_ISSUER','JWT_TTL',
    'MATERIAL_STORAGE_ROOT','GEMINI_API_KEY','GEMINI_MODEL','GEMINI_TIMEOUT','GEMINI_QUESTIONS_PER_SECTION','LATIHAN_SECONDS_PER_QUESTION')
foreach ($line in (Get-Content -LiteralPath $Path)) {
    if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith('#')) { continue }
    $pair = $line -split '=', 2
    $key = $pair[0].Trim()
    if ($pair.Length -ne 2 -or $key -notin $allowed) {
        throw 'Invalid configuration entry; use only keys from .env.example.'
    }
    [Environment]::SetEnvironmentVariable($key, $pair[1].Trim(), 'Process')
}
Write-Host 'SoalKu local configuration loaded into this shell; values hidden.'
