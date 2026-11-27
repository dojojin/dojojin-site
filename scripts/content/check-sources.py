#!/usr/bin/env python3
"""Check the sources of news posts. Run before handing a post to the owner (editorial-standard.md, section 7).

  python3 scripts/content/check-sources.py <slug>...        # checks + opens every source link
  python3 scripts/content/check-sources.py --offline <slug>...   # skips the network part

FAIL (exit 1) when:
  1. sourceUrl is missing, is only a site's front page, or is not listed under "## แหล่งข้อมูล"
  2. the post has no "## แหล่งข้อมูล" section, or it holds no external link
  3. an outlet named in sourceName or meta has no link from that outlet in the sources section
  4. the source rule fails on paper: fewer than 2 different sites in the sources section and no official-looking source
     (unless the slug is listed, with the owner's decision, in scripts/content/source-exceptions.txt)
  5. a source link does not open (HTTP 404/410, DNS failure)
  6. `_sources/posts/news/<slug>/facts.md` is missing (new posts must keep the fact sheet)
WARN (does not fail): a link answers 401/403/429/5xx or times out (sites that block scripts: open it by hand),
  process talk left on the page, AI tool names in credits/alt, years written as ค.ศ. 20xx next to Thai month names.
This script cannot tell whether two outlets are independent, or whether the page really says what the post claims.
"""
from __future__ import annotations
import concurrent.futures, re, sys, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"}
OFFICIAL_HINT = re.compile(r"\.gov\b|\.go\.th\b|sec\.cloudapps\.cisco|newsroom|/press|/security|advisor|changelog|"
                           r"/releases|release-notes|blog\.google|blogs\.(windows|microsoft|nvidia)|devblogs|"
                           r"support\.|help\.|docs\.|ir\.|investor|prnewswire|businesswire|github\.com|code\.visualstudio\.com|/updates/", re.I)
ALIAS = {  # outlet name fragment (lower case) -> domain fragment
    "financial times": "ft.com", "wall street journal": "wsj.com", "the verge": "theverge.com", "tom's hardware": "tomshardware",
    "the record": "therecord", "the register": "theregister", "the hacker news": "thehackernews", "the national": "thenationalnews",
    "ars technica": "arstechnica", "help net security": "helpnetsecurity", "android authority": "androidauthority",
    "windows latest": "windowslatest", "people news": "peoplenews", "al jazeera": "aljazeera", "brand inside": "brandinside",
    "u.s. news": "usnews", "tech times": "techtimes", "9to5google": "9to5google", "9to5mac": "9to5mac"}
PROCESS = re.compile(r"ผมเปิด(หน้า|อ่าน|ลิงก์)|เปิดหน้านี้(ตรง)?ไม่ได้|หน้าที่ผมเปิด|ตอนผมตรวจ|\b40[34]\b(?! *(บาท|ล้าน|คน|คัน))|ต้นฉบับ(?!เป็นภาพ)")
AI_WORDS = re.compile(r"(^- [^\n]*(ภาพปก|ภาพประกอบ|ภาพใน|เครดิต)[^\n]*|alt=\"[^\"]*|coverAlt:[^\n]*)\b(สร้างด้วย AI|AI[- ]generated|Codex|ChatGPT|NanoBanana|Canva|Midjourney|DALL)", re.I | re.M)  # credit lines and alt text only


def _exceptions() -> dict[str, str]:
    f = Path(__file__).with_name("source-exceptions.txt")
    out = {}
    if f.exists():
        for ln in f.read_text(encoding="utf-8").splitlines():
            if ln.strip() and not ln.startswith("#"):
                k, _, v = ln.partition("|")
                out[k.strip()] = v.strip()
    return out


EXCEPTIONS = _exceptions()


def norm(u: str) -> str:
    return u.split("#")[0].rstrip("/").replace("http://", "https://")


def site(u: str) -> str:
    h = urllib.parse.urlparse(u).netloc.lower()
    h = re.sub(r"^(www|m|amp)\.", "", h)
    parts = h.split(".")
    return ".".join(parts[-3:] if len(parts) > 2 and parts[-2] in ("co", "com", "go", "or", "ac") else parts[-2:])


def opens(u: str) -> tuple[str, str]:
    """ok / dead / blocked. Some sites answer 404 to HEAD or to Python but 200 to a browser, so a link is only
    called dead when a plain GET and then curl both say 404/410 (or the host does not exist)."""
    import subprocess
    code = "?"
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=20) as r:
            return "ok", str(r.status)
    except urllib.error.HTTPError as e:
        code = str(e.code)
    except Exception as e:  # DNS, TLS, timeout
        code = type(e).__name__ + (":dns" if "Name or service" in str(e) or "nodename" in str(e) else "")
    try:
        c = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-L", "-m", "25", "-A", UA["User-Agent"], u],
                           capture_output=True, text=True, timeout=40).stdout.strip()
    except Exception:
        c = ""
    if c.startswith("2"):
        return "ok", c
    if c in ("404", "410") or (c == "000" and code.endswith(":dns")):
        return "dead", c if c != "000" else "ไม่พบโดเมน"
    return "blocked", c or code


def check(slug: str, online: bool) -> tuple[list[str], list[str]]:
    fails, warns = [], []
    p = ROOT / "src/content/posts/news" / f"{slug}.mdx"
    if not p.exists():
        return [f"ไม่พบไฟล์ {p}"], []
    t = p.read_text(encoding="utf-8")
    fm, _, body = t.partition("\n---\n")
    get = lambda k: (re.search(rf'^{k}:\s*["\']?(.*?)["\']?\s*$', fm, re.M) or [None, ""])[1]
    src_url, src_name, meta = get("sourceUrl"), get("sourceName"), get("meta")
    m = re.search(r"## แหล่งข้อมูล(.*?)(?=<section|\Z)", body, re.S)
    sec = m.group(1) if m else ""
    links = [u for u in re.findall(r'https?://[^\s"\')<>]+', sec)]
    ext = [u for u in links if "dojojin.tech" not in u]
    if not src_url:
        fails.append("ไม่มี sourceUrl")
    elif urllib.parse.urlparse(src_url).path.strip("/") == "":
        fails.append(f"sourceUrl เป็นแค่หน้าแรกของเว็บ: {src_url}")
    elif norm(src_url) not in {norm(u) for u in ext}:
        fails.append("sourceUrl ไม่อยู่ในหัวข้อแหล่งข้อมูล")
    if not m:
        fails.append('ไม่มีหัวข้อ "## แหล่งข้อมูล"')
    elif not ext:
        fails.append("หัวข้อแหล่งข้อมูลไม่มีลิงก์ภายนอก")
    sites = {site(u) for u in ext}
    hay = (sec + " " + " ".join(sites)).lower()
    names = [n.strip(" .") for n in re.split(r",| และ |·|\(|\)|ตามที่|เรียบเรียงจาก|ผ่าน|นำเสนอ|รายงานของ|ประกาศของ|คำสั่ง", src_name + "," + meta.split("·")[0])]
    for n in dict.fromkeys(x for x in names if re.search(r"[A-Za-z]{3}", x)):
        key = n.lower()
        dom = next((d for a, d in ALIAS.items() if a in key), None)
        words = [w for w in re.findall(r"[a-z0-9]{3,}", key) if w not in ("the", "and", "news", "blog", "com")]
        hit = (dom and dom in hay) or any(w in hay.replace(" ", "") or w in hay for w in words[:2])
        if not hit:
            fails.append(f'"{n}" อยู่ใน sourceName/meta แต่ไม่มีลิงก์หรือชื่อในหัวข้อแหล่งข้อมูล')
    official = any(OFFICIAL_HINT.search(u) for u in ext)
    exc = EXCEPTIONS.get(slug)
    if ext and len(sites) < 2 and not official and exc:
        warns.append(f"แหล่งเดียว แต่เจ้าของอนุมัติไว้: {exc}")
    elif ext and len(sites) < 2 and not official:
        fails.append(f"แหล่งข้อมูลมีเว็บเดียว ({', '.join(sites)}) และไม่ใช่ต้นทางทางการ: ไม่ผ่านเกณฑ์ 2 แหล่ง")
    if not (ROOT / "_sources/posts/news" / slug / "facts.md").exists():
        (warns if get("updated") else fails).append("ไม่มี _sources/posts/news/<slug>/facts.md")
    if online:
        with concurrent.futures.ThreadPoolExecutor(6) as ex:
            for u, (st, code) in zip(ext, ex.map(opens, ext)):
                if st == "dead":
                    fails.append(f"ลิงก์เปิดไม่ได้ ({code}): {u}")
                elif st == "blocked":
                    warns.append(f"เว็บไม่ให้สคริปต์เปิด ({code}) ต้องเปิดดูเอง: {u}")
    for mm in PROCESS.finditer(body):
        warns.append("อาจเป็นการเล่าขั้นตอนทำงาน: …" + body[max(0, mm.start() - 25):mm.end() + 25].replace("\n", " ") + "…")
    for mm in AI_WORDS.finditer(t):
        warns.append("ชื่อเครื่องมือ AI ใกล้เครดิต/alt: " + mm.group(0)[:80])
    if re.search(r"(ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.|[ก-๙]+คม|[ก-๙]+ยน|กุมภาพันธ์) 20[0-4]\d\b", body):
        warns.append("มีปี ค.ศ. คู่กับเดือนไทย (ควรเป็น พ.ศ.)")
    return fails, warns


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    online = "--offline" not in sys.argv
    if not args:
        print(__doc__); sys.exit(2)
    bad = 0
    for slug in args:
        slug = Path(slug).stem
        fails, warns = check(slug, online)
        print(("FAIL " if fails else "OK   ") + slug)
        for f in fails: print("  ✗ " + f)
        for w in warns: print("  ! " + w)
        bad += bool(fails)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
