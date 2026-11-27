#!/usr/bin/env python3
"""The gate for a news post. A post is not finished until this prints PASS for it.

  python3 scripts/content/check-post.py <slug>...        (add --offline to skip opening links)

Runs check-splits.py and check-sources.py, then checks what those do not:
  cover.jpg exists and is exactly 1600x1200 with a cover.800.webp thumbnail · at least one <figure> in the body, every
  image file exists and has width/height · cover credit line is "ภาพปก: by dojojin.tech" · section fits the topic ·
  the body has more than one content section · the page says something about Thailand/Thai users (or says none found) ·
  owner's voice markers (ครับ) · years in พ.ศ. · no emoji · cover-brief.md exists (the cover text was planned from the article).
It cannot judge: whether the Thai reads like the owner, whether the cover text matches the article, whether a logo is real.
Those still need a second agent's voice pass and a human look at the images.
"""
import re, subprocess, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SEC = {"car": "auto"}  # topic -> required section


def run(cmd):
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def check(slug, offline):
    F, W = [], []
    p = ROOT / "src/content/posts/news" / f"{slug}.mdx"
    if not p.exists():
        return [f"ไม่พบ {p}"], []
    t = p.read_text(encoding="utf-8")
    fm, _, body = t.partition("\n---\n")
    get = lambda k: (re.search(rf'^{k}:\s*["\']?(.*?)["\']?\s*$', fm, re.M) or [None, ""])[1]
    rc, out = run(["python3", "scripts/content/check-splits.py", str(p)])
    if not out.rstrip().endswith("OK"):
        F.append("check-splits: " + out[-200:])
    rc, out = run(["python3", "scripts/content/check-sources.py"] + (["--offline"] if offline else []) + [slug])
    for ln in out.splitlines()[1:]:
        (F if "✗" in ln else W).append("check-sources: " + ln.strip(" ✗!"))
    media = ROOT / "public/media/posts/news" / slug
    cov = media / "cover.jpg"
    if not cov.exists():
        F.append("ไม่มี cover.jpg")
    else:
        if Image.open(cov).size != (1600, 1200):
            F.append(f"ปกขนาด {Image.open(cov).size} ต้องเป็น 1600x1200")
        if not (media / "cover.800.webp").exists():
            F.append("ยังไม่ได้รัน thumbs.py (ไม่มี cover.800.webp)")
    figs = re.findall(r"<figure[^>]*>.*?</figure>", body, re.S)
    if not figs:
        F.append("ไม่มีภาพในเนื้อข่าว (<figure>) กฎให้มีอย่างน้อย 1 ภาพ")
    for img in re.findall(r"<img [^>]*>", body):
        src = re.search(r'src="(/media/[^"]+)"', img)
        if src and not (ROOT / "public" / src.group(1).lstrip("/")).exists():
            F.append("ไฟล์ภาพไม่มีจริง: " + src.group(1))
        if "width=" not in img or "height=" not in img:
            F.append("<img> ไม่มี width/height: " + (src.group(1) if src else img[:60]))
    if "- ภาพปก: by dojojin.tech" not in body and not re.search(r"- ภาพปก: [^\n]*by dojojin\.tech", body):
        F.append('เครดิตปกต้องมี "by dojojin.tech" ในหัวข้อที่มาของภาพ')
    topic, section = get("topic"), get("section")
    if topic in SEC and section != SEC[topic]:
        F.append(f"topic: {topic} ต้องใช้ section: {SEC[topic]} (ตอนนี้ {section})")
    if re.search(r"CVE-\d{4}-\d+|ช่องโหว่|โจมตีไซเบอร์|มัลแวร์|ransomware", get("title")) and section != "security":
        F.append(f"ข่าวความปลอดภัยต้องใช้ section: security (ตอนนี้ {section})")
    content_h2 = [h for h in re.findall(r"^## (.+)$", body, re.M) if h.strip() not in ("แหล่งข้อมูล", "ที่มาของภาพ")]
    if len(content_h2) < 2:
        F.append(f"เนื้อข่าวมีหัวข้อเดียว ({len(content_h2)}) ต้องมีอย่างน้อย 2 หัวข้อ เช่น เกิดอะไรขึ้น + กระทบคนไทย/ต้องทำอะไร")
    main = re.split(r"## แหล่งข้อมูล", body)[0]
    if not re.search(r"ในไทย|คนไทย|ผู้ใช้ไทย|ประเทศไทย|ตลาดไทย|ราคาไทย|ภาษาไทย|เมืองไทย", main):
        F.append("ไม่พูดถึงผลกระทบหรือความเกี่ยวข้องกับไทยเลย (ถ้าไม่พบข้อมูล ให้เขียนบอกตรง ๆ)")
    if main.count("ครับ") < 3:
        F.append(f'มี "ครับ" {main.count("ครับ")} ครั้ง: ยังไม่ใช่สำนวนเจ้าของ (ต้องผ่านขั้นเกลาสำนวนโดย agent อีกตัว)')
    if re.search(r"[\U0001F300-\U0001FAFF☀-➿]", t):
        F.append("มี emoji บนหน้าเว็บ")
    ad = [y for y in re.findall(r"(?<![\d/.\-])20[2-4]\d(?![\d/\-])", re.sub(r"https?://\S+|\"[^\"]*[A-Za-z]{4}[^\"]*\"|<a [^>]*>.*?</a>|[A-Za-z][A-Za-z .-]{2,} 20[2-4]\d", " ", main))]
    if len(ad) > 2:
        W.append(f"มีปี ค.ศ. ในเนื้อข่าวราว {len(ad)} จุด (ใช้ พ.ศ. ยกเว้นชื่อเฉพาะ)")
    if not (ROOT / "_sources/posts/news" / slug / "cover-brief.md").exists() and not get("updated"):
        W.append("ไม่มี cover-brief.md (ข้อความบนปกควรวางแผนจากเนื้อข่าว)")
    return F, W


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__); sys.exit(2)
    bad = 0
    for a in args:
        slug = Path(a).stem
        F, W = check(slug, "--offline" in sys.argv)
        print(("FAIL " if F else "PASS ") + slug)
        for x in F: print("  ✗ " + x)
        for x in W: print("  ! " + x)
        bad += bool(F)
    print(f"\n{len(args) - bad}/{len(args)} PASS")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
