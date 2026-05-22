import { useState, useEffect, useRef, useCallback } from "react";
import logoSvg from "./favicon.svg";
import { auth, db, googleProvider } from "./firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, query, orderBy,
  runTransaction, serverTimestamp,
} from "firebase/firestore";

/* ══════ CONSTANTS ══════ */
const CHAOS_TITLES = [
  "DOJOJIN.TECH | กล้อง ONLINE • ชีวิต TIMEOUT 💀",
  "DOJOJIN.TECH | YOLO detected: bug in prod 🎯",
  "DOJOJIN.TECH | MQTT connected, สมองไม่ connected 🧠",
  "DOJOJIN.TECH | docker ps → life.exe: Exited (1) 🐳",
  "DOJOJIN.TECH | Bosch sees all 👁️ แต่ nginx ยัง 502",
  "DOJOJIN.TECH | git push -f เมื่อกี้ ขอโทษ 🙏",
  "DOJOJIN.TECH | RAM: 2% | CHAOS: 100% | HOPE: 0.01%",
  "DOJOJIN.TECH | กล้อง 8100i จ้องอยู่นะ 🎥",
  "DOJOJIN.TECH | Cloudflare Tunnel: อยู่...หรือเปล่า? ☁️",
  "DOJOJIN.TECH | deploy วันศุกร์ คือความกล้า 🚀",
  "DOJOJIN.TECH | OpenCV กำลังมองคุณอยู่ 📷",
  "DOJOJIN.TECH | coffee.exe still running ☕",
];
const HIDDEN_TITLES = [
  "👀 กล้อง Bosch มองคุณอยู่ ห้ามหนี",
  "📡 MQTT ยังส่ง packet ให้คุณนะ",
  "🎯 YOLO detected: tab abandonment",
  "💀 life.exe หยุดรอคุณแล้ว",
  "🔴 Motion detected! กลับมาดูก่อน!",
];
const getBangkokTime = () => new Date().toLocaleTimeString("en-GB", { timeZone:"Asia/Bangkok", hour12:false });
const OWNER_EMAILS = (import.meta.env.VITE_OWNER_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
const RANDOM_EVENTS = [
  { msg:"YOLO: person detected in Zone B",        icon:"🎯", color:"#00ffb4" },
  { msg:"MQTT: bosch/cam/8100i motion event",     icon:"📡", color:"#00b4ff" },
  { msg:"Camera 3: Crowd density HIGH",           icon:"👥", color:"#f59e0b" },
  { msg:"ANPR: plate recognition success",        icon:"🔍", color:"#a78bfa" },
  { msg:"Docker: container restarted (3rd time)", icon:"🐳", color:"#ff4466" },
  { msg:"nginx: 502 Bad Gateway (classic)",       icon:"🟩", color:"#ff4466" },
  { msg:"Cloudflare: tunnel reconnecting...",     icon:"☁️", color:"#f59e0b" },
  { msg:"git: remote rejected push -f (again)",  icon:"😱", color:"#ff4466" },
  { msg:"FFmpeg: encoding frame 2048/???",        icon:"🎬", color:"#00ffb4" },
  { msg:"life.exe: low memory warning",           icon:"💀", color:"#ff4466" },
];
const MOTION_ALERTS = [
  "Motion detected ใกล้ตัวคุณ 🎥",
  "Bosch 8100i: Zone A triggered 📷",
  "กล้องกำลังจ้องอยู่ — ห้ามขยับ",
  "Crowd density สูงผิดปกติ ⚠️",
  "YOLO: unknown object near camera",
];
const CONFESSIONS = [
  "copy code จาก Stack Overflow โดยไม่อ่าน  ✅  847 ครั้ง",
  "deploy วันศุกร์แล้วหวังว่าจะ ok  ✅  12 ครั้ง",
  "git push -f แล้วหวังว่าไม่มีใครสังเกต  ✅  34 ครั้ง",
  "ตั้งชื่อ variable ว่า temp2_final_v3_REAL  ✅  มากเกินนับ",
  "comment fix later แล้วไม่เคย fix  ✅  291 ครั้ง",
  "restart docker แทนการ debug จริงๆ  ✅  ทุกวัน",
  "อ่าน error message แค่บรรทัดแรก  ✅  99% ของเวลา",
  "บอกว่า แค่ 5 นาที แล้วนั่งอยู่ 3 ชั่วโมง  ✅  ทุกวัน",
  "เปิด 47 tabs Chrome แล้วลืมว่าเปิดทำไม  ✅  ตอนนี้เลย",
  "ส่ง git commit ว่า fix ทั้งที่แก้ 300 บรรทัด  ✅  เมื่อกี้",
];
const NOW_ITEMS = [
  { task:"CCTV analytics platform (Bosch 8100i/3100i)", icon:"📹", status:"BUILDING", color:"#00ffb4" },
  { task:"Mobile app — Events screen via WebSocket",    icon:"📱", status:"NEXT UP",  color:"#00b4ff" },
  { task:"Fix SESSION_SECRET หลัง server restart",      icon:"🔐", status:"PENDING",  color:"#f59e0b" },
  { task:"Android snapshot → expo-image migration",     icon:"🤖", status:"TODO",     color:"#a78bfa" },
  { task:"ทะเลาะกับ nginx 502 (อีกรอบ)",               icon:"🟩", status:"ONGOING",  color:"#ff4466" },
];
const PROJECTS = [
  { name:"Bosch MQTT Dashboard", emoji:"📹", color:"#00ffb4", status:"LIVE", statusColor:"#00ffb4", link:"https://dashboard.dojojin.tech",
    desc:"CCTV analytics platform สำหรับกล้อง Bosch 8100i/3100i แสดง real-time events, crowd density, vehicle detection ผ่าน web dashboard",
    tech:["NodeJS","Express","PostgreSQL","MQTT","Chart.js","OpenLayers","Docker","Cloudflare"] },
  { name:"DojoJin Mobile App", emoji:"📱", color:"#00b4ff", status:"IN DEV", statusColor:"#f59e0b",
    desc:"React Native companion app — ดู camera status, events feed และ real-time alerts ผ่าน WebSocket รองรับ iOS + Android",
    tech:["React Native","Expo SDK 55","Zustand","Axios","Victory Native","Mapbox"] },
  { name:"ANPR / Vehicle Detection", emoji:"🚗", color:"#a78bfa", status:"DEPLOYED", statusColor:"#00ffb4",
    desc:"License plate recognition ด้วย Hikvision ISAPI + Elasticsearch เก็บ log entry/exit ยานพาหนะแบบ real-time",
    tech:["Python","OpenCV","YOLO","Elasticsearch","Hikvision ISAPI","C++"] },
  { name:"AI OCR Pipeline", emoji:"📄", color:"#f59e0b", status:"LIVE", statusColor:"#00ffb4",
    desc:"ระบบสแกนและ extract ข้อมูลจากเอกสารภาษาไทยด้วย computer vision + AI models ลด manual data entry",
    tech:["Python","OpenCV","Stack AI","FFmpeg","DeepSeek"] },
  { name:"Crowd Density Analytics", emoji:"👥", color:"#ff4466", status:"LIVE", statusColor:"#00ffb4",
    desc:"ตรวจสอบความหนาแน่นของฝูงชน real-time ผ่าน computer vision ส่ง alert เมื่อเกิน threshold ผ่าน MQTT",
    tech:["YOLO","OpenCV / CV2","Python","MQTT","NodeJS","FFmpeg"] },
];
const CASE_STUDIES = [
  {
    title: "Bosch MQTT Dashboard",
    tag: "CCTV ANALYTICS",
    icon: "📹",
    color: "#00ffb4",
    problem: "กล้อง Bosch 8100i/3100i ส่ง event เยอะ แต่ทีมต้องเห็น motion, crowd density และ vehicle detection แบบ real-time ในที่เดียว",
    solution: "สร้าง dashboard ที่รับ event ผ่าน MQTT, เก็บข้อมูลลง PostgreSQL, แสดงผลผ่าน web UI พร้อม map/status และต่อออกอินเทอร์เน็ตผ่าน Cloudflare Tunnel",
    result: "จาก raw camera events กลายเป็น operations dashboard ที่เปิดดูสถานะและเหตุการณ์ล่าสุดได้ทันที",
    stack: ["Bosch", "MQTT", "NodeJS", "PostgreSQL", "Docker", "Cloudflare"],
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
const CONTEXT_ITEMS = [
  { label:"🔍  inspect life.exe",          action:null },
  { label:"🐛  git blame ตัวเอง",           action:null },
  { label:"♻️  restart feelings",           action:()=>window.location.reload() },
  { label:"💀  sudo rm -rf /regrets",       action:null },
  { label:"☕  refill coffee.exe",           action:null },
  { label:"🚀  deploy to prod (วันศุกร์)", action:()=>window.open("https://dojojin.tech","_blank") },
  { label:"📋  copy stack trace",           action:()=>navigator.clipboard?.writeText("Error: life crashed\n  at sleep() [2am]\n  at docker.restart()\n  at nginx.502()") },
  { label:"😈  git push -f",               action:null },
];

/* ══════ TERMINAL CMD PROCESSOR ══════ */
function processCommand(raw) {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return null;
  if (cmd === "clear") return "CLEAR";
  if (cmd === "help") return [
    "COMMANDS:","  whoami       who are you",
    "  ls           list projects","  pwd          current dir",
    "  date         bangkok time","  uptime       system uptime",
    "  docker ps    container status","  git log      commit history",
    "  git push -f  yolo push","  nginx -t     test config",
    "  mqtt status  broker info","  cat [file]   read file",
    "  sudo [cmd]   nice try","  exit         ออกไม่ได้","  clear        clear screen",
  ].join("\n");
  if (["ls","ls -la","ls projects"].includes(cmd)) return [
    "drwxr-xr-x  bosch-mqtt-dashboard/",
    "drwxr-xr-x  dojojin-mobile-v2/",
    "drwxr-xr-x  anpr-system/",
    "drwxr-xr-x  ai-ocr-pipeline/",
    "-rw-r--r--  life.exe   [Exited(1)]",
    "-rwx------  coffee.sh  [Running forever]",
    "-rw-------  nginx.conf [Broken as usual]",
  ].join("\n");
  if (cmd === "pwd") return "/home/dojoman/chaos";
  if (cmd === "whoami") return "dojoman\nSystem Engineer / Infrastructure Archaeologist\nPak Kret, Nonthaburi  UTC+7";
  if (cmd === "date") return new Date().toLocaleString("en-GB",{timeZone:"Asia/Bangkok"})+"  ICT (UTC+7)";
  if (cmd === "uptime") return "up 20yr, restarts: countless\ncoffee: CRITICAL\nlife: degraded";
  if (cmd === "docker ps") return [
    "CONTAINER   IMAGE          STATUS",
    "life        dojoman/life   Up 20y (unhealthy)",
    "coffee      brew:espresso  Up 8h  (healthy) ☕",
    "nginx       nginx:latest   Restarting(502)",
    "bosch-db    postgres:15    Up 3h  (healthy)",
  ].join("\n");
  if (["git log","git log --oneline"].includes(cmd)) return [
    "* a3f92b1 (HEAD) fix",
    "* 9d21e4a fix for real this time",
    "* f3a109c FINAL fix",
    "* 2b8fc71 FINAL fix v2",
    "* 0fe2910 please work",
    "* 1c9f334 WTF",
    "* dead1e1 init commit (2003)",
  ].join("\n");
  if (cmd === "git push") return "remote: rejected\nerror: failed to push\nhint: ลอง git push -f";
  if (["git push -f","git push --force"].includes(cmd)) return "remote: ok (god help us)\n3 colleagues unsubscribed";
  if (cmd === "nginx -t") return "nginx: [error] unknown directive \"work_please\"\ntest FAILED\n// it is always nginx";
  if (cmd === "mqtt status") return "broker: dojojin.tech:1883  CONNECTED\ntopics: bosch/+/events\nmessages/today: 14,291\nlast event: motion_detected (0.3s ago)";
  if (cmd.startsWith("sudo")) return "Sorry, try again.\nSorry, try again.\nsudo: 3 incorrect password attempts";
  if (cmd.startsWith("cat ")) {
    const f = cmd.slice(4).trim();
    const files = {
      "bosch.txt":"# Bosch MQTT Dashboard\nBosch 8100i/3100i CCTV analytics\nStack: Express+PostgreSQL+MQTT\nHost: Cloudflare Tunnel -> Mac\nStatus: LIVE",
      "mobile.md":"# DojoJin Mobile App\nReact Native + Expo SDK 55\nNext: Events screen via WebSocket\nStatus: IN DEV",
      "life.log":"[02:00] nginx: 502\n[02:15] docker restart\n[02:16] nginx: 502 (again)\n[03:45] it works (dont know why)\n[04:00] sleep",
      "quote.txt":"วันนึงจะไม่ต้องพิมพ์อะไรเองอีก\nแต่สุดท้ายยังต้องพิมพ์ git push เองอยู่ดี\n-- Mr. Dojo-mAn, 2am",
    };
    return files[f] || "cat: "+f+": No such file\nTry: bosch.txt mobile.md life.log quote.txt";
  }
  if (["exit","quit"].includes(cmd)) return "ออกไปไหน? นี่คือชีวิต";
  if (cmd === "npm install") return "added 1,337 packages\nfound 47 vulnerabilities";
  if (cmd === "docker restart") return "Restarting nginx ... done\nRestarting life ... done\n// fixed it (maybe)";
  return "bash: "+raw.trim()+": command not found\nลอง 'help'";
}

/* ══════ HOOKS ══════ */
function useDynamicTitle() {
  const idx = useRef(0);
  useEffect(() => {
    document.title = CHAOS_TITLES[0];
    const rot = setInterval(() => {
      idx.current = (idx.current + 1) % CHAOS_TITLES.length;
      if (!document.hidden) document.title = CHAOS_TITLES[idx.current];
    }, 4000);
    const vis = () => {
      document.title = document.hidden
        ? HIDDEN_TITLES[Math.floor(Math.random() * HIDDEN_TITLES.length)]
        : CHAOS_TITLES[idx.current];
    };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(rot); document.removeEventListener("visibilitychange", vis); };
  }, []);
}
function useKonamiCode(onSuccess) {
  const buf = useRef([]);
  useEffect(() => {
    const h = (e) => {
      buf.current = [...buf.current, e.key].slice(-KONAMI.length);
      if (buf.current.join(",") === KONAMI.join(",")) onSuccess();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onSuccess]);
}
function useLiveClock() {
  const [t, setT] = useState(getBangkokTime);
  useEffect(() => {
    const iv = setInterval(() => setT(getBangkokTime()), 1000);
    return () => clearInterval(iv);
  }, []);
  return t;
}
function useClickCounter() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const h = () => setN(c => c + 1);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);
  return n;
}
function useIdleTimer(ms = 60000) {
  const [idle, setIdle] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    const reset = () => {
      setIdle(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setIdle(true), ms);
    };
    reset();
    const ev = ["mousemove","keydown","click","scroll","touchstart"];
    ev.forEach(e => window.addEventListener(e, reset));
    return () => { clearTimeout(timer.current); ev.forEach(e => window.removeEventListener(e, reset)); };
  }, [ms]);
  return idle;
}

/* ══════ UTILITY COMPONENTS ══════ */
function CCTVStatic({ w=80, h=60 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let t;
    const draw = () => {
      const img = ctx.createImageData(w, h);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 100 | 0;
        img.data[i] = img.data[i+1] = img.data[i+2] = v;
        img.data[i+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      t = setTimeout(draw, 120);
    };
    draw();
    return () => clearTimeout(t);
  }, [w, h]);
  return <canvas ref={ref} width={w} height={h} style={{width:"100%",height:"100%",display:"block"}} />;
}

function KonamiPopup({ onClose }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"rgba(0,255,180,0.06)",border:"2px solid rgba(0,255,180,0.5)",borderRadius:"24px",padding:"40px 48px",maxWidth:"480px",textAlign:"center",animation:"rgb-border 2s ease-in-out infinite"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:"56px",marginBottom:"16px"}}>🎮</div>
        <div style={{fontSize:"13px",letterSpacing:"0.3em",color:"rgba(0,255,180,0.7)",marginBottom:"8px"}}>KONAMI CODE UNLOCKED</div>
        <div style={{fontSize:"22px",fontWeight:"800",color:"#fff",marginBottom:"20px"}}>ULTRA CHAOS MODE</div>
        <div style={{fontSize:"12px",color:"rgba(255,255,255,0.5)",lineHeight:"1.9",marginBottom:"28px",fontFamily:"monospace"}}>
          คุณค้นพบ secret ที่ซ่อนอยู่ใน codebase<br/>
          เหมือนที่ YOLO ค้นพบ bug ใน prod ทุกวัน<br/>
          <span style={{color:"#00ffb4"}}>// ชีวิตนี้ก็คือ Easter Egg หนึ่งชิ้น</span>
        </div>
        <div style={{background:"rgba(0,0,0,0.5)",border:"1px solid rgba(0,255,180,0.2)",borderRadius:"12px",padding:"14px 18px",marginBottom:"24px",fontFamily:"monospace",fontSize:"11px",color:"rgba(255,255,255,0.4)",textAlign:"left"}}>
          <span style={{color:"#00ffb4"}}>$</span> sudo grant --all-permissions dojoman<br/>
          <span style={{color:"rgba(255,255,255,0.25)"}}>&gt; Permission denied</span><br/>
          <span style={{color:"#ff4466"}}>&gt; ERROR: life.exe crashed (again)</span>
        </div>
        <button onClick={onClose} style={{padding:"10px 28px",borderRadius:"10px",background:"rgba(0,255,180,0.12)",border:"1px solid rgba(0,255,180,0.4)",color:"#00ffb4",fontSize:"12px",fontWeight:"700",cursor:"pointer",letterSpacing:"0.1em",fontFamily:"inherit"}}>
          กลับ Reality
        </button>
      </div>
    </div>
  );
}

function LightModeOverlay({ onClose }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:10000,background:"#f0ede8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"monospace"}}>
      <div style={{fontSize:"80px",marginBottom:"20px"}}>😱</div>
      <div style={{fontSize:"28px",fontWeight:"800",color:"#0a1628",marginBottom:"8px"}}>LIGHT MODE ACTIVATED</div>
      <div style={{fontSize:"14px",color:"#666",marginBottom:"4px"}}>// นี่มันไม่ใช่ chaos dev theme</div>
      <div style={{fontSize:"12px",color:"#999",marginBottom:"36px"}}>// triggered by: logo x 5 clicks</div>
      <div style={{background:"rgba(0,0,0,0.06)",border:"1px solid #ccc",borderRadius:"16px",padding:"20px 28px",marginBottom:"28px",color:"#555",fontSize:"12px",lineHeight:"2"}}>
        <span style={{color:"#888"}}>$</span> sudo enable light-mode<br/>
        <span style={{color:"#f59e0b"}}>&gt; WARNING: retinas at risk</span><br/>
        <span style={{color:"#888"}}>$</span> git commit -m "who did this"<br/>
        <span style={{color:"#ff4466"}}>&gt; git blame: dojoman (as always)</span>
      </div>
      <button onClick={onClose} style={{padding:"12px 32px",background:"#0a1628",color:"#00ffb4",border:"none",borderRadius:"12px",fontSize:"13px",fontWeight:"700",cursor:"pointer",letterSpacing:"0.1em",fontFamily:"monospace"}}>
        🌙 กลับ Dark Mode
      </button>
    </div>
  );
}

function Screensaver() {
  const [time, setTime] = useState(getBangkokTime);
  useEffect(() => {
    const iv = setInterval(() => setTime(getBangkokTime()), 1000);
    return () => clearInterval(iv);
  }, []);
  const cams = [
    {label:"CAM-01 ENTRANCE",zone:"Zone A"},
    {label:"CAM-02 PARKING", zone:"Zone B"},
    {label:"CAM-03 LOBBY",   zone:"Zone C"},
    {label:"CAM-04 SERVER",  zone:"Zone D — DO NOT ENTER"},
  ];
  return (
    <div style={{position:"fixed",inset:0,zIndex:9998,background:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px"}}>
      <div style={{fontSize:"11px",letterSpacing:"0.3em",color:"rgba(255,0,0,0.7)",fontFamily:"monospace"}}>● REC  {time}  ICT (UTC+7)</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",width:"min(700px,90vw)"}}>
        {cams.map((cam,i) => (
          <div key={i} style={{background:"#111",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",overflow:"hidden",aspectRatio:"16/10",position:"relative"}}>
            <CCTVStatic w={160} h={100}/>
            <div style={{position:"absolute",inset:0,background:"rgba(0,255,0,0.03)",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"6px 8px",fontFamily:"monospace"}}>
              <div style={{fontSize:"9px",color:"rgba(0,255,0,0.7)",letterSpacing:"0.1em"}}>{cam.label}</div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:"8px",color:"rgba(255,255,255,0.3)"}}>{cam.zone}</span>
                <span style={{fontSize:"8px",color:"rgba(255,0,0,0.7)",animation:"statusBlink 1s infinite"}}>● REC</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{fontSize:"11px",color:"rgba(255,255,255,0.2)",letterSpacing:"0.3em",fontFamily:"monospace",animation:"statusBlink 2s infinite"}}>
        PRESS ANY KEY OR MOVE MOUSE TO CONTINUE
      </div>
      <div style={{fontSize:"10px",color:"rgba(0,255,180,0.25)",letterSpacing:"0.15em",fontFamily:"monospace"}}>
        DOJOJIN.TECH // SECURITY SYSTEM ONLINE
      </div>
    </div>
  );
}

function CCTVWidget() {
  const [time, setTime] = useState(getBangkokTime);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => setTime(getBangkokTime()), 1000);
    return () => clearInterval(iv);
  }, []);
  if (!open) return (
    <button onClick={() => setOpen(true)} style={{position:"fixed",bottom:"20px",left:"20px",zIndex:4000,background:"rgba(0,0,0,0.7)",border:"1px solid rgba(0,255,0,0.25)",borderRadius:"8px",padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",backdropFilter:"blur(10px)"}}>
      <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#ff0000",display:"inline-block",animation:"statusBlink 1s infinite"}}/>
      <span style={{fontSize:"9px",color:"rgba(0,255,0,0.6)",fontFamily:"monospace",letterSpacing:"0.1em"}}>CAM-01</span>
    </button>
  );
  return (
    <div style={{position:"fixed",bottom:"16px",left:"12px",zIndex:4000,width:"180px",background:"rgba(0,0,0,0.85)",border:"1px solid rgba(0,255,0,0.25)",borderRadius:"10px",overflow:"hidden",backdropFilter:"blur(10px)",fontFamily:"monospace"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 8px",background:"rgba(0,0,0,0.6)",borderBottom:"1px solid rgba(0,255,0,0.15)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
          <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#ff0000",display:"inline-block",animation:"statusBlink 1s infinite"}}/>
          <span style={{fontSize:"9px",color:"rgba(0,255,0,0.7)",letterSpacing:"0.15em"}}>CAM-01 LIVE</span>
        </div>
        <button onClick={() => setOpen(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontSize:"10px",cursor:"pointer",padding:0}}>✕</button>
      </div>
      <div style={{height:"105px",overflow:"hidden",position:"relative"}}>
        <CCTVStatic w={190} h={105}/>
        <div style={{position:"absolute",inset:0,background:"rgba(0,255,0,0.03)",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"5px 7px",pointerEvents:"none"}}>
          <div style={{fontSize:"8px",color:"rgba(0,255,0,0.5)"}}>DOJOJIN TECH  //  ZONE A</div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:"8px",color:"rgba(255,255,255,0.3)"}}>{time} ICT</span>
            <span style={{fontSize:"8px",color:"rgba(0,255,180,0.5)"}}>UTC+7</span>
          </div>
        </div>
      </div>
      <div style={{padding:"5px 8px",background:"rgba(0,0,0,0.4)",fontSize:"8px",color:"rgba(0,255,0,0.4)",letterSpacing:"0.1em",display:"flex",justifyContent:"space-between"}}>
        <span>Bosch 8100i</span>
        <span style={{color:"rgba(0,255,180,0.5)"}}>ONLINE</span>
      </div>
    </div>
  );
}

function ToastStack() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    let timer;
    const add = () => {
      const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      const id = Date.now();
      setToasts(p => [...p.slice(-3), {...ev, id}]);
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
    };
    const loop = () => { add(); timer = setTimeout(loop, 30000 + Math.random() * 25000); };
    const init = setTimeout(loop, 20000);
    return () => { clearTimeout(init); clearTimeout(timer); };
  }, []);
  return (
    <div style={{position:"fixed",top:"70px",right:"20px",zIndex:5000,display:"flex",flexDirection:"column",gap:"8px",pointerEvents:"none",width:"min(280px,calc(100vw - 40px))"}}>
      {toasts.map(t => (
        <div key={t.id} style={{background:"rgba(3,11,20,0.92)",border:`1px solid ${t.color}44`,borderRadius:"12px",padding:"10px 14px",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",gap:"10px",animation:"toastIn 0.3s ease"}}>
          <span style={{fontSize:"16px",flexShrink:0}}>{t.icon}</span>
          <div>
            <div style={{fontSize:"9px",letterSpacing:"0.2em",color:t.color,marginBottom:"2px"}}>SYSTEM EVENT</div>
            <div style={{fontSize:"11px",color:"rgba(255,255,255,0.65)",fontFamily:"monospace"}}>{t.msg}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MotionNotif() {
  const [notif, setNotif] = useState(null);
  useEffect(() => {
    let timer;
    const show = () => {
      setNotif(MOTION_ALERTS[Math.floor(Math.random() * MOTION_ALERTS.length)]);
      setTimeout(() => setNotif(null), 5000);
      timer = setTimeout(show, 90000 + Math.random() * 60000);
    };
    const init = setTimeout(show, 45000);
    return () => { clearTimeout(init); clearTimeout(timer); };
  }, []);
  if (!notif) return null;
  return (
    <div style={{position:"fixed",top:"70px",left:"50%",transform:"translateX(-50%)",zIndex:8000,background:"rgba(255,0,0,0.1)",border:"1px solid rgba(255,68,102,0.6)",borderRadius:"12px",padding:"10px 20px",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",gap:"10px",whiteSpace:"nowrap",fontFamily:"monospace",animation:"toastIn 0.3s ease"}}>
      <span style={{width:"8px",height:"8px",borderRadius:"50%",background:"#ff4466",flexShrink:0,animation:"statusBlink 0.5s infinite",display:"inline-block"}}/>
      <span style={{fontSize:"12px",color:"rgba(255,68,102,0.9)",letterSpacing:"0.1em"}}>MOTION DETECTED</span>
      <span style={{fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>{notif}</span>
    </div>
  );
}

function ContextMenuOverlay() {
  const [menu, setMenu] = useState(null);
  useEffect(() => {
    const ctx = (e) => { e.preventDefault(); setMenu({x:e.clientX,y:e.clientY}); };
    const close = () => setMenu(null);
    const key = (e) => e.key === "Escape" && close();
    document.addEventListener("contextmenu", ctx);
    document.addEventListener("click", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("contextmenu", ctx);
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", key);
    };
  }, []);
  if (!menu) return null;
  const x = Math.min(menu.x, window.innerWidth - 220);
  const y = Math.min(menu.y, window.innerHeight - CONTEXT_ITEMS.length * 38 - 16);
  return (
    <div style={{position:"fixed",left:x,top:y,zIndex:9500,background:"rgba(3,11,20,0.95)",border:"1px solid rgba(0,255,180,0.25)",borderRadius:"12px",padding:"6px",backdropFilter:"blur(20px)",boxShadow:"0 8px 40px rgba(0,0,0,0.6)",minWidth:"200px",fontFamily:"monospace"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:"9px",letterSpacing:"0.25em",color:"rgba(0,255,180,0.35)",padding:"4px 10px 8px",borderBottom:"1px solid rgba(255,255,255,0.05)",marginBottom:"4px"}}>
        dojoman@dojojin.tech:~$
      </div>
      {CONTEXT_ITEMS.map((item, i) => (
        <button key={i} onClick={() => { setMenu(null); item.action?.(); }}
          style={{display:"block",width:"100%",textAlign:"left",background:"none",border:"none",color:"rgba(255,255,255,0.65)",fontSize:"12px",padding:"8px 12px",cursor:"pointer",borderRadius:"8px",letterSpacing:"0.03em",fontFamily:"monospace"}}
          onMouseEnter={e=>{e.target.style.background="rgba(0,255,180,0.08)";e.target.style.color="#fff";}}
          onMouseLeave={e=>{e.target.style.background="none";e.target.style.color="rgba(255,255,255,0.65)";}}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ══════ CONTENT COMPONENTS ══════ */
const KEYBOARD_KEYS = [
  "Esc","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","Del",
  "1","2","3","4","5","6","7","8","9","0","Backspace",
  "Tab","Q","W","E","R","T","Y","U","I","O","P",
  "CapsLk","A","S","D","F","G","H","J","K","L","Enter",
  "Shift","Z","X","C","V","B","N","M","Shift",
  "Ctrl","Alt","Space","Alt","Ctrl","←","↑","↓","→",
  "git","push","sudo","npm","pip","docker","nginx","ssh","curl","grep",
  "vim","nano","bash","zsh","cat","ls","cd","rm","ps","kill",
  "DOJOJIN",".TECH","DEV","CHAOS","BUILD","BREAK","REPEAT","DEPLOY",
  "MQTT","BOSCH","YOLO","CCTV","8100i","OpenCV","FFmpeg","Tunnel",
];

function KeyboardTicker({ reverse = false }) {
  const keys = [...KEYBOARD_KEYS, ...KEYBOARD_KEYS, ...KEYBOARD_KEYS];
  return (
    <div style={{overflow:"hidden",width:"100%",padding:"10px 0",borderTop:"1px solid rgba(0,255,180,0.1)",borderBottom:"1px solid rgba(0,255,180,0.1)",background:"rgba(0,0,0,0.4)"}}>
      <div style={{display:"flex",gap:"8px",width:"max-content",animation:`${reverse?"tickerR":"ticker"} 60s linear infinite`}}>
        {keys.map((key, i) => {
          const isSp  = ["DOJOJIN",".TECH","DEV","CHAOS","BUILD","BREAK","REPEAT","DEPLOY"].includes(key);
          const isPr  = ["MQTT","BOSCH","YOLO","CCTV","8100i","OpenCV","FFmpeg","Tunnel"].includes(key);
          const isCmd = ["git","push","sudo","npm","pip","docker","nginx","ssh","curl","grep","vim","nano","bash","zsh","cat","ls","cd","rm","ps","kill"].includes(key);
          return (
            <span key={i} style={{
              display:"inline-flex",alignItems:"center",justifyContent:"center",
              padding:isSp?"4px 10px":"4px 8px",borderRadius:"6px",
              fontSize:isSp?"11px":"10px",fontFamily:"'JetBrains Mono',monospace",
              fontWeight:isSp?"700":"500",letterSpacing:isSp?"0.15em":"0.05em",
              whiteSpace:"nowrap",userSelect:"none",
              background:isSp?"linear-gradient(135deg,rgba(0,255,180,0.2),rgba(0,180,255,0.2))":isPr?"rgba(255,180,0,0.15)":isCmd?"rgba(120,80,255,0.2)":"rgba(255,255,255,0.06)",
              border:isSp?"1px solid rgba(0,255,180,0.5)":isPr?"1px solid rgba(255,180,0,0.4)":isCmd?"1px solid rgba(120,80,255,0.35)":"1px solid rgba(255,255,255,0.12)",
              color:isSp?"#00ffb4":isPr?"#f59e0b":isCmd?"#a78bfa":"rgba(255,255,255,0.55)",
            }}>{key}</span>
          );
        })}
      </div>
    </div>
  );
}

function TerminalLine({ text, delay=0, color="#00ffb4", prefix=">" }) {
  const [vis, setVis] = useState(false);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setVis(true);
      let i = 0;
      const iv = setInterval(() => { setTyped(text.slice(0,i+1)); i++; if (i >= text.length) clearInterval(iv); }, 28);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  if (!vis) return null;
  return (
    <div style={{display:"flex",gap:"8px",alignItems:"flex-start",marginBottom:"4px"}}>
      <span style={{color,fontFamily:"monospace",fontSize:"13px",flexShrink:0}}>{prefix}</span>
      <span style={{color:"rgba(255,255,255,0.75)",fontFamily:"monospace",fontSize:"13px"}}>
        {typed}{typed.length < text.length && <span style={{animation:"blink 0.8s infinite",color}}>█</span>}
      </span>
    </div>
  );
}

function GlitchText({ text }) {
  const [frame, setFrame] = useState(null);
  useEffect(() => {
    const chars = "ABCDEF0123456789!@#$%";
    const makeFrame = () => text.split("").map((char) => {
      const colorRoll = Math.random();
      const charRoll = Math.random();
      return {
        char: charRoll > 0.8 ? chars[Math.floor(Math.random() * chars.length)] : char,
        color: colorRoll > 0.7 ? "#ff0080" : colorRoll > 0.5 ? "#00ffb4" : undefined,
      };
    });
    const iv = setInterval(() => {
      setFrame(makeFrame());
      setTimeout(() => setFrame(null), 150);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(iv);
  }, [text]);
  if (!frame) return <span>{text}</span>;
  return <span>{frame.map(({ char, color }, i) => <span key={i} style={{color}}>{char}</span>)}</span>;
}

function StatBar({ label, value, color="#00ffb4" }) {
  return (
    <div style={{marginBottom:"14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
        <span style={{fontSize:"12px",fontFamily:"monospace",color:"rgba(255,255,255,0.5)"}}>{label}</span>
        <span style={{fontSize:"12px",fontFamily:"monospace",color}}>{value}%</span>
      </div>
      <div style={{height:"4px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${value}%`,background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:"2px",boxShadow:`0 0 8px ${color}66`}}/>
      </div>
    </div>
  );
}

function NowSection() {
  return (
    <div style={{background:"rgba(0,180,255,0.04)",border:"1px solid rgba(0,180,255,0.2)",borderRadius:"16px",padding:"18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
        <span style={{fontSize:"16px"}}>⚡</span>
        <div>
          <div style={{fontSize:"12px",fontWeight:"700",color:"#00b4ff",letterSpacing:"0.1em"}}>NOW</div>
          <div style={{fontSize:"10px",color:"rgba(255,255,255,0.25)",letterSpacing:"0.15em"}}>// สิ่งที่กำลังทำอยู่</div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
        {NOW_ITEMS.map((item,i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",background:"rgba(0,0,0,0.25)",borderRadius:"9px",padding:"7px 10px"}}>
            <span style={{fontSize:"14px",flexShrink:0}}>{item.icon}</span>
            <div style={{flex:1,minWidth:0,fontSize:"11px",color:"rgba(255,255,255,0.5)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.task}</div>
            <div style={{fontSize:"8px",padding:"2px 6px",borderRadius:"5px",fontWeight:"700",letterSpacing:"0.08em",background:`${item.color}18`,color:item.color,border:`1px solid ${item.color}33`,flexShrink:0}}>{item.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DevConfession() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i+1) % CONFESSIONS.length); setFade(true); }, 400);
    }, 5000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{background:"rgba(255,68,102,0.04)",border:"1px solid rgba(255,68,102,0.18)",borderRadius:"16px",padding:"18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
        <span style={{fontSize:"16px"}}>😳</span>
        <div>
          <div style={{fontSize:"12px",fontWeight:"700",color:"#ff4466",letterSpacing:"0.1em"}}>DEV CONFESSION</div>
          <div style={{fontSize:"10px",color:"rgba(255,255,255,0.25)",letterSpacing:"0.15em"}}>// confession #{idx+1}/{CONFESSIONS.length}</div>
        </div>
      </div>
      <div style={{fontSize:"12px",color:"rgba(255,255,255,0.5)",lineHeight:"1.75",fontFamily:"monospace",opacity:fade?1:0,transition:"opacity 0.35s ease",minHeight:"36px"}}>
        {CONFESSIONS[idx]}
      </div>
    </div>
  );
}

function CaseStudiesSection() {
  return (
    <section className="case-section">
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"22px",paddingBottom:"14px",borderBottom:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap"}}>
        <span style={{fontSize:"14px",fontWeight:"700",color:"rgba(255,255,255,0.75)",letterSpacing:"0.1em"}}>● CASE STUDIES</span>
        <div style={{flex:1,minWidth:"160px",height:"1px",background:"linear-gradient(90deg,rgba(0,255,180,0.2),transparent)"}}/>
        <span style={{fontSize:"10px",color:"rgba(0,255,180,0.45)",letterSpacing:"0.15em"}}>real problems // shipped systems</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:"16px"}}>
        {CASE_STUDIES.map((item) => (
          <article key={item.title} className="case-card" style={{background:"rgba(255,255,255,0.018)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"18px",padding:"22px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${item.color}09,transparent 48%)`,pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"12px",marginBottom:"16px"}}>
                <div style={{display:"flex",gap:"12px",alignItems:"center",minWidth:0}}>
                  <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`${item.color}12`,border:`1px solid ${item.color}36`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>{item.icon}</div>
                  <div style={{minWidth:0}}>
                    <h2 style={{fontSize:"15px",margin:"0 0 5px",color:"rgba(255,255,255,0.9)",lineHeight:1.35}}>{item.title}</h2>
                    <div style={{fontSize:"9px",letterSpacing:"0.15em",color:item.color,fontWeight:"700"}}>{item.tag}</div>
                  </div>
                </div>
                <span style={{fontSize:"10px",color:item.color,border:`1px solid ${item.color}33`,background:`${item.color}08`,borderRadius:"999px",padding:"4px 9px",whiteSpace:"nowrap"}}>SHIPPED</span>
              </div>
              {[
                ["Problem", item.problem],
                ["Solution", item.solution],
                ["Result", item.result],
              ].map(([label, text]) => (
                <div key={label} style={{marginBottom:"13px"}}>
                  <div style={{fontSize:"10px",letterSpacing:"0.16em",color:"rgba(255,255,255,0.28)",marginBottom:"5px"}}>{label.toUpperCase()}</div>
                  <p style={{fontSize:"12px",lineHeight:1.75,color:"rgba(255,255,255,0.5)",margin:0}}>{text}</p>
                </div>
              ))}
              <div style={{display:"flex",flexWrap:"wrap",gap:"5px",paddingTop:"4px"}}>
                {item.stack.map((tech) => (
                  <span key={tech} style={{fontSize:"10px",padding:"2px 8px",borderRadius:"5px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.42)"}}>{tech}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectsPage() {
  const [hov, setHov] = useState(null);
  return (
    <div style={{maxWidth:"1280px",margin:"0 auto",padding:"32px"}}>
      <div style={{marginBottom:"28px",paddingBottom:"16px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",gap:"12px"}}>
        <span style={{fontSize:"14px",fontWeight:"700",color:"rgba(255,255,255,0.7)",letterSpacing:"0.1em"}}>● PROJECTS</span>
        <div style={{flex:1,height:"1px",background:"linear-gradient(90deg,rgba(0,255,180,0.2),transparent)"}}/>
        <span style={{fontSize:"10px",color:"rgba(0,255,180,0.5)",letterSpacing:"0.15em"}}>{PROJECTS.length} deployed (mostly)</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(340px,100%),1fr))",gap:"16px"}}>
        {PROJECTS.map((proj, i) => (
          <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{background:hov===i?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.015)",border:`1px solid ${hov===i?proj.color+"44":"rgba(255,255,255,0.07)"}`,borderRadius:"20px",padding:"24px",transition:"all 0.25s",position:"relative",overflow:"hidden"}}>
            {hov===i && <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 30% 30%,${proj.color}06,transparent 60%)`,pointerEvents:"none"}}/>}
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`${proj.color}12`,border:`1px solid ${proj.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>{proj.emoji}</div>
                <div>
                  <div style={{fontSize:"14px",fontWeight:"700",color:"rgba(255,255,255,0.9)",marginBottom:"4px"}}>{proj.name}</div>
                  <div style={{fontSize:"9px",padding:"2px 7px",borderRadius:"5px",display:"inline-block",background:`${proj.statusColor}18`,color:proj.statusColor,border:`1px solid ${proj.statusColor}33`,letterSpacing:"0.1em",fontWeight:"700"}}>{proj.status}</div>
                </div>
              </div>
              {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{fontSize:"10px",color:proj.color,border:`1px solid ${proj.color}33`,borderRadius:"8px",padding:"4px 10px",textDecoration:"none",letterSpacing:"0.1em",background:`${proj.color}08`,whiteSpace:"nowrap"}}>VISIT ↗</a>}
            </div>
            <p style={{fontSize:"12px",color:"rgba(255,255,255,0.45)",lineHeight:"1.8",margin:"0 0 16px",minHeight:"54px"}}>{proj.desc}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
              {proj.tech.map((t,j) => <span key={j} style={{fontSize:"10px",padding:"2px 8px",borderRadius:"5px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.4)"}}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TerminalPage() {
  const [history, setHistory] = useState([
    {type:"sys", text:"DOJOJIN.TECH // TERMINAL — chaos edition"},
    {type:"sys", text:"dojoman@dojojin.tech:~$   UTC+7"},
    {type:"sys", text:"────────────────────────────────────"},
    {type:"sys", text:"type 'help' for available commands"},
  ]);
  const [input, setInput]     = useState("");
  const [cmdHist, setCmdHist] = useState([]);
  const [cmdIdx, setCmdIdx]   = useState(-1);
  const botRef = useRef(null);
  const inpRef = useRef(null);
  useEffect(() => { botRef.current?.scrollIntoView({behavior:"smooth"}); }, [history]);
  const submit = () => {
    if (!input.trim()) return;
    const cmd = input.trim();
    const res = processCommand(cmd);
    setCmdHist(h => [cmd, ...h]);
    setCmdIdx(-1);
    if (res === "CLEAR") {
      setHistory([{type:"sys", text:"Screen cleared. chaos remains."}]);
    } else {
      setHistory(h => [...h, {type:"in", text:cmd}, ...(res ? [{type:"out", text:res}] : [])]);
    }
    setInput("");
  };
  const onKey = (e) => {
    if (e.key === "Enter") { submit(); return; }
    if (e.key === "ArrowUp") { const ni=Math.min(cmdIdx+1,cmdHist.length-1); setCmdIdx(ni); setInput(cmdHist[ni]||""); }
    if (e.key === "ArrowDown") { const ni=Math.max(cmdIdx-1,-1); setCmdIdx(ni); setInput(ni===-1?"":cmdHist[ni]); }
  };
  return (
    <div style={{maxWidth:"1280px",margin:"0 auto",padding:"32px"}}>
      <div style={{background:"rgba(0,0,0,0.7)",border:"1px solid rgba(0,255,180,0.2)",borderRadius:"16px",overflow:"hidden",height:"calc(100vh - 280px)",minHeight:"360px",display:"flex",flexDirection:"column"}}>
        <div style={{background:"rgba(0,255,180,0.05)",padding:"10px 16px",borderBottom:"1px solid rgba(0,255,180,0.1)",display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{display:"flex",gap:"6px"}}>
            {["#ff4466","#f59e0b","#00ffb4"].map(c => <div key={c} style={{width:"12px",height:"12px",borderRadius:"50%",background:c,opacity:0.8}}/>)}
          </div>
          <span style={{fontFamily:"monospace",fontSize:"12px",color:"rgba(0,255,180,0.6)",letterSpacing:"0.2em"}}>dojoman@dojojin.tech:~$ — BASH (chaos edition)</span>
        </div>
        <div style={{flex:1,overflow:"auto",padding:"16px 20px",fontFamily:"monospace",fontSize:"13px",lineHeight:"1.7",cursor:"text"}} onClick={() => inpRef.current?.focus()}>
          {history.map((line,i) => (
            <div key={i} style={{marginBottom:"2px",color:line.type==="in"?"#00ffb4":line.type==="sys"?"rgba(0,255,180,0.3)":"rgba(255,255,255,0.65)",whiteSpace:"pre-wrap"}}>
              {line.type==="in" && <span style={{color:"rgba(0,255,180,0.5)"}}>$ </span>}{line.text}
            </div>
          ))}
          <div ref={botRef}/>
        </div>
        <div style={{borderTop:"1px solid rgba(0,255,180,0.1)",padding:"12px 16px",display:"flex",alignItems:"center",gap:"10px",background:"rgba(0,0,0,0.3)"}}>
          <span style={{color:"#00ffb4",fontFamily:"monospace",fontSize:"13px",flexShrink:0}}>$</span>
          <input ref={inpRef} autoFocus value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
            placeholder="type a command..."
            style={{flex:1,background:"transparent",border:"none",outline:"none",color:"rgba(255,255,255,0.85)",fontFamily:"monospace",fontSize:"13px",caretColor:"#00ffb4"}}/>
          <button onClick={submit} style={{background:"rgba(0,255,180,0.1)",border:"1px solid rgba(0,255,180,0.3)",color:"#00ffb4",fontFamily:"monospace",fontSize:"11px",padding:"4px 12px",borderRadius:"6px",cursor:"pointer",letterSpacing:"0.1em"}}>
            EXEC
          </button>
        </div>
      </div>
    </div>
  );
}

const EXPERIENCES = [
  { role:"Freelance Dev", period:"ปัจจุบัน", color:"#00ffb4", icon:"💻", items:["Full-stack web development — React, Node.js, Express, Vite","Computer Vision pipelines — YOLO, OpenCV/CV2, FFmpeg","AI/ML integration — Ollama, OpenWebUI, DeepSeek, Gemma, Qwen, Stack AI","Infrastructure & DevOps — Docker, Nginx, Cloudflare Tunnel, Reverse Proxy","ANPR / Vehicle Detection systems (Hikvision ISAPI + Elasticsearch)","Metadata Dashboards, AI OCR, Crowd Density analytics","C++ performance tooling & Linux server management"] },
  { role:"System Engineer", period:"Mar 2017 – Present", color:"#00b4ff", icon:"⚙️", items:["Maintenance and troubleshooting of complex infrastructure environments","Analyzed stakeholder needs, generated requirements, and implemented Requirements Management Plans","Defined technical integration strategy and developed Integration plans","Assisted with designing information and operational support systems","Collected, analyzed, and reported program metrics including KPIs and technical performance measures","Designed and delivered mission-critical infrastructure for maximum availability, performance, and security"] },
  { role:"Social Media Specialist", period:"Aug 2016 – Mar 2017", color:"#a78bfa", icon:"📱", items:["Generated, edited, published and distributed daily multi-format content","Built and executed social media strategy through competitive and audience research","Set up and optimized company pages within each social media platform","Analyzed social data/metrics and continuously improved strategy","Content seeding across multiple channels"] },
  { role:"QA Engineer & Product Marketing", period:"Jan 2013 – Jul 2016", color:"#f59e0b", icon:"🔬", items:["Analyzed and interpreted test data; prepared technical reports","Implemented QA methodologies, testing frameworks, and quality controls","Identified new product opportunities; developed business cases","Developed and managed marketing programs","Mobile QC from factory as i-mobile requirement"] },
  { role:"IT Consultant & Sales Representative", period:"Feb 2006 – Jan 2013", color:"#ff4466", icon:"🤝", items:["Designed and built webpages for government agencies and private clients","Developed marketing plans, sales strategies, and targets","Installed and repaired hardware, software, and peripheral equipment","Conducted computer diagnostics to investigate and resolve problems","Maintained strong customer relationships through post-sales follow-up"] },
  { role:"Technical Support", period:"Jan 2003 – Jan 2006", color:"#34d399", icon:"🛠️", items:["Prepared and presented technical proposals","Developed IT strategic vision and drove key departmental objectives","Installed and repaired hardware, software, and peripheral equipment","Worked within each organization's budget to implement solutions"] },
  { role:"Tutor & Teacher", period:"ช่วงต้นอาชีพ", color:"#fb923c", icon:"📚", items:["C++ programming fundamentals","Computer Techniques — hardware investigation and repair","How Computers Work & Computer Architecture","Basic HTML web development"] },
];

function BiographyPage() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <div className="bio-wrap">
      <div style={{background:"rgba(0,255,180,0.03)",border:"1px solid rgba(0,255,180,0.15)",borderRadius:"20px",padding:"28px 32px",marginBottom:"28px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"10px",background:"rgba(0,255,180,0.1)",border:"1px solid rgba(0,255,180,0.3)",display:"flex",alignItems:"center",justifyContent:"center",color:"#00ffb4",fontSize:"16px",fontWeight:"700"}}>●</div>
          <div>
            <div style={{fontSize:"14px",fontWeight:"700",color:"#00ffb4",letterSpacing:"0.1em"}}>HIGHLIGHT</div>
            <div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.15em"}}>// career_summary.txt</div>
          </div>
        </div>
        <p style={{fontSize:"14px",color:"rgba(255,255,255,0.65)",lineHeight:"1.9",margin:0}}>
          Experienced <span style={{color:"#00ffb4"}}>System Engineer</span> with a demonstrated history in the telecommunications industry. Skilled across <span style={{color:"#a78bfa"}}>development</span>, <span style={{color:"#00b4ff"}}>content marketing</span>, and <span style={{color:"#f59e0b"}}>digital marketing</span>. Strong IT background spanning infrastructure, AI/ML, computer vision, web development, and full-stack engineering — built through 20+ years of hands-on chaos.
        </p>
        <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"20px"}}>
          {["20+ yrs experience","7 roles","3 industries","∞ coffee consumed","🇹🇭 UTC+7","1 life.exe (barely running)"].map(tag => (
            <span key={tag} style={{fontSize:"10px",padding:"4px 10px",borderRadius:"20px",background:"rgba(0,255,180,0.07)",border:"1px solid rgba(0,255,180,0.2)",color:"rgba(0,255,180,0.7)",letterSpacing:"0.08em"}}>{tag}</span>
          ))}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px",paddingBottom:"12px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <span style={{fontSize:"14px",fontWeight:"700",color:"rgba(255,255,255,0.7)",letterSpacing:"0.1em"}}>● EXPERIENCE</span>
        <div style={{flex:1,height:"1px",background:"linear-gradient(90deg,rgba(0,255,180,0.2),transparent)"}}/>
        <span style={{fontSize:"10px",color:"rgba(0,255,180,0.5)",letterSpacing:"0.15em"}}>{EXPERIENCES.length} roles</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {EXPERIENCES.map((exp, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} style={{background:isOpen?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.015)",border:`1px solid ${isOpen?exp.color+"44":"rgba(255,255,255,0.06)"}`,borderRadius:"16px",overflow:"hidden",transition:"all 0.25s"}}>
              <div onClick={() => setOpenIdx(isOpen?null:i)} style={{display:"flex",alignItems:"center",gap:"14px",padding:"16px 20px",cursor:"pointer"}}>
                <div style={{width:"42px",height:"42px",borderRadius:"12px",flexShrink:0,background:`${exp.color}18`,border:`1px solid ${exp.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px"}}>{exp.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"14px",fontWeight:"700",color:"rgba(255,255,255,0.9)"}}>{exp.role}</div>
                  <div style={{fontSize:"11px",color:exp.color,marginTop:"2px",letterSpacing:"0.08em"}}>{exp.period}</div>
                </div>
                <div style={{width:"26px",height:"26px",borderRadius:"6px",flexShrink:0,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",color:"rgba(255,255,255,0.4)",transition:"transform 0.25s",transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</div>
              </div>
              {isOpen && (
                <div style={{padding:"0 20px 20px 76px"}} className="bio-body">
                  <div style={{height:"1px",background:"rgba(255,255,255,0.04)",marginBottom:"16px"}}/>
                  {exp.items.map((item,j) => (
                    <div key={j} style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"12px"}}>
                      <span style={{color:exp.color,fontSize:"10px",marginTop:"4px",flexShrink:0}}>▸</span>
                      <span style={{fontSize:"13px",color:"rgba(255,255,255,0.6)",lineHeight:"1.8"}}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════ VISITOR COUNTER — Firebase Firestore ══════ */
function useVisitorCount() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    if (!db) return;
    const ref = doc(db, "meta", "visitors");
    // Increment once per session
    if (!sessionStorage.getItem("dojojin_visited")) {
      sessionStorage.setItem("dojojin_visited", "1");
      runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const cur  = snap.exists() ? (snap.data().count || 0) : 0;
        tx.set(ref, { count: cur + 1 });
      }).catch(() => {});
    }
    // Real-time listener
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setCount(snap.data().count ?? 0);
    });
    return unsub;
  }, []);
  return count;
}

function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [name,     setName]     = useState("");
  const [msg,      setMsg]      = useState("");
  const [status,   setStatus]   = useState(null); // "ok"|"err"|"spam"|"sending"
  const [ownerBox, setOwnerBox] = useState(false);
  const [ownerUser, setOwnerUser] = useState(null);
  const ownerEmail = ownerUser?.email?.toLowerCase() || "";
  const isOwner = Boolean(ownerEmail && OWNER_EMAILS.includes(ownerEmail));

  useEffect(() => onAuthStateChanged(auth, setOwnerUser), []);

  // Real-time listener from Firestore
  useEffect(() => {
    const q = query(collection(db, "comments"), orderBy("ts", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const SPAM_WORDS = ["http://","https://","<script","onclick","javascript:","viagra","casino","free money","click here"];
  const isSpam = (t) => SPAM_WORDS.some(w => t.toLowerCase().includes(w));

  const submit = async () => {
    const n = name.trim().slice(0, 40);
    const m = msg.trim().slice(0, 300);
    if (!n || !m)          { setStatus("err");  return; }
    if (isSpam(n)||isSpam(m)) { setStatus("spam"); return; }
    setStatus("sending");
    try {
      await addDoc(collection(db, "comments"), { name: n, msg: m, ts: serverTimestamp() });
      setName(""); setMsg(""); setStatus("ok");
      setTimeout(() => setStatus(null), 3000);
    } catch { setStatus("err"); }
  };

  const deleteComment = async (id) => {
    if (!isOwner) return;
    try {
      await deleteDoc(doc(db, "comments", id));
    } catch {
      setStatus("err");
    }
  };

  const loginOwner = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setOwnerBox(false);
    } catch {
      setStatus("err");
    }
  };

  const logoutOwner = async () => {
    try {
      await signOut(auth);
    } finally {
      setOwnerBox(false);
    }
  };

  const fmtDate = (ts) => {
    if (!ts) return "";
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString("th-TH", { timeZone:"Asia/Bangkok", dateStyle:"short", timeStyle:"short" });
    } catch { return ""; }
  };

  const EMOJIS = ["🧑‍💻","👾","🎯","🐳","⚡","🦾","🤖","💀"];
  // stable emoji per comment derived from doc id
  const emojiFor = (id) => EMOJIS[id.split("").reduce((a,c)=>a+c.charCodeAt(0),0) % EMOJIS.length];

  return (
    <div className="bio-wrap">

      {/* ── Header ── */}
      <div style={{background:"rgba(120,80,255,0.04)",border:"1px solid rgba(120,80,255,0.2)",borderRadius:"20px",padding:"28px 32px",marginBottom:"24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"8px",flexWrap:"wrap"}}>
          <span style={{fontSize:"22px"}}>💬</span>
          <div style={{flex:1}}>
            <div style={{fontSize:"14px",fontWeight:"700",color:"#a78bfa",letterSpacing:"0.1em"}}>GUESTBOOK</div>
            <div style={{fontSize:"10px",color:"rgba(255,255,255,0.25)",letterSpacing:"0.15em"}}>// ฝากข้อความถึงเจ้าของเว็บได้เลย · real-time via Firebase</div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <span style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>{comments.length} messages</span>
            {!ownerUser ? (
              <button onClick={() => setOwnerBox(b=>!b)}
                style={{padding:"5px 12px",borderRadius:"8px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.35)",fontSize:"10px",cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.08em"}}>
                🔐 owner
              </button>
            ) : !isOwner ? (
              <button onClick={logoutOwner}
                title={OWNER_EMAILS.length ? "Signed in, but this email is not in VITE_OWNER_EMAILS" : "Set VITE_OWNER_EMAILS to enable owner mode"}
                style={{padding:"5px 12px",borderRadius:"8px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.25)",color:"#f59e0b",fontSize:"10px",cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.08em"}}>
                signed in
              </button>
            ) : (
              <button onClick={logoutOwner}
                style={{padding:"5px 12px",borderRadius:"8px",background:"rgba(0,255,180,0.08)",border:"1px solid rgba(0,255,180,0.3)",color:"#00ffb4",fontSize:"10px",letterSpacing:"0.08em",cursor:"pointer",fontFamily:"inherit"}}>
                ✓ OWNER MODE
              </button>
            )}
          </div>
        </div>

        {/* owner login */}
        {ownerBox && !ownerUser && (
          <div style={{marginTop:"14px",display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
            <button onClick={loginOwner}
              style={{padding:"8px 16px",borderRadius:"8px",background:"rgba(120,80,255,0.12)",border:"1px solid rgba(120,80,255,0.4)",color:"#a78bfa",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>
              Sign in with Google
            </button>
            <span style={{fontSize:"10px",color:"rgba(255,255,255,0.3)"}}>
              owner mode uses Firebase Auth + VITE_OWNER_EMAILS
            </span>
          </div>
        )}
      </div>

      {/* ── Form ── */}
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"16px",padding:"22px 24px",marginBottom:"20px"}}>
        <div style={{fontSize:"11px",color:"rgba(0,255,180,0.5)",letterSpacing:"0.15em",marginBottom:"14px"}}>// NEW MESSAGE</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:"10px",marginBottom:"10px"}}>
          <input value={name} onChange={e=>setName(e.target.value)} maxLength={40}
            placeholder="ชื่อ / handle"
            style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",padding:"10px 14px",color:"rgba(255,255,255,0.7)",fontSize:"12px",fontFamily:"inherit",outline:"none"}}/>
          <input value={msg} onChange={e=>setMsg(e.target.value)} maxLength={300}
            placeholder="ข้อความ... (max 300 chars)"
            onKeyDown={e=>e.key==="Enter"&&submit()}
            style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",padding:"10px 14px",color:"rgba(255,255,255,0.7)",fontSize:"12px",fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
          <div style={{fontSize:"10px",color:"rgba(255,255,255,0.2)"}}>
            {msg.length}/300 · no links · no spam
          </div>
          <button onClick={submit} disabled={status==="sending"}
            style={{padding:"8px 22px",borderRadius:"10px",background:status==="sending"?"rgba(255,255,255,0.04)":"rgba(0,255,180,0.1)",border:`1px solid ${status==="sending"?"rgba(255,255,255,0.1)":"rgba(0,255,180,0.35)"}`,color:status==="sending"?"rgba(255,255,255,0.3)":"#00ffb4",fontSize:"12px",fontWeight:"700",cursor:status==="sending"?"not-allowed":"pointer",letterSpacing:"0.08em",fontFamily:"inherit",transition:"all 0.2s"}}>
            {status==="sending" ? "pushing..." : `git commit -m "${name||"anon"}" 🚀`}
          </button>
        </div>
        <div style={{marginTop:"10px",minHeight:"18px",fontFamily:"monospace",fontSize:"11px"}}>
          {status==="ok"   && <span style={{color:"#00ffb4"}}>✓ comment pushed to Firestore! (no -f needed)</span>}
          {status==="err"  && <span style={{color:"#ff4466"}}>✗ กรุณาใส่ชื่อและข้อความ / connection error</span>}
          {status==="spam" && <span style={{color:"#f59e0b"}}>⚠ spam filter blocked — ไม่ผ่าน</span>}
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div style={{textAlign:"center",padding:"48px",color:"rgba(255,255,255,0.15)",fontSize:"12px",fontFamily:"monospace",letterSpacing:"0.15em"}}>
          <div style={{fontSize:"28px",marginBottom:"12px",animation:"statusBlink 1s infinite"}}>📡</div>
          connecting to Firebase...
        </div>
      ) : comments.length === 0 ? (
        <div style={{textAlign:"center",padding:"48px",color:"rgba(255,255,255,0.15)",fontSize:"12px",fontFamily:"monospace",letterSpacing:"0.15em"}}>
          <div style={{fontSize:"32px",marginBottom:"12px"}}>📭</div>
          no messages yet... be the first!
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {comments.map((c, i) => (
            <div key={c.id}
              style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"14px",padding:"16px 20px",display:"flex",gap:"14px",alignItems:"flex-start",transition:"border-color 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(120,80,255,0.25)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}>
              <div style={{width:"38px",height:"38px",borderRadius:"10px",background:"rgba(120,80,255,0.1)",border:"1px solid rgba(120,80,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}>
                {emojiFor(c.id)}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"6px",flexWrap:"wrap"}}>
                  <span style={{fontSize:"13px",fontWeight:"700",color:"rgba(255,255,255,0.85)"}}>{c.name}</span>
                  <span style={{fontSize:"9px",color:"rgba(255,255,255,0.2)",letterSpacing:"0.08em"}}>{fmtDate(c.ts)}</span>
                  {i === 0 && (
                    <span style={{fontSize:"9px",padding:"1px 8px",borderRadius:"20px",background:"rgba(0,255,180,0.08)",border:"1px solid rgba(0,255,180,0.2)",color:"rgba(0,255,180,0.6)",letterSpacing:"0.1em",animation:"statusBlink 2s infinite"}}>
                      ● LATEST
                    </span>
                  )}
                </div>
                <div style={{fontSize:"13px",color:"rgba(255,255,255,0.55)",lineHeight:"1.75",wordBreak:"break-word"}}>{c.msg}</div>
              </div>
              {isOwner && (
                <button onClick={() => deleteComment(c.id)}
                  style={{padding:"4px 10px",borderRadius:"7px",background:"rgba(255,68,102,0.08)",border:"1px solid rgba(255,68,102,0.25)",color:"#ff4466",fontSize:"10px",cursor:"pointer",fontFamily:"inherit",flexShrink:0,letterSpacing:"0.08em"}}>
                  🗑 del
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TECH_ICONS = {
  "Docker":"🐳","Cloudflare Tunnel":"☁️","Nginx":"🟩","OpenWebUI":"🖥️","Ollama":"🦙",
  "Stack AI":"🧠","DeepSeek":"🔮","Gemma":"💎","Qwen":"🤖","YOLO":"🎯",
  "OpenCV / CV2":"📷","FFmpeg":"🎬","Python":"🐍","C++":"⚙️","NodeJS":"🟢",
  "ExpressJS":"🚂","Video Analytics":"📹","AI OCR":"📄","Vehicle Detection":"🚗",
  "Crowd Density":"👥","License Plate":"🔍","Translation System":"🌐",
  "Metadata Dashboard":"📊","Reverse Proxy":"🔀","Linux Server":"🐧",
  "Social Content":"📱","React":"⚛️",
};

/* ══════ MAIN COMPONENT ══════ */
export default function DevChaosProfile() {
  const [activePage,  setActivePage]  = useState("home");
  const [mousePos,    setMousePos]    = useState({ x:0, y:0 });
  const [hoveredTech, setHoveredTech] = useState(null);
  const [showKonami,  setShowKonami]  = useState(false);
  const [lightMode,   setLightMode]   = useState(false);
  const logoClicks = useRef([]);

  useDynamicTitle();
  useKonamiCode(useCallback(() => setShowKonami(true), []));
  const clock        = useLiveClock();
  const clickCount   = useClickCounter();
  const idle         = useIdleTimer(60000);
  const visitorCount = useVisitorCount();

  const profile = {
    name:    "Mr. Dojo-mAn Chaos",
    title:   "System Engineer / Infrastructure Archaeologist",
    subtitle:"Build ทุกอย่าง...แต่ยังงงบางอย่างอยู่ดี",
    quote:   "วันนึงจะไม่ต้องพิมพ์อะไรเองอีก แต่สุดท้ายยังต้องพิมพ์ว่า git push เองอยู่ดี",
    stack:   Object.keys(TECH_ICONS),
    socials: { github:"https://github.com/dojojin/", facebook:"https://facebook.com/dojojin", linkedin:"https://linkedin.com/in/prakasit", discord:"dojoman" },
  };

  const routines = [
    { time:"08:00", task:"ตื่นมา debug Docker",         icon:"🐳", status:"RUNNING" },
    { time:"14:00", task:"งง Cloudflare Tunnel",         icon:"☁️", status:"TIMEOUT" },
    { time:"20:00", task:"ทะเลาะกับ nginx",             icon:"🟩", status:"502"     },
    { time:"02:00", task:"ถามว่า Ubuntu กดพักจอยังไง", icon:"🐧", status:"???"     },
  ];

  const skills = [
    { label:"ความกล้า Deploy วันศุกร์",  value:97               },
    { label:"RAM เหลือ",                 value:2,  color:"#ff4466" },
    { label:"Coffee Level",              value:88, color:"#f59e0b" },
    { label:"Stack Overflow copy/paste", value:94, color:"#a78bfa" },
    { label:"Ctrl+Z หลัง git push -f",  value:12, color:"#ff4466" },
    { label:"อ่าน error message จริงๆ", value:31, color:"#f59e0b" },
  ];

  useEffect(() => {
    const h = (e) => setMousePos({ x:e.clientX, y:e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const handleLogoClick = () => {
    const now = Date.now();
    logoClicks.current = [...logoClicks.current, now].filter(t => now - t < 2500);
    if (logoClicks.current.length >= 5) { logoClicks.current = []; setLightMode(m => !m); }
  };

  const socialIcons = { github:"⌥", facebook:"◈", linkedin:"◉", discord:"◎" };
  const NAV_TABS = [
    { id:"home",     label:"~/home",      icon:"⌂" },
    { id:"bio",      label:"./biography", icon:"▸" },
    { id:"projects", label:"./projects",  icon:"◈" },
    { id:"terminal", label:">_ terminal", icon:"⚡" },
    { id:"comments", label:"💬 guestbook", icon:"💬" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#030b14",color:"white",fontFamily:"'JetBrains Mono','Fira Code','Courier New',monospace",overflowX:"hidden",position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700;800&display=swap');

        @keyframes blink       { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes scanMove    { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes float       { 0%,100%{transform:translateY(0px) rotate(3deg)} 50%{transform:translateY(-8px) rotate(-1deg)} }
        @keyframes pulse-glow  { 0%,100%{box-shadow:0 0 15px rgba(0,255,180,0.2)} 50%{box-shadow:0 0 35px rgba(0,255,180,0.5)} }
        @keyframes rgb-border  { 0%{border-color:rgba(0,255,180,0.4)} 33%{border-color:rgba(120,80,255,0.4)} 66%{border-color:rgba(0,180,255,0.4)} 100%{border-color:rgba(0,255,180,0.4)} }
        @keyframes statusBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes shimmer     { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes ticker      { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        @keyframes tickerR     { 0%{transform:translateX(-33.33%)} 100%{transform:translateX(0)} }
        @keyframes logoSpin    { 0%,100%{transform:rotate(-3deg) scale(1)} 50%{transform:rotate(3deg) scale(1.04)} }
        @keyframes toastIn     { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }

        .tech-card:hover   { border-color:rgba(0,255,180,0.5)!important; transform:translateY(-3px) scale(1.02)!important; background:rgba(0,255,180,0.07)!important; }
        .social-link:hover { border-color:rgba(0,255,180,0.5)!important; transform:translateX(4px)!important; }
        .routine-card:hover{ border-color:rgba(120,80,255,0.4)!important; background:rgba(120,80,255,0.08)!important; }
        .nav-btn:hover     { color:rgba(255,255,255,0.8)!important; }

        ::-webkit-scrollbar       { width:4px; }
        ::-webkit-scrollbar-track { background:rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background:rgba(0,255,180,0.3); border-radius:2px; }

        .main-grid    { display:grid; grid-template-columns:1fr 1fr 320px; gap:20px; max-width:1280px; margin:0 auto; padding:32px; }
        .case-section { max-width:1280px; margin:0 auto 24px; padding:0 32px 8px; }
        .header-inner { max-width:1280px; margin:0 auto; padding:24px 32px 16px; display:flex; gap:20px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
        .term-wrap    { max-width:1280px; margin:0 auto; padding:0 32px 16px; }
        .nav-wrap     { max-width:1280px; margin:0 auto; padding:0 32px; }
        .hero-section { max-width:1280px; margin:24px auto; padding:0 32px 32px; }
        .hero-inner   { border-radius:24px; border:1px solid rgba(255,255,255,0.06); padding:52px 48px; text-align:center; position:relative; overflow:hidden; background:rgba(0,0,0,0.3); backdrop-filter:blur(20px); }
        .site-footer  { border-top:1px solid rgba(255,255,255,0.05); padding:16px 32px; font-size:11px; color:rgba(255,255,255,0.2); letter-spacing:0.15em; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; max-width:1280px; margin:0 auto; }
        .topbar       { background:rgba(0,255,180,0.05); border-bottom:1px solid rgba(0,255,180,0.1); padding:6px 24px; display:flex; align-items:center; justify-content:space-between; font-size:10px; color:rgba(0,255,180,0.6); letter-spacing:0.2em; overflow:hidden; }
        .topbar-stats { display:flex; gap:16px; flex-shrink:0; }
        .bio-wrap     { max-width:1280px; margin:0 auto; padding:32px; }

        /* ── Tablet ── */
        @media(max-width:1024px){
          .main-grid { grid-template-columns:1fr 1fr; padding:20px; }
          .main-grid > aside { grid-column:1/-1; display:grid!important; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); }
        }

        /* ── Mobile ── */
        @media(max-width:640px){
          .main-grid      { grid-template-columns:1fr; padding:12px; gap:12px; }
          .case-section   { padding:0 12px 8px; margin-bottom:12px; }
          .main-grid > aside { grid-template-columns:1fr!important; }
          .header-inner   { padding:12px; gap:10px; flex-wrap:wrap; }
          .term-wrap      { padding:0 12px 12px; }
          .hero-section   { padding:0 12px 20px; margin:12px auto; }
          .hero-inner     { padding:24px 16px; }
          .site-footer    { padding:12px 16px; flex-direction:column; text-align:center; gap:4px; font-size:10px; }
          .topbar         { padding:5px 10px; font-size:9px; letter-spacing:0.1em; }
          .topbar-title   { display:none; }
          .topbar-stats   { gap:8px; flex-wrap:wrap; }
          .nav-wrap       { padding:0; overflow-x:auto; -webkit-overflow-scrolling:touch; }
          .nav-wrap > div { min-width:max-content; }
          .bio-wrap       { padding:14px 12px; }
          .bio-body       { padding-left:14px!important; }
          .proj-grid      { grid-template-columns:1fr!important; }
        }

        @media(max-width:480px){ .hide-xs { display:none; } }
        /* ── Nav tabs scroll on mobile ── */
        .nav-wrap { scrollbar-width:none; }
        .nav-wrap::-webkit-scrollbar { display:none; }

        /* ── Nav btn compact on mobile ── */
        @media(max-width:480px){
          .nav-btn { padding:8px 12px!important; font-size:11px!important; }
          .nav-btn .nav-icon { display:none; }
        }
      `}</style>

      {/* Fixed overlays */}
      <div style={{position:"fixed",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)",pointerEvents:"none",zIndex:1000}}/>
      <div style={{position:"fixed",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,rgba(0,255,180,0.3),transparent)",animation:"scanMove 8s linear infinite",pointerEvents:"none",zIndex:999}}/>
      <div style={{position:"fixed",left:mousePos.x-200,top:mousePos.y-200,width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,255,180,0.04) 0%,transparent 70%)",pointerEvents:"none",zIndex:1,transition:"left 0.1s,top 0.1s"}}/>
      {[{top:"20px",left:"20px",borderTop:"1px solid rgba(0,255,180,0.25)",borderLeft:"1px solid rgba(0,255,180,0.25)"},
        {top:"20px",right:"20px",borderTop:"1px solid rgba(0,255,180,0.25)",borderRight:"1px solid rgba(0,255,180,0.25)"},
        {bottom:"20px",left:"20px",borderBottom:"1px solid rgba(0,255,180,0.25)",borderLeft:"1px solid rgba(0,255,180,0.25)"},
        {bottom:"20px",right:"20px",borderBottom:"1px solid rgba(0,255,180,0.25)",borderRight:"1px solid rgba(0,255,180,0.25)"},
      ].map((s,i) => <div key={i} style={{position:"fixed",...s,width:"36px",height:"36px",zIndex:998,pointerEvents:"none"}}/>)}

      {/* Feature layers */}
      {idle       && <Screensaver/>}
      {showKonami && <KonamiPopup onClose={() => setShowKonami(false)}/>}
      {lightMode  && <LightModeOverlay onClose={() => setLightMode(false)}/>}
      <ContextMenuOverlay/>
      <ToastStack/>
      <MotionNotif/>
      <CCTVWidget/>

      {/* ══ HEADER ══ */}
      <header style={{position:"relative",borderBottom:"1px solid rgba(0,255,180,0.12)",background:"rgba(0,0,0,0.65)",backdropFilter:"blur(20px)"}}>
        <div className="topbar">
          <span className="topbar-title">DOJOJIN.TECH // SYSTEM ONLINE</span>
          <span className="topbar-stats">
            <span style={{color:"rgba(0,255,180,0.7)"}}>🇹🇭 {clock} ICT</span>
            <span className="hide-xs" style={{color:"rgba(255,255,255,0.3)"}}>UTC+7</span>
            <span className="hide-xs">CPU: 99%</span>
            <span style={{color:"#ff4466",animation:"statusBlink 1s infinite"}}>RAM: 2%</span>
            <span style={{color:"rgba(255,255,255,0.3)"}}>CLICKS: {clickCount}</span>
            {visitorCount !== null && (
              <span style={{color:"rgba(0,180,255,0.7)",fontWeight:"700"}}>👁 {visitorCount.toLocaleString()} visitors</span>
            )}
          </span>
        </div>

        <div className="header-inner">
          <div style={{display:"flex",alignItems:"center",gap:"18px",flex:1,minWidth:0}}>
            <div onClick={handleLogoClick} title="click 5x for surprise" style={{width:"60px",height:"60px",flexShrink:0,borderRadius:"14px",overflow:"hidden",border:"1px solid rgba(0,255,180,0.25)",background:"rgba(0,0,0,0.5)",animation:"logoSpin 7s ease-in-out infinite",boxShadow:"0 0 18px rgba(0,255,180,0.1)",cursor:"pointer"}}>
              <img src={logoSvg} alt="DOJOJIN" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:"10px",letterSpacing:"0.35em",color:"rgba(0,255,180,0.65)",marginBottom:"4px",display:"flex",alignItems:"center",gap:"6px"}}>
                <span>■</span> DOJOJIN.TECH — DEV_CHAOS_PORTFOLIO v3.0
              </div>
              <h1 style={{fontSize:"clamp(20px,3.2vw,44px)",fontWeight:"800",lineHeight:1.05,margin:"0 0 3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",background:"linear-gradient(135deg,#ffffff 0%,#00ffb4 50%,#00b4ff 100%)",backgroundSize:"200% 200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 4s linear infinite"}}>
                <GlitchText text={profile.name}/>
              </h1>
              <div style={{fontSize:"12px",color:"rgba(0,255,180,0.8)",letterSpacing:"0.07em"}}>{profile.title}</div>
              <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>// {profile.subtitle}</div>
            </div>
          </div>
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:"100px",height:"100px",borderRadius:"18px",background:"linear-gradient(135deg,rgba(0,255,180,0.08),rgba(0,180,255,0.08))",border:"1px solid rgba(0,255,180,0.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"48px",animation:"float 4s ease-in-out infinite, pulse-glow 3s ease-in-out infinite",overflow:"hidden",position:"relative"}}>
              🤯
              <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,180,0.03) 3px,rgba(0,255,180,0.03) 4px)"}}/>
            </div>
            <div style={{position:"absolute",bottom:"-7px",right:"-7px",background:"#ff4466",color:"white",fontSize:"9px",padding:"2px 7px",borderRadius:"20px",fontWeight:"700",animation:"statusBlink 1.5s infinite"}}>RAM 2%</div>
            <div style={{position:"absolute",top:"-7px",left:"-7px",background:"rgba(0,255,180,0.1)",color:"#00ffb4",fontSize:"9px",padding:"2px 7px",borderRadius:"20px",border:"1px solid rgba(0,255,180,0.3)"}}>ONLINE</div>
          </div>
        </div>

        <div className="term-wrap">
          <div style={{background:"rgba(0,0,0,0.5)",border:"1px solid rgba(0,255,180,0.1)",borderRadius:"12px",padding:"14px 18px"}}>
            <div style={{color:"rgba(0,255,180,0.35)",marginBottom:"8px",fontSize:"10px",letterSpacing:"0.2em"}}>TERMINAL // dojoman@dojojin.tech:~$</div>
            <TerminalLine text="whoami"                                                          delay={0}    color="#00ffb4"               prefix="$"/>
            <TerminalLine text={`> ${profile.name} — ${profile.title}`}                         delay={600}  color="rgba(255,255,255,0.4)" prefix=""/>
            <TerminalLine text="cat quote.txt"                                                   delay={1400} color="#a78bfa"               prefix="$"/>
            <TerminalLine text={`> "${profile.quote}"`}                                          delay={2200} color="rgba(255,255,255,0.4)" prefix=""/>
            <TerminalLine text="docker ps --filter status=running"                               delay={4000} color="#00b4ff"               prefix="$"/>
            <TerminalLine text="> life   RUNNING (barely)   0.0.0.0:443->443/tcp   uptime: งง" delay={4800} color="rgba(255,255,255,0.3)" prefix=""/>
          </div>
        </div>

        <div className="nav-wrap">
          <div style={{display:"flex",gap:"2px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            {NAV_TABS.map(tab => (
              <button key={tab.id} className="nav-btn" onClick={() => setActivePage(tab.id)}
                style={{padding:"10px 22px",background:"none",border:"none",cursor:"pointer",borderBottom:activePage===tab.id?"2px solid #00ffb4":"2px solid transparent",color:activePage===tab.id?"#00ffb4":"rgba(255,255,255,0.38)",fontSize:"12px",fontWeight:"600",fontFamily:"inherit",letterSpacing:"0.1em",transition:"all 0.2s",display:"flex",alignItems:"center",gap:"6px"}}>
                <span style={{fontSize:"13px"}}>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <KeyboardTicker/>

      {/* ══ HOME ══ */}
      {activePage === "home" && (
        <>
          <main className="main-grid">
            {/* LEFT */}
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"20px",padding:"28px",backdropFilter:"blur(10px)"}}>
              <div style={{marginBottom:"20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
                  <span style={{fontSize:"18px"}}>💀</span>
                  <h2 style={{margin:0,fontSize:"18px",fontWeight:"700",letterSpacing:"0.05em"}}>Daily Chaos Log</h2>
                </div>
                <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.15em"}}>// chaos-driven development schedule</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {routines.map((item,i) => {
                  const c = item.status==="RUNNING"?"#00ffb4":item.status==="TIMEOUT"?"#ffb400":"#ff4466";
                  return (
                    <div key={i} className="routine-card" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"12px",padding:"14px 16px",display:"flex",alignItems:"center",gap:"14px",transition:"all 0.2s",cursor:"default"}}>
                      <div style={{fontFamily:"monospace",fontSize:"13px",color:"rgba(0,255,180,0.7)",minWidth:"50px"}}>{item.time}</div>
                      <div style={{fontSize:"20px",flexShrink:0}}>{item.icon}</div>
                      <div style={{flex:1}}><div style={{fontSize:"13px",color:"rgba(255,255,255,0.7)"}}>{item.task}</div></div>
                      <div style={{fontSize:"10px",padding:"3px 8px",borderRadius:"6px",fontWeight:"700",letterSpacing:"0.1em",background:`${c}18`,color:c,border:`1px solid ${c}33`,animation:item.status!=="RUNNING"?"statusBlink 2s infinite":"none"}}>{item.status}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:"24px",paddingTop:"20px",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{fontSize:"10px",letterSpacing:"0.2em",color:"rgba(255,255,255,0.3)",marginBottom:"16px"}}>SYS_DIAGNOSTICS</div>
                {skills.map((s,i) => <StatBar key={i} label={s.label} value={s.value} color={s.color||"#00ffb4"}/>)}
              </div>
            </div>

            {/* CENTER */}
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"20px",padding:"28px",backdropFilter:"blur(10px)"}}>
              <div style={{marginBottom:"20px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
                      <span style={{fontSize:"18px"}}>🧠</span>
                      <h2 style={{margin:0,fontSize:"18px",fontWeight:"700",letterSpacing:"0.05em"}}>Tech Arsenal</h2>
                    </div>
                    <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.15em"}}>// AI • Infra • CV • Backend • DevOps</div>
                  </div>
                  <div style={{fontSize:"24px",fontWeight:"800",color:"rgba(0,255,180,0.25)",fontFamily:"monospace"}}>{profile.stack.length}</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:"8px"}}>
                {profile.stack.map((tech,i) => (
                  <div key={i} className="tech-card" onMouseEnter={() => setHoveredTech(tech)} onMouseLeave={() => setHoveredTech(null)}
                    style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"12px",padding:"12px 8px",textAlign:"center",cursor:"default",transition:"all 0.2s",position:"relative",overflow:"hidden"}}>
                    {hoveredTech===tech && <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(0,255,180,0.05),rgba(0,180,255,0.05))"}}/>}
                    <div style={{fontSize:"24px",marginBottom:"6px"}}>{TECH_ICONS[tech]||"⚡"}</div>
                    <div style={{fontSize:"10px",fontWeight:"500",color:"rgba(255,255,255,0.55)",lineHeight:"1.3",letterSpacing:"0.03em"}}>{tech}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT sidebar */}
            <aside style={{display:"flex",flexDirection:"column",gap:"16px"}}>
              <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"20px",padding:"22px",backdropFilter:"blur(10px)"}}>
                <div style={{marginBottom:"14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                    <span style={{fontSize:"15px"}}>🌐</span>
                    <h2 style={{margin:0,fontSize:"15px",fontWeight:"700"}}>Socials</h2>
                  </div>
                  <div style={{fontSize:"10px",color:"rgba(255,255,255,0.25)",letterSpacing:"0.15em"}}>// อย่าไปรู้เลย</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {Object.entries(profile.socials).map(([key,value]) => (
                    <a key={key} href={value.startsWith("http")?value:undefined} className="social-link"
                      style={{display:"block",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"10px 14px",textDecoration:"none",transition:"all 0.2s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <span style={{color:"rgba(0,255,180,0.5)",fontSize:"15px"}}>{socialIcons[key]}</span>
                        <div>
                          <div style={{fontSize:"10px",letterSpacing:"0.15em",color:"rgba(0,255,180,0.6)",textTransform:"uppercase"}}>{key}</div>
                          <div style={{fontSize:"11px",color:"rgba(255,255,255,0.4)",marginTop:"1px"}}>{value.replace("https://","").replace("http://","")}</div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div style={{background:"rgba(255,68,102,0.04)",border:"1px solid rgba(255,68,102,0.15)",borderRadius:"16px",padding:"18px"}}>
                <div style={{fontSize:"12px",fontWeight:"700",color:"#ff4466",marginBottom:"8px",letterSpacing:"0.1em"}}>⚠ SYS STATUS</div>
                <div style={{fontSize:"12px",color:"rgba(255,255,255,0.45)",lineHeight:"1.6"}}>
                  Infrastructure ทำงานด้วย Docker + Cloudflare + <span style={{color:"#f59e0b"}}>ความหวัง</span>
                </div>
                <div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
                  {[{label:"Docker",ok:true},{label:"Nginx",ok:false},{label:"Cloudflare",ok:true},{label:"Life.exe",ok:false}].map(s => (
                    <div key={s.label} style={{background:s.ok?"rgba(0,255,180,0.05)":"rgba(255,68,102,0.05)",border:`1px solid ${s.ok?"rgba(0,255,180,0.15)":"rgba(255,68,102,0.15)"}`,borderRadius:"8px",padding:"6px 8px",display:"flex",alignItems:"center",gap:"6px"}}>
                      <div style={{width:"6px",height:"6px",borderRadius:"50%",background:s.ok?"#00ffb4":"#ff4466",animation:!s.ok?"statusBlink 1s infinite":"none",flexShrink:0}}/>
                      <span style={{fontSize:"10px",color:s.ok?"rgba(0,255,180,0.7)":"rgba(255,68,102,0.7)"}}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <NowSection/>
              <DevConfession/>

              <div style={{background:"rgba(120,80,255,0.04)",border:"1px solid rgba(120,80,255,0.2)",borderRadius:"16px",padding:"18px",animation:"rgb-border 4s ease-in-out infinite"}}>
                <div style={{fontSize:"28px",color:"rgba(120,80,255,0.35)",fontFamily:"serif",lineHeight:1}}>"</div>
                <div style={{fontSize:"12px",color:"rgba(255,255,255,0.5)",lineHeight:"1.7",marginTop:"4px"}}>{profile.quote}</div>
                <div style={{fontSize:"10px",color:"rgba(120,80,255,0.5)",marginTop:"10px",letterSpacing:"0.1em"}}>— Mr. Dojo-mAn, ตอน 2am</div>
              </div>

              <div style={{background:"rgba(255,255,255,0.01)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:"12px",padding:"12px 16px",fontSize:"10px",color:"rgba(255,255,255,0.12)",letterSpacing:"0.1em",textAlign:"center",fontFamily:"monospace",lineHeight:"1.8"}}>
                // try: konami code (↑↑↓↓←→←→BA)<br/>
                // or: click logo x5
              </div>
            </aside>
	          </main>
	          <CaseStudiesSection/>
	
	          <div style={{transform:"scaleX(-1)"}}><KeyboardTicker reverse/></div>

          <section className="hero-section">
            <div className="hero-inner">
              <div style={{position:"absolute",top:"-60px",left:"-60px",fontSize:"160px",opacity:0.05,transform:"rotate(15deg)",pointerEvents:"none",lineHeight:1}}>🐳</div>
              <div style={{position:"absolute",bottom:"-60px",right:"-60px",fontSize:"160px",opacity:0.05,transform:"rotate(-15deg)",pointerEvents:"none",lineHeight:1}}>☁️</div>
              <div style={{fontSize:"clamp(36px,8vw,88px)",fontWeight:"800",letterSpacing:"0.08em",background:"linear-gradient(135deg,#00ffb4,#00b4ff,#a78bfa,#00ffb4)",backgroundSize:"300% 300%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 5s linear infinite",lineHeight:1,marginBottom:"8px"}}>
                DOJOJIN<span style={{color:"rgba(0,255,180,0.4)",WebkitTextFillColor:"rgba(0,255,180,0.4)"}}>  .TECH</span>
              </div>
              <div style={{fontSize:"12px",letterSpacing:"0.45em",color:"rgba(255,255,255,0.22)",marginBottom:"28px",textTransform:"uppercase"}}>
                Build • Break • Repeat • Deploy on Friday
              </div>
              <div style={{fontSize:"15px",fontFamily:"monospace",color:"rgba(255,255,255,0.52)",maxWidth:"600px",margin:"0 auto 32px",lineHeight:"1.75"}}>
                ถึงจะ chaos ขนาดนี้ แต่สุดท้ายก็เรียนทุกอย่างเองจนทำได้จริง<br/>
                <span style={{color:"rgba(0,255,180,0.5)"}}>// และวันนึง infrastructure นี้จะไม่พัง...หวังว่านะ</span>
              </div>
              <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
                <button onClick={() => window.open("https://dojojin.tech","_blank")} style={{padding:"12px 28px",borderRadius:"12px",background:"rgba(0,255,180,0.12)",border:"1px solid rgba(0,255,180,0.4)",color:"#00ffb4",fontSize:"13px",fontWeight:"700",cursor:"pointer",letterSpacing:"0.1em",fontFamily:"inherit"}}>
                  Deploy To Production 🚀
                </button>
                <button onClick={() => setActivePage("bio")} style={{padding:"12px 28px",borderRadius:"12px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.45)",fontSize:"13px",cursor:"pointer",letterSpacing:"0.05em",fontFamily:"inherit"}}>
                  cat biography.md
                </button>
                <button onClick={() => setActivePage("projects")} style={{padding:"12px 28px",borderRadius:"12px",background:"rgba(120,80,255,0.08)",border:"1px solid rgba(120,80,255,0.3)",color:"#a78bfa",fontSize:"13px",cursor:"pointer",letterSpacing:"0.05em",fontFamily:"inherit"}}>
                  ls ./projects
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {activePage === "bio"      && <BiographyPage/>}
      {activePage === "projects" && <ProjectsPage/>}
      {activePage === "terminal" && <TerminalPage/>}
      {activePage === "comments" && <CommentsPage/>}

      <footer className="site-footer">
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <img src={logoSvg} alt="" style={{width:"18px",height:"18px",borderRadius:"5px",opacity:0.5}}/>
          <span>DOJOJIN.TECH © 2025</span>
        </div>
        <span>Powered by caffeine, <code style={{color:"rgba(0,255,180,0.4)"}}>docker restart always</code>, และความดื้อของ Dev 💀</span>
        <span style={{color:"rgba(0,255,180,0.3)",animation:"statusBlink 3s infinite"}}>● LIVE</span>
      </footer>
    </div>
  );
}
