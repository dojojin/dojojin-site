// Formal-page easter eggs, rendered on demand. Detection (Konami, idle, logo x5) lives in a tiny script in
// Base.astro, so React and the /lab app code download only when an egg actually fires.
import { createRoot } from "react-dom/client";
import { KonamiPopup, Screensaver } from "./App.jsx";

let root;
export function render(kind, onClose) {
  if (!root) { const el = document.createElement("div"); document.body.append(el); root = createRoot(el); }
  root.render(kind === "konami" ? <KonamiPopup onClose={() => { root.render(null); onClose(); }} /> : kind === "idle" ? <Screensaver /> : null);
}
