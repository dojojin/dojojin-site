#!/usr/bin/env bash
# Re-render every infographic of the given news slugs (after a base.css change) and fix the height="" in the .mdx.
set -euo pipefail
cd /home/vigil-central/dojojin-site
for slug in "$@"; do
  for html in _sources/posts/news/$slug/ig/ig-*.html; do
    n=$(basename "$html" .html); out=public/media/posts/news/$slug/$n.jpg
    size=$(node scripts/content/render-infographic.mjs "$html" "$out"); h=${size#1600x}
    sed -i -E "s#(src=\"/media/posts/news/$slug/$n.jpg\" width=\"1600\" height=\")[0-9]+#\1$h#" src/content/posts/news/$slug.mdx
    rm -f public/media/posts/news/$slug/$n.800.webp
    echo "$slug/$n $size"
  done
done
