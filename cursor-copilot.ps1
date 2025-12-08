#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Recursively convert between Cursor .mdc rule files and GitHub Copilot *.instructions.md files.

.DESCRIPTION
  Modes:
    to-copilot : .mdc              -> .instructions.md
    to-cursor  : .instructions.md  -> .mdc

  Mapping:
    Cursor:
      description: string
      globs: string | string[]
      alwaysApply: bool

    Copilot:
      applyTo: "glob1,glob2"
      description: string
#>

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet("to-copilot", "to-cursor")]
  [string] $Mode,

  [Parameter(Mandatory = $false, Position = 1)]
  [string] $Root = "."
)

function Split-HeaderBody {
  param([string] $Content)

  if ($Content -match "(?s)^---\s*\r?\n(.*?)\r?\n---\s*\r?\n?(.*)$") {
    return [pscustomobject]@{
      Header = $matches[1]
      Body   = $matches[2]
    }
  } else {
    throw "File does not contain a YAML frontmatter header delimited by '---'."
  }
}

function Get-PatternsFromApplyTo {
  param([string] $ApplyTo)

  $apply = $ApplyTo.Trim().Trim('"').Trim("'")

  # If using brace-style globs with commas (e.g. {src,lib}/**/*.tsx),
  # don't split – treat as a single pattern.
  if ($apply -match "{.*," -and $apply -match "}") {
    return ,$apply
  }

  if ($apply -like "*,*") {
    return $apply.Split(",") |
      ForEach-Object { $_.Trim() } |
      Where-Object { $_ -ne "" }
  }

  return ,$apply
}

function Convert-MdcToCopilot {
  param([string] $InPath)

  $content = Get-Content -Raw -LiteralPath $InPath
  $parts   = Split-HeaderBody -Content $content
  $meta    = $parts.Header | ConvertFrom-Yaml

  $description = $meta.description
  $globs       = $meta.globs
  $alwaysApply = $meta.alwaysApply

  # Normalize globs to an array of strings
  $patterns = @()
  if ($null -ne $globs) {
    if ($globs -is [System.Collections.IEnumerable] -and -not ($globs -is [string])) {
      $patterns = @($globs)
    } else {
      $patterns = @($globs)
    }
  }

  $applyTo = $null
  if ($patterns.Count -gt 0) {
    $applyTo = ($patterns -join ",")
  } elseif ($alwaysApply -eq $true) {
    # No globs, but alwaysApply is true: apply to everything
    $applyTo = "**/*"
  }

  $copilotMeta = [ordered]@{}
  if ($applyTo)     { $copilotMeta.applyTo     = $applyTo }
  if ($description) { $copilotMeta.description = $description }

  $copilotHeader = ($copilotMeta | ConvertTo-Yaml).TrimEnd()

  $outContent = @(
    "---"
    $copilotHeader
    "---"
    $parts.Body.TrimStart()
  ) -join "`n"

  $outPath =
    if ($InPath -like "*.mdc") {
      $InPath -replace '\.mdc$', '.instructions.md'
    } else {
      "${InPath}.instructions.md"
    }

  Set-Content -LiteralPath $outPath -Value $outContent -NoNewline
  Write-Host "Converted Cursor -> Copilot: $InPath -> $outPath"
}

function Convert-CopilotToMdc {
  param([string] $InPath)

  $content = Get-Content -Raw -LiteralPath $InPath
  $parts   = Split-HeaderBody -Content $content
  $meta    = $parts.Header | ConvertFrom-Yaml

  $applyTo     = $meta.applyTo
  $description = $meta.description

  $cursorMeta = [ordered]@{}

  if ($description) {
    $cursorMeta.description = $description
  }

  $patterns   = @()
  $alwaysTrue = $false

  if ($applyTo) {
    $applyTrim = $applyTo.Trim().Trim('"').Trim("'")

    if ($applyTrim -eq "**" -or $applyTrim -eq "**/*") {
      # Whole repo – treat as alwaysApply
      $alwaysTrue = $true
    } else {
      $patterns = Get-PatternsFromApplyTo -ApplyTo $applyTrim
    }
  }

  if ($patterns.Count -gt 0) {
    $cursorMeta.globs = $patterns
    $cursorMeta.alwaysApply = $false
  } elseif ($alwaysTrue) {
    $cursorMeta.alwaysApply = $true
  }

  $cursorHeader = ($cursorMeta | ConvertTo-Yaml).TrimEnd()

  $outContent = @(
    "---"
    $cursorHeader
    "---"
    $parts.Body.TrimStart()
  ) -join "`n"

  $outPath =
    if ($InPath -like "*.instructions.md") {
      $InPath -replace '\.instructions\.md$', '.mdc'
    } else {
      "${InPath}.mdc"
    }

  Set-Content -LiteralPath $outPath -Value $outContent -NoNewline
  Write-Host "Converted Copilot -> Cursor: $InPath -> $outPath"
}

function Process-Tree {
  param([string] $Mode, [string] $RootPath)

  if (-not (Test-Path -LiteralPath $RootPath)) {
    throw "Root path not found: $RootPath"
  }

  if ($Mode -eq "to-copilot") {
    Get-ChildItem -LiteralPath $RootPath -Recurse -File -Filter '*.mdc' |
      ForEach-Object { Convert-MdcToCopilot -InPath $_.FullName }
  } else {
    Get-ChildItem -LiteralPath $RootPath -Recurse -File -Filter '*.instructions.md' |
      ForEach-Object { Convert-CopilotToMdc -InPath $_.FullName }
  }
}

Process-Tree -Mode $Mode -RootPath $Root
