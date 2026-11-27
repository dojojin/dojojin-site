#!/usr/bin/env bash
# Generate or edit one image with whichever image tool is available, with a cooldown between calls.
#   scripts/content/gen_image.sh --prompt prompt.txt --out cover.png [-i ref1.png -i ref2.jpg] [--engine codex|agy]
# Engines:  codex = ChatGPT image through `codex exec`      agy = NanoBanana through `agy -p`
# Order: --engine, else $IMAGE_ENGINES, else "codex agy". Working in Antigravity: IMAGE_ENGINES="agy codex" (NanoBanana first,
# ChatGPT when its quota is used up; NanoBanana allows roughly 14 images per 5 hours, observed 27 Nov 2026).
# Cooldown: waits so that two calls to the same engine are at least GAP seconds apart (shared lock in /tmp, so
# parallel agents queue instead of hitting HTTP 429 / quota_cooldown). On a refusal it backs off and retries,
# then falls through to the next engine. Exit 0 = image written to --out. Look at every image before using it.
set -uo pipefail
PROMPT="" OUT="" ENG="" REFS=()
while [ $# -gt 0 ]; do case "$1" in
  --prompt) PROMPT="$2"; shift 2;; --out) OUT="$2"; shift 2;; --engine) ENG="$2"; shift 2;;
  -i) REFS+=("$2"); shift 2;; *) echo "unknown arg $1" >&2; exit 2;; esac; done
[ -f "$PROMPT" ] && [ -n "$OUT" ] || { echo "usage: gen_image.sh --prompt file --out file [-i ref]... [--engine codex|agy]" >&2; exit 2; }
ENGINES="${ENG:-${IMAGE_ENGINES:-codex agy}}"
BIN="$HOME/.local/bin"; export PATH="$HOME/.gemini/antigravity/bin:$BIN:$PATH"
OUT="$(realpath -m "$OUT")"; WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
declare -A GAP=([codex]=25 [agy]=90)          # seconds between calls to the same engine
BACKOFF=(120 300)                             # waits after a refusal before retrying the same engine

cooldown() {  # $1 = engine; serialises callers and enforces the gap
  local stamp="/tmp/dojojin-gen-image.$1.stamp" now last wait
  exec 9>"/tmp/dojojin-gen-image.$1.lock"; flock 9
  now=$(date +%s); last=$(cat "$stamp" 2>/dev/null || echo 0); wait=$(( ${GAP[$1]} - (now - last) ))
  [ "$wait" -gt 0 ] && { echo "cooldown $1: ${wait}s" >&2; sleep "$wait"; }
}
release() { date +%s > "/tmp/dojojin-gen-image.$1.stamp"; flock -u 9; }

try() {  # $1 = engine; returns 0 if $WORK/out.png exists afterwards
  rm -f "$WORK"/out.*; cp "$PROMPT" "$WORK/prompt.txt"
  local n=0 args=(); for r in "${REFS[@]}"; do n=$((n+1)); cp "$r" "$WORK/ref$n.${r##*.}"; done
  { echo; echo "Save the final image as out.png in the current directory. Use your built-in image generation tool; do not write code to draw it."; } >> "$WORK/prompt.txt"
  case "$1" in
    codex) for f in "$WORK"/ref*; do [ -e "$f" ] && args+=(-i "$f"); done
           (cd "$WORK" && timeout 600 "$BIN/codex" exec --skip-git-repo-check -s workspace-write "${args[@]}" - < prompt.txt) > "$WORK/log.txt" 2>&1 ;;
    agy)   (cd "$WORK" && timeout 600 "$BIN/agy" -p "Read prompt.txt in $WORK and follow it. Reference images, if any, are the ref* files in the same folder. Generate exactly ONE image with your image generation tool (NanoBanana): one call, no variants, no retries (each image uses quota; a refusal must be reported, not retried). Save it as $WORK/out.png. Reply DONE when the file exists." \
             --add-dir "$WORK" --dangerously-skip-permissions --disable-slash-commands --print-timeout 540s) > "$WORK/log.txt" 2>&1 ;;
    *) echo "unknown engine $1" >&2; return 2 ;;
  esac
  local f; f=$(ls "$WORK"/out.* 2>/dev/null | head -1); [ -n "$f" ] && [ -s "$f" ] && mv "$f" "$WORK/final" && return 0
  # long quota window ("quota will reset after 2h47m", "out of credits"): retrying in minutes is useless -> next engine now
  grep -qiE "reset after [0-9]+h|resets in [0-9]+h|out of credits" "$WORK/log.txt" && return 76
  grep -qiE "429|quota|rate.?limit|cooldown|capacity" "$WORK/log.txt" && return 75   # short refusal: worth a retry
  return 1
}

for e in $ENGINES; do
  for attempt in 0 1 2; do
    cooldown "$e"; try "$e"; rc=$?; release "$e"
    if [ "$rc" -eq 0 ]; then mkdir -p "$(dirname "$OUT")"; mv "$WORK/final" "$OUT"; echo "ok engine=$e out=$OUT"; exit 0; fi
    [ "$rc" -eq 76 ] && { echo "$e: quota used up for hours, switching engine" >&2; break; }
    [ "$rc" -eq 75 ] && [ "$attempt" -lt 2 ] || break
    echo "$e refused (attempt $((attempt+1))): waiting ${BACKOFF[$attempt]}s" >&2; sleep "${BACKOFF[$attempt]}"
  done
  echo "engine $e failed: $(tail -2 "$WORK/log.txt" | cut -c1-200)" >&2
done
exit 1
