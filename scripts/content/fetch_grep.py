import sys,re,html,subprocess
url=sys.argv[1]; pats=sys.argv[2:]
raw=subprocess.run(['curl','-sL','--compressed','-m','40','-A','Mozilla/5.0 (X11; Linux x86_64) dojojin-site-research/1.0',url],capture_output=True).stdout.decode('utf-8','ignore')
t=html.unescape(re.sub(r'<script.*?</script>|<style.*?</style>',' ',raw,flags=re.S)); t=re.sub(r'<[^>]+>',' ',t); t=re.sub(r'\s+',' ',t)
print('==',url,len(raw))
seen=set()
for p in pats:
    for m in list(re.finditer(p,t))[:2]:
        s=t[max(0,m.start()-200):m.end()+260]
        if s[:60] not in seen: seen.add(s[:60]); print('  >',s)
