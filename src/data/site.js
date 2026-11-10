// Shared site data: read by the formal Astro pages and by the /lab React app (src/App.jsx).
// import.meta.env exists under Vite/Astro; plain Node (scripts/) gets the production default.
export const DOCS_URL = import.meta.env?.PUBLIC_DOCS_URL || "https://docs.dojojin.tech";

export const SITE = {
  name: "DOJOJIN.TECH",
  tagline: "ซื้อจริง ใช้จริง ไปจริง แล้วมาเล่าให้ฟัง",
  description: "เว็บรีวิว ความรู้ และข้อมูลเทคโนโลยีโดย Dojo-mAn — อุปกรณ์ ถ่ายภาพ และ infra/AI อธิบายให้เข้าใจง่าย พร้อมผลวัดและรูปจริง",
};

// Types = the menu sections. Folder = type: src/content/posts/<type>/<slug>.mdx → /<type>/<slug>/
export const TYPES = {
  review: { name: "Review", blurb: "รีวิวอุปกรณ์จากการใช้งานจริง พร้อมรูปและผลวัด" },
  knowledge: { name: "ความรู้", blurb: "อธิบายเรื่องเทคนิคให้เข้าใจง่าย — ใช้ตัดสินใจเลือกซื้อและใช้งานได้จริง" },
  eat: { name: "ท่องเที่ยว", blurb: "รีวิวร้านอาหาร ร้านกาแฟ และสถานที่ที่ไปมาเอง จ่ายเงินเอง" },
  news: { name: "ข่าว", blurb: "ข่าวเทคโนโลยี ยานยนต์ และเรื่องทั่วไป รวมข่าวประชาสัมพันธ์จากบริษัทต่าง ๆ" },
  data: { name: "Data", blurb: "ชุดข้อมูลอ้างอิง — ราคาเปิดตัวในไทยและสเปกระดับชิ้นส่วนของมือถือทุกรุ่น" },
};
// Categories (field `topic`, exactly one per post) — badge on cards; filter chips appear in a menu section
// once it holds more than one category.
export const TOPICS = {
  smartphone: { name: "สมาร์ทโฟน" },
  audio: { name: "หูฟัง & เสียง" },
  power: { name: "ชาร์จ & พลังงาน" },
  photo: { name: "กล้อง & ถ่ายภาพ" },
  "infra-ai": { name: "Infra & AI" },
  restaurant: { name: "ร้านอาหาร คาเฟ่ & ที่เที่ยว" },
  network: { name: "เน็ต & เครือข่าย" },
  car: { name: "ยานยนต์" },
  software: { name: "ซอฟต์แวร์" },
};
// Tags (field `tags`, any number) — brand / product kind / technique. Only tags listed here are allowed
// (the build fails otherwise), so the same thing never ends up under two spellings. Each has a page at /tag/<key>/.
export const TAGS = {
  apple: "Apple", samsung: "Samsung", vivo: "vivo", shokz: "Shokz",
  tws: "TWS", "open-ear": "Open-ear",
  gan: "GaN", ripple: "Ripple", "usb-pd": "USB-PD",
  price: "ราคา",
  hoco: "HOCO", powerbank: "Power Bank", "retro-game": "เกมย้อนยุค",
  oppo: "OPPO", dynaudio: "Dynaudio", anc: "ANC", lhdc: "LHDC", ldac: "LDAC",
  "northern-thai": "อาหารเหนือ", "southern-thai": "อาหารใต้", "japanese-food": "อาหารญี่ปุ่น", "chinese-food": "อาหารจีน", market: "ตลาด", ayutthaya: "อยุธยา", suphanburi: "สุพรรณบุรี", "thai-food": "อาหารไทย", cafe: "คาเฟ่",
  orsen: "ORSEN", commy: "COMMY", slimq: "SlimQ", realme: "realme",
  baseus: "Baseus", oraimo: "oraimo", roseselsa: "ROSESELSA",
  "1more": "1MORE", cmf: "CMF by Nothing", earfun: "EarFun", huawei: "HUAWEI", isuper: "iSUPER",
  soundcore: "soundcore", soundpeats: "SoundPEATS", tozo: "TOZO", "clip-on": "Clip-on",
  anitech: "anitech", "power-strip": "ปลั๊กไฟ / สายพ่วง",
  "true-corp": "True", dtac: "dtac", "5g": "5G",
  php: "PHP", security: "ความปลอดภัย",
  openssh: "OpenSSH", wordpress: "WordPress", cctv: "กล้องวงจรปิด", onvif: "ONVIF",
  xiaomi: "Xiaomi", redmagic: "REDMAGIC", motorola: "Motorola", nvidia: "NVIDIA", gaming: "เกม",
  dunlop: "DUNLOP", honda: "Honda", tire: "ยางรถยนต์", ev: "EV", motorcycle: "มอเตอร์ไซค์", motorsport: "มอเตอร์สปอร์ต",
  hippocraft: "HippoCraft", pdf: "PDF",
  google: "Google", chrome: "Chrome", axis: "Axis", vms: "VMS", mercular: "Mercular", "data-breach": "ข้อมูลรั่ว",
  android: "Android", foldable: "มือถือจอพับ", tablet: "แท็บเล็ต", ai: "AI", anthropic: "Anthropic", meta: "Meta", gpu: "GPU",
};

// Filter chips on /news/. "pr" = the post has a `pr` field (sending organisation); the rest = field `section`.
// A press release also has a section, so it shows under both chips.
export const NEWS_CHIPS = { pr: "ข่าวประชาสัมพันธ์", tech: "ข่าวเทคโนโลยี", security: "ความปลอดภัยไซเบอร์", auto: "ข่าววงการยานยนต์", general: "ข่าวทั่วไป" };

// Main menu — used by src/layouts/Base.astro and by scripts/patch-atlas.mjs (top bar on atlas pages).
export const NAV = [
  ["home", "/", "Home"],
  ["review", "/review/", "Review"],
  ["knowledge", "/knowledge/", "ความรู้"],
  ["eat", "/eat/", "ท่องเที่ยว"],
  ["news", "/news/", "ข่าว"],
  ["data", "/data/", "Data"],
  ["projects", "/projects/", "Projects"],
  ["guestbook", "/guestbook/", "Guestbook"],
];

export const PROFILE = {
  name: "Prakasit Rochanavipart",
  handle: "Dojo-mAn",
  title: "System Engineer",
  // public intro: no client/vendor/architecture detail (Vigil is business-confidential; details live on docs only)
  intro: "System Engineer สายระบบรักษาความปลอดภัย, network infrastructure และ AI ทำงานด้านระบบมาตั้งแต่ปี 2003 และเป็นช่างภาพในชื่อ Dojo-mAn Fotographer เคยทำมือถือ i-mobile เคยเป็นเด็กปั๊ม และเด็กเสิร์ฟ",
  email: "dojojin@gmail.com",
  socials: { github: "https://github.com/dojojin/", facebook: "https://facebook.com/dojojin", linkedin: "https://linkedin.com/in/prakasit" },
};

// ---- below: data shared with the old site at /lab (src/App.jsx). Not used on the formal pages. ----
export const PROJECTS = [
  { name:"Vigil Platform", emoji:"📹", color:"#00ffb4", status:"LIVE", statusColor:"#00ffb4", link:"/projects/vigil-platform/",
    desc:"ระบบรวมกล้องวงจรปิดหลายยี่ห้อมาวิเคราะห์และจัดการในจอเดียว ใช้งานจริงในองค์กร — รายละเอียดอยู่ในเอกสาร",
    tech:["CCTV analytics"] },
  { name:"Vigil Mobile", emoji:"📱", color:"#00b4ff", status:"BETA", statusColor:"#00b4ff", link:"/projects/vigil-mobile/",
    desc:"แอปมือถือ iOS และ Android คู่กับ Vigil Platform ดูสถานะกล้องและการแจ้งเตือนได้ทุกที่",
    tech:["iOS","Android"] },
  { name:"HippoCraft", emoji:"🦛", color:"#2bb673", status:"BETA", statusColor:"#f59e0b", link:"/projects/hippocraft/",
    desc:"โปรแกรมอ่านและแก้ไข PDF เขียนด้วย Rust แก้ข้อความภาษาไทยในไฟล์ได้โดยคงฟอนต์เดิม",
    tech:["Rust","WebAssembly","PaddleOCR","HarfBuzz","egui"] },
  { name:"AI OCR Pipeline", emoji:"📄", color:"#f59e0b", status:"PAUSED", statusColor:"#f59e0b", link:"/projects/ai-ocr-pipeline/",
    desc:"ทดลองดึงข้อมูลจากเอกสารภาษาไทยอัตโนมัติด้วย AI — พักไว้ชั่วคราว",
    tech:["Google Apps Script","AI OCR"] },
];

export const CASE_STUDIES = [
  {
    title: "AI OCR Pipeline",
    tag: "AUTOMATION",
    icon: "📄",
    color: "#f59e0b",
    problem: "เอกสารภาษาไทยต้องถูกอ่านและแปลงข้อมูลซ้ำ ๆ ซึ่งกินเวลาและผิดพลาดง่ายเมื่อทำมือ",
    solution: "ทำ image preprocessing, OCR extraction และ AI-assisted validation เพื่อดึงข้อมูลสำคัญออกจากไฟล์เอกสาร",
    result: "เปลี่ยนงานเอกสารซ้ำ ๆ ให้เป็น pipeline ที่ตรวจสอบและส่งต่อข้อมูลได้เร็วขึ้น",
    stack: ["Python", "OpenCV", "OCR", "Stack AI", "FFmpeg", "DeepSeek"],
  }
];

export const EXPERIENCES = [
  { role:"Freelance Dev", period:"ปัจจุบัน", color:"#00ffb4", icon:"💻", items:["Full-stack web development — React, Node.js, Express, Vite","Computer Vision pipelines — YOLO, OpenCV/CV2, FFmpeg","AI/ML integration — Ollama, OpenWebUI, DeepSeek, Gemma, Qwen, Stack AI","Infrastructure & DevOps — Docker, Nginx, Cloudflare Tunnel, Reverse Proxy","Metadata dashboards & AI OCR","C++ performance tooling & Linux server management"] },
  { role:"System Engineer", period:"Mar 2017 – Present", color:"#00b4ff", icon:"⚙️", items:["Maintenance and troubleshooting of complex infrastructure environments","Analyzed stakeholder needs, generated requirements, and implemented Requirements Management Plans","Defined technical integration strategy and developed Integration plans","Assisted with designing information and operational support systems","Collected, analyzed, and reported program metrics including KPIs and technical performance measures","Designed and delivered mission-critical infrastructure for maximum availability, performance, and security"] },
  { role:"Social Media Specialist", period:"Aug 2016 – Mar 2017", color:"#a78bfa", icon:"📱", items:["Generated, edited, published and distributed daily multi-format content","Built and executed social media strategy through competitive and audience research","Set up and optimized company pages within each social media platform","Analyzed social data/metrics and continuously improved strategy","Content seeding across multiple channels"] },
  { role:"QA Engineer & Product Marketing", period:"Jan 2013 – Jul 2016", color:"#f59e0b", icon:"🔬", items:["Analyzed and interpreted test data; prepared technical reports","Implemented QA methodologies, testing frameworks, and quality controls","Identified new product opportunities; developed business cases","Developed and managed marketing programs","Mobile QC from factory as i-mobile requirement"] },
  { role:"IT Consultant & Sales Representative", period:"Feb 2006 – Jan 2013", color:"#ff4466", icon:"🤝", items:["Designed and built webpages for government agencies and private clients","Developed marketing plans, sales strategies, and targets","Installed and repaired hardware, software, and peripheral equipment","Conducted computer diagnostics to investigate and resolve problems","Maintained strong customer relationships through post-sales follow-up"] },
  { role:"Technical Support", period:"Jan 2003 – Jan 2006", color:"#34d399", icon:"🛠️", items:["Prepared and presented technical proposals","Developed IT strategic vision and drove key departmental objectives","Installed and repaired hardware, software, and peripheral equipment","Worked within each organization's budget to implement solutions"] },
  { role:"Tutor & Teacher", period:"ช่วงต้นอาชีพ", color:"#fb923c", icon:"📚", items:["C++ programming fundamentals","Computer Techniques — hardware investigation and repair","How Computers Work & Computer Architecture","Basic HTML web development"] },
];

