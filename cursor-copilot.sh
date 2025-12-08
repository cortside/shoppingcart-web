#!/usr/bin/env bash
# Recursively convert between Cursor .mdc rule files and
# GitHub Copilot *.instructions.md files.
#
# Usage:
#   cursor-copilot.sh to-copilot [root]
#   cursor-copilot.sh to-cursor  [root]
#
# Mapping:
#   Cursor:
#     description: string
#     globs: string | string[]
#     alwaysApply: bool
#
#   Copilot:
#     applyTo: "glob1,glob2"
#     description: string
#

set -euo pipefail

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "Usage: $0 {to-copilot|to-cursor} [root]" >&2
  exit 1
fi

MODE="$1"
ROOT="${2:-.}"

if [ ! -d "$ROOT" ] && [ ! -f "$ROOT" ]; then
  echo "Root path not found: $ROOT" >&2
  exit 1
fi

trim() {
  # shellcheck disable=SC2001
  echo "$1" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'
}

strip_quotes() {
  local s
  s="$(trim "$1")"
  s="${s#\"}"
  s="${s%\"}"
  s="${s#\'}"
  s="${s%\'}"
  printf '%s' "$s"
}

convert_mdc_to_copilot() {
  local in="$1"
  local out="$2"

  local hdr_file body_file
  hdr_file="$(mktemp)"
  body_file="$(mktemp)"

  # Split frontmatter header from body using awk
  awk '
    BEGIN{in_hdr=0; hdr_done=0}
    /^---[ \t]*$/ {
      if (in_hdr==0) { in_hdr=1; next }
      else { hdr_done=1; next }
    }
    {
      if (in_hdr==1 && hdr_done==0) print >"/dev/stdout";
      else if (hdr_done==1) print >"/dev/stderr";
    }
  ' "$in" >"$hdr_file" 2>"$body_file"

  local header body
  header="$(cat "$hdr_file")"
  body="$(cat "$body_file")"
  rm -f "$hdr_file" "$body_file"

  local description=""
  local always=""
  local -a globs=()
  local reading_globs=0

  while IFS= read -r line; do
    local raw
    raw="$(trim "$line")"

    # multiline globs list items
    if [ "$reading_globs" -eq 1 ] && [[ "$raw" == -* ]]; then
      local g="${raw#- }"
      g="$(strip_quotes "$g")"
      [ -n "$g" ] && globs+=("$g")
      continue
    fi

    case "$raw" in
      description:*)
        description="$(trim "${raw#description:}")"
        description="$(strip_quotes "$description")"
        reading_globs=0
        ;;
      globs:*)
        local v
        v="$(trim "${raw#globs:}")"
        if [ -z "$v" ]; then
          # expect following "- pattern" lines
          reading_globs=1
        else
          # single-line or [a, b] style
          v="${v#[}"
          v="${v%]}"
          IFS=',' read -ra parts <<<"$v"
          for p in "${parts[@]}"; do
            p="$(strip_quotes "$p")"
            [ -n "$p" ] && globs+=("$p")
          done
          reading_globs=0
        fi
        ;;
      alwaysApply:*)
        local v
        v="$(echo "${raw#alwaysApply:}" | tr 'A-Z' 'a-z')"
        v="$(trim "$v")"
        if [ "$v" = "true" ]; then
          always="true"
        else
          always="false"
        fi
        reading_globs=0
        ;;
      *)
        reading_globs=0
        ;;
    esac
  done <<< "$header"

  local applyTo=""
  if [ "${#globs[@]}" -gt 0 ]; then
    applyTo="${globs[0]}"
    for ((i=1; i<${#globs[@]}; i++)); do
      applyTo+=",${globs[i]}"
    done
  elif [ "$always" = "true" ]; then
    applyTo="**/*"
  fi

  {
    echo "---"
    if [ -n "$applyTo" ]; then
      echo "applyTo: \"${applyTo}\""
    fi
    if [ -n "$description" ]; then
      echo "description: \"${description}\""
    fi
    echo "---"
    # Drop a single leading blank line in body if present
    printf '%s\n' "$body" | sed '1{/^$/d;}'
  } >"$out"

  echo "Converted Cursor -> Copilot: $in -> $out"
}

convert_copilot_to_mdc() {
  local in="$1"
  local out="$2"

  local hdr_file body_file
  hdr_file="$(mktemp)"
  body_file="$(mktemp)"

  awk '
    BEGIN{in_hdr=0; hdr_done=0}
    /^---[ \t]*$/ {
      if (in_hdr==0) { in_hdr=1; next }
      else { hdr_done=1; next }
    }
    {
      if (in_hdr==1 && hdr_done==0) print >"/dev/stdout";
      else if (hdr_done==1) print >"/dev/stderr";
    }
  ' "$in" >"$hdr_file" 2>"$body_file"

  local header body
  header="$(cat "$hdr_file")"
  body="$(cat "$body_file")"
  rm -f "$hdr_file" "$body_file"

  local description=""
  local applyTo=""

  while IFS= read -r line; do
    local raw
    raw="$(trim "$line")"
    case "$raw" in
      description:*)
        description="$(trim "${raw#description:}")"
        description="$(strip_quotes "$description")"
        ;;
      applyTo:*)
        applyTo="$(trim "${raw#applyTo:}")"
        applyTo="$(strip_quotes "$applyTo")"
        ;;
    esac
  done <<< "$header"

  local alwaysApply="false"
  local -a globs=()

  if [ -n "$applyTo" ]; then
    if [ "$applyTo" = "**" ] || [ "$applyTo" = "**/*" ]; then
      alwaysApply="true"
    else
      # If looks like brace-glob ({src,lib}/...), keep as single pattern
      if [[ "$applyTo" == *"{"*","*"}"* ]]; then
        globs+=("$applyTo")
      else
        IFS=',' read -ra parts <<<"$applyTo"
        for p in "${parts[@]}"; do
          p="$(strip_quotes "$p")"
          [ -n "$p" ] && globs+=("$p")
        done
      fi
    fi
  fi

  {
    echo "---"
    if [ -n "$description" ]; then
      echo "description: \"$description\""
    fi

    if [ "${#globs[@]}" -gt 0 ]; then
      if [ "${#globs[@]}" -eq 1 ]; then
        echo "globs: \"${globs[0]}\""
      else
        echo "globs:"
        for g in "${globs[@]}"; do
          echo "  - \"${g}\""
        done
      fi
      echo "alwaysApply: false"
    else
      # No specific globs
      echo "alwaysApply: ${alwaysApply}"
    fi
    echo "---"
    printf '%s\n' "$body" | sed '1{/^$/d;}'
  } >"$out"

  echo "Converted Copilot -> Cursor: $in -> $out"
}

# Walk the tree and convert files
if [ "$MODE" = "to-copilot" ]; then
  if [ -f "$ROOT" ]; then
    in="$ROOT"
    out="${in%.mdc}.instructions.md"
    convert_mdc_to_copilot "$in" "$out"
  else
    find "$ROOT" -type f -name '*.mdc' -print0 |
      while IFS= read -r -d '' in; do
        out="${in%.mdc}.instructions.md"
        convert_mdc_to_copilot "$in" "$out"
      done
  fi
elif [ "$MODE" = "to-cursor" ]; then
  if [ -f "$ROOT" ]; then
    in="$ROOT"
    out="${in%.instructions.md}.mdc"
    convert_copilot_to_mdc "$in" "$out"
  else
    find "$ROOT" -type f -name '*.instructions.md' -print0 |
      while IFS= read -r -d '' in; do
        out="${in%.instructions.md}.mdc"
        convert_copilot_to_mdc "$in" "$out"
      done
  fi
else
  echo "Unknown mode: $MODE" >&2
  exit 1
fi
