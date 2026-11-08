// Shared site data: read by the formal Astro pages and by the /lab React app (src/App.jsx).
export const DOCS_URL = import.meta.env.PUBLIC_DOCS_URL || "https://docs.dojojin.tech";

export const PROFILE = {
  name: "Prakasit Rochanavipart",
  handle: "Dojo-mAn",
  title: "System Engineer",
  summary: "สร้าง CCTV analytics หลายยี่ห้อ (Bosch · Hikvision · Dahua · ONVIF), real-time event systems และ infra — ตั้งแต่ ingester → dashboard → mobile, รันจริงบน production",
  email: "dojojin@gmail.com",
  socials: { github: "https://github.com/dojojin/", facebook: "https://facebook.com/dojojin", linkedin: "https://linkedin.com/in/prakasit" },
};

export const CATEGORIES = { charger: "Charger", headphones: "หูฟัง" };

export const PROJECTS = [
  { name:"Vigil Platform", emoji:"📹", color:"#00ffb4", status:"LIVE", statusColor:"#00ffb4", link:`${DOCS_URL}/projects/vigil-platform`,
    desc:"Multi-vendor CCTV analytics & management suite — รับ event จาก Bosch (MQTT/ONVIF Profile M), Hikvision (ISAPI), Dahua (CGI VCA) และ ONVIF ทั่วไป ในแดชบอร์ดเดียว: real-time monitoring, branded reports, demographic face analytics, แจ้งเตือนผ่าน LINE และ Telegram",
    tech:["NodeJS","Express","PostgreSQL","MQTT / EMQX","ONVIF","Docker","Cloudflare"] },
  { name:"Vigil Mobile", emoji:"📱", color:"#00b4ff", status:"BETA", statusColor:"#00b4ff", link:`${DOCS_URL}/projects/vigil-mobile`,
    desc:"React Native companion app ของ Vigil Platform — auth, camera overview, live snapshot, online/offline status, alert badges และ real-time events ผ่าน WebSocket (singleton + backoff) รองรับ iOS + Android",
    tech:["React Native","Expo SDK 54","Expo Router","Zustand","Axios","WebSocket"] },
  { name:"ANPR / Vehicle Detection", emoji:"🚗", color:"#a78bfa", status:"IN VIGIL", statusColor:"#00ffb4", link:`${DOCS_URL}/projects/vigil-platform#license-plate-recognition-lpr`,
    desc:"License plate / vehicle detection — ส่วนหนึ่งของ Vigil Platform: Hikvision ISAPI + Dahua line-crossing, เก็บ log entry/exit ยานพาหนะแบบ real-time",
    tech:["Python","OpenCV","YOLO","Hikvision ISAPI","Dahua CGI"] },
  { name:"HippoCraft", emoji:"🦛", color:"#2bb673", status:"INTERNAL", statusColor:"#f59e0b", link:`${DOCS_URL}/projects/hippocraft`,
    desc:"โปรแกรมอ่านและแก้ไข PDF เขียนด้วย Rust ทั้งตัว ต่อยอดจาก PdfCraft — แก้ข้อความไทยในไฟล์เดิมโดยคงฟอนต์เดิม ตัดคำด้วย ICU ฝังฟอนต์ไทยแบบ subset OCR ภาษาไทยที่รันบนเครื่อง และเมนูไทยทั้งโปรแกรม ใช้ได้ทั้ง macOS, Windows และในเบราว์เซอร์ผ่าน WebAssembly",
    tech:["Rust","WebAssembly","PaddleOCR","HarfBuzz","egui"] },
  { name:"AI OCR Pipeline", emoji:"📄", color:"#f59e0b", status:"PAUSED", statusColor:"#f59e0b", link:`${DOCS_URL}/projects/ai-ocr-pipeline`,
    desc:"Internal testing tool (Google Apps Script) — สแกนและ extract ข้อมูลจากเอกสารภาษาไทยด้วย AI ลด manual data entry · พิสูจน์ว่าใช้งานได้จริงแล้ว ตอนนี้พักไว้ก่อน",
    tech:["Google Apps Script","AI OCR","Stack AI","DeepSeek"] },
  { name:"Crowd Density Analytics", emoji:"👥", color:"#ff4466", status:"IN VIGIL", statusColor:"#00ffb4", link:`${DOCS_URL}/projects/vigil-platform#event-management-and-analytics`,
    desc:"ตรวจความหนาแน่นฝูงชน + demographic face analytics — ส่วนหนึ่งของ Vigil Platform นับคนจากกล้องที่รองรับ ทำเป็นกราฟ density over time และ heatmap รายชั่วโมง",
    tech:["YOLO","OpenCV / CV2","Python","MQTT","NodeJS"] },
];

export const CASE_STUDIES = [
  {
    title: "Vigil Platform",
    tag: "CCTV ANALYTICS",
    icon: "📹",
    color: "#00ffb4",
    problem: "กล้องหลายยี่ห้อ (Bosch, Hikvision, Dahua, ONVIF) ส่ง event คนละ protocol — ทีม security ต้องเห็น motion, line-crossing, intrusion และ face capture แบบ real-time ในที่เดียว",
    solution: "สร้าง multi-vendor ingester (Bosch MQTT/ONVIF Profile M · Hikvision ISAPI alert stream · Dahua CGI VCA) ที่ normalize ทุก event ลงตารางเดียว แล้วต่อ alert engine, LINE notification, branded reports และ operational dashboard",
    result: "จากกล้องต่างยี่ห้อกลายเป็น operations platform เดียว: morning briefing, offline alerts, health report และ demographic analytics — ใช้งานจริงบน production",
    stack: ["Bosch", "Hikvision", "Dahua", "ONVIF", "MQTT", "PostgreSQL"],
  },
  {
    title: "ANPR / Vehicle Detection",
    tag: "COMPUTER VISION",
    icon: "🚗",
    color: "#a78bfa",
    problem: "ต้องบันทึก entry/exit ของรถและเลขทะเบียนแบบต่อเนื่อง โดยไม่พึ่งการกรอกข้อมูลเองทุกครั้ง",
    solution: "เชื่อม Hikvision ISAPI กับ pipeline ตรวจจับรถ/ป้ายทะเบียน แล้วส่ง log เข้าระบบค้นหาและตรวจสอบย้อนหลัง",
    result: "ลดงาน manual logging และทำให้เหตุการณ์รถเข้าออกถูกจัดเก็บเป็นข้อมูลที่ค้นหาได้",
    stack: ["Python", "OpenCV", "YOLO", "Elasticsearch", "Hikvision ISAPI"],
  },
  {
    title: "AI OCR Pipeline",
    tag: "AUTOMATION",
    icon: "📄",
    color: "#f59e0b",
    problem: "เอกสารภาษาไทยต้องถูกอ่านและแปลงข้อมูลซ้ำ ๆ ซึ่งกินเวลาและผิดพลาดง่ายเมื่อทำมือ",
    solution: "ทำ image preprocessing, OCR extraction และ AI-assisted validation เพื่อดึงข้อมูลสำคัญออกจากไฟล์เอกสาร",
    result: "เปลี่ยนงานเอกสารซ้ำ ๆ ให้เป็น pipeline ที่ตรวจสอบและส่งต่อข้อมูลได้เร็วขึ้น",
    stack: ["Python", "OpenCV", "OCR", "Stack AI", "FFmpeg", "DeepSeek"],
  },
];

export const EXPERIENCES = [
  { role:"Freelance Dev", period:"ปัจจุบัน", color:"#00ffb4", icon:"💻", items:["Full-stack web development — React, Node.js, Express, Vite","Computer Vision pipelines — YOLO, OpenCV/CV2, FFmpeg","AI/ML integration — Ollama, OpenWebUI, DeepSeek, Gemma, Qwen, Stack AI","Infrastructure & DevOps — Docker, Nginx, Cloudflare Tunnel, Reverse Proxy","ANPR / Vehicle Detection systems (Hikvision ISAPI + Elasticsearch)","Metadata Dashboards, AI OCR, Crowd Density analytics","C++ performance tooling & Linux server management"] },
  { role:"System Engineer", period:"Mar 2017 – Present", color:"#00b4ff", icon:"⚙️", items:["Maintenance and troubleshooting of complex infrastructure environments","Analyzed stakeholder needs, generated requirements, and implemented Requirements Management Plans","Defined technical integration strategy and developed Integration plans","Assisted with designing information and operational support systems","Collected, analyzed, and reported program metrics including KPIs and technical performance measures","Designed and delivered mission-critical infrastructure for maximum availability, performance, and security"] },
  { role:"Social Media Specialist", period:"Aug 2016 – Mar 2017", color:"#a78bfa", icon:"📱", items:["Generated, edited, published and distributed daily multi-format content","Built and executed social media strategy through competitive and audience research","Set up and optimized company pages within each social media platform","Analyzed social data/metrics and continuously improved strategy","Content seeding across multiple channels"] },
  { role:"QA Engineer & Product Marketing", period:"Jan 2013 – Jul 2016", color:"#f59e0b", icon:"🔬", items:["Analyzed and interpreted test data; prepared technical reports","Implemented QA methodologies, testing frameworks, and quality controls","Identified new product opportunities; developed business cases","Developed and managed marketing programs","Mobile QC from factory as i-mobile requirement"] },
  { role:"IT Consultant & Sales Representative", period:"Feb 2006 – Jan 2013", color:"#ff4466", icon:"🤝", items:["Designed and built webpages for government agencies and private clients","Developed marketing plans, sales strategies, and targets","Installed and repaired hardware, software, and peripheral equipment","Conducted computer diagnostics to investigate and resolve problems","Maintained strong customer relationships through post-sales follow-up"] },
  { role:"Technical Support", period:"Jan 2003 – Jan 2006", color:"#34d399", icon:"🛠️", items:["Prepared and presented technical proposals","Developed IT strategic vision and drove key departmental objectives","Installed and repaired hardware, software, and peripheral equipment","Worked within each organization's budget to implement solutions"] },
  { role:"Tutor & Teacher", period:"ช่วงต้นอาชีพ", color:"#fb923c", icon:"📚", items:["C++ programming fundamentals","Computer Techniques — hardware investigation and repair","How Computers Work & Computer Architecture","Basic HTML web development"] },
];
