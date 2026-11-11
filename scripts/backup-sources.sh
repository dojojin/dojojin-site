#!/usr/bin/env bash
# Daily zip of _sources/ (gitignored originals with GPS) into ~/backups/dojojin-sources/; keeps 7 days.
# Run by the user's crontab. Owner copies the zips off-machine himself.
set -euo pipefail
SRC=/home/vigil-central/dojojin-site/_sources
OUT=/home/vigil-central/backups/dojojin-sources
mkdir -p "$OUT"
f="$OUT/sources-$(date +%F).zip"
# -0: photos are already compressed, storing is ~as small and much faster
cd "$(dirname "$SRC")" && zip -q -r -0 "$f.part" "$(basename "$SRC")" && mv "$f.part" "$f"
find "$OUT" -name 'sources-*.zip' -mtime +6 -delete
echo "$(date '+%F %T') ok $(du -h "$f" | cut -f1) $f" >> "$OUT/backup.log"
