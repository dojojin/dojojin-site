// x.jpg under /media/ has an 800px WebP twin x.800.webp (scripts/content/thumbs.py).
// srcset lets phones and grid cards load the small one; zoom/modal still uses the full JPEG.
export const srcset = (src) => (/^\/media\/.*\.jpg$/.test(src) ? `${src.replace(/\.jpg$/, '.800.webp')} 800w, ${src} 1600w` : undefined);
