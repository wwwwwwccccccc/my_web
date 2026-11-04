param(
  [string]$ProjectName = 'my-web-6h5',
  [string]$DatabaseName = 'portfolio-visits'
)

$ErrorActionPreference = 'Continue'
$env:npm_config_loglevel = 'error'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Invoke-Wrangler {
  param([string[]]$Arguments)
  $output = & npx.cmd --yes wrangler@latest @Arguments 2>&1 | Out-String
  [pscustomobject]@{
    ExitCode = $LASTEXITCODE
    Output = $output
  }
}

function Run-Wrangler {
  param([string[]]$Arguments)
  $result = Invoke-Wrangler $Arguments
  if ($result.Output) { Write-Host $result.Output.TrimEnd() }
  if ($result.ExitCode -ne 0) {
    throw "wrangler failed: $($Arguments -join ' ')"
  }
}

function Find-DatabaseId {
  param([string]$Text, [string]$Name)
  if (-not $Text) { return $null }

  $clean = $Text -replace "\x1B\[[0-9;]*[A-Za-z]", ''
  $idPattern = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'

  # create output: database_id = "..."  or  "database_id": "..."
  $direct = [regex]::Match($clean, "database_id[`"']?\s*[:=]\s*[`"']?($idPattern)")
  if ($direct.Success) { return $direct.Groups[1].Value }

  # list/table/JSON: look around the database name
  $nameIndex = $clean.IndexOf($Name, [StringComparison]::OrdinalIgnoreCase)
  if ($nameIndex -ge 0) {
    $start = [Math]::Max(0, $nameIndex - 600)
    $length = [Math]::Min(1200, $clean.Length - $start)
    $window = $clean.Substring($start, $length)
    $near = [regex]::Match($window, $idPattern)
    if ($near.Success) { return $near.Value }
  }

  # Last resort: exactly one UUID in the output.
  $all = [regex]::Matches($clean, $idPattern)
  if ($all.Count -eq 1) { return $all[0].Value }
  return $null
}

Write-Host ''
Write-Host 'Cloudflare D1 visit counter setup' -ForegroundColor Cyan
Write-Host '=================================' -ForegroundColor DarkGray

$whoResult = Invoke-Wrangler @('whoami')
$who = $whoResult.Output
if ($whoResult.ExitCode -ne 0 -or $who -match 'not authenticated|not logged|You are not') {
  Write-Host ''
  Write-Host 'Wrangler is not logged in.' -ForegroundColor Yellow
  Write-Host 'Run this first:' -ForegroundColor Yellow
  Write-Host '  npx wrangler@latest login' -ForegroundColor White
  Write-Host ''
  exit 1
}

Write-Host 'Wrangler login: OK' -ForegroundColor Green

$databaseId = $null

$listResult = Invoke-Wrangler @('d1', 'list', '--json')
if ($listResult.ExitCode -eq 0) {
  $databaseId = Find-DatabaseId -Text $listResult.Output -Name $DatabaseName
}

if (-not $databaseId) {
  Write-Host "Creating D1 database: $DatabaseName" -ForegroundColor Cyan
  $createResult = Invoke-Wrangler @('d1', 'create', $DatabaseName)
  if ($createResult.Output) {
    Write-Host $createResult.Output.TrimEnd()
  }
  $databaseId = Find-DatabaseId -Text $createResult.Output -Name $DatabaseName

  if (-not $databaseId) {
    # The database may have been created even if output parsing failed.
    Start-Sleep -Seconds 2
    $retryResult = Invoke-Wrangler @('d1', 'list', '--json')
    $databaseId = Find-DatabaseId -Text $retryResult.Output -Name $DatabaseName
  }
}

if (-not $databaseId) {
  Write-Host ''
  Write-Host 'Could not find/create the D1 database automatically.' -ForegroundColor Yellow
  Write-Host 'Run this and paste the output if you want me to continue:' -ForegroundColor Yellow
  Write-Host '  npx wrangler@latest d1 list' -ForegroundColor White
  Write-Host ''
  Write-Host "If the database already exists, you can also bind it by name in the dashboard:" -ForegroundColor Yellow
  Write-Host "  Workers & Pages -> $ProjectName -> Settings -> Functions -> D1 database bindings" -ForegroundColor White
  Write-Host "  Variable name: VISITS_DB" -ForegroundColor White
  Write-Host "  Database: $DatabaseName" -ForegroundColor White
  exit 1
}

Write-Host "D1 database id: $databaseId" -ForegroundColor Green

$configPath = Join-Path $root 'wrangler.toml'
if (Test-Path -LiteralPath $configPath) {
  $backup = "$configPath.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item -LiteralPath $configPath -Destination $backup
  Write-Host "Backed up existing wrangler.toml -> $backup" -ForegroundColor DarkGray
}

$compatibilityDate = (Get-Date).ToString('yyyy-MM-dd')
$config = @"
name = "$ProjectName"
compatibility_date = "$compatibilityDate"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "VISITS_DB"
database_name = "$DatabaseName"
database_id = "$databaseId"
"@
Set-Content -LiteralPath $configPath -Value $config -Encoding UTF8
Write-Host 'Wrote wrangler.toml with VISITS_DB binding.' -ForegroundColor Green

Write-Host 'Applying remote D1 migration...' -ForegroundColor Cyan
Run-Wrangler @(
  'd1', 'execute', $DatabaseName,
  '--remote',
  '--file=./migrations/0001_visits.sql'
)
Write-Host 'D1 migration: OK' -ForegroundColor Green

Write-Host 'Building site...' -ForegroundColor Cyan
& npm.cmd run build
if ($LASTEXITCODE -ne 0) {
  throw 'npm run build failed'
}
Write-Host 'Build: OK' -ForegroundColor Green

Write-Host ''
Write-Host 'Done. Next steps:' -ForegroundColor Cyan
Write-Host '1. Commit wrangler.toml and push, or redeploy with your normal Pages flow.' -ForegroundColor White
Write-Host "2. If Cloudflare does not pick up the binding from wrangler.toml, open:" -ForegroundColor White
Write-Host "   Workers & Pages -> $ProjectName -> Settings -> Functions -> D1 database bindings" -ForegroundColor White
Write-Host '   Variable name: VISITS_DB' -ForegroundColor White
Write-Host "   Database: $DatabaseName" -ForegroundColor White
Write-Host '3. Test:' -ForegroundColor White
Write-Host "   curl.exe -i -X POST https://$ProjectName.pages.dev/api/visit" -ForegroundColor White
Write-Host ''
