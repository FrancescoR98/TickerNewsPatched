// Netlify Function endpoint (stesso dominio → niente CORS)
const API_URL = "/.netlify/functions/adnkronos";

const MAX_ITEMS = 6;
const REFRESH_MS = 10 * 60 * 1000;
const SEP = " • ";

/* ---------- Adaptive sizing: misura altezza ticker e adatta font ---------- */
(function adaptiveSizing() {
  const ticker = () => document.querySelector(".ticker-bar");
  const marquee = () => document.querySelector(".marquee-track");
  const clock = () => document.querySelector(".clock");
  const brand = () => document.querySelector(".brand");

  function resizeOnce() {
    const t = ticker();
    if (!t) return;

    const h = t.getBoundingClientRect().height;
    const available = Math.max(8, h * 0.72);

    const titleSize = Math.max(10, Math.min(Math.floor(available), 48));
    const clockSize = Math.max(10, Math.min(Math.floor(available * 0.9), 48));
    const brandSize = Math.max(10, Math.min(Math.floor(available * 0.5), 28));

    const m = marquee();
    const c = clock();
    const b = brand();

    if (m) {
      m.style.fontSize = titleSize + "px";
      m.style.lineHeight = String(
        Math.max(0.85, Math.min(1.05, available / titleSize))
      );
    }
    if (c) c.style.fontSize = clockSize + "px";
    if (b) b.style.fontSize = brandSize + "px";
  }

  function attach() {
    resizeOnce();
    window.addEventListener("resize", resizeOnce, { passive: true });

    try {
      const ro = new ResizeObserver(resizeOnce);
      const t = ticker();
      if (t) ro.observe(t);
    } catch (e) {
      // ignore
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attach);
  } else {
    attach();
  }
})();

/* ---------- Clock ---------- */
function updateClock() {
  const el = document.getElementById("clock");
  if (!el) return;

  const n = new Date();
  el.textContent = `${String(n.getHours()).padStart(2, "0")}:${String(
    n.getMinutes()
  ).padStart(2, "0")}`;
}
setInterval(updateClock, 5000);
updateClock();

/* ---------- Marquee helpers ---------- */
function buildMarqueeText(titles) {
  const t = titles.join(SEP);
  return `${t}${SEP}${t}${SEP}`;
}

/* ---------- Fetch titles (array) ---------- */
async function fetchTitles(force = false) {
  // force = true aggiunge ?refresh=1 per bypass cache lato function (se la implementi)
  const url = `${API_URL}?ts=${Date.now()}${force ? "&refresh=1" : ""}`;

  const r = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`API ${r.status} body-start=${text.slice(0, 120)}`);
  }

  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await r.text();
    throw new Error(`Bad content-type=${ct} body-start=${text.slice(0, 120)}`);
  }

  const data = await r.json();

  if (!Array.isArray(data)) {
    throw new Error("API returned non-array JSON");
  }

  return data
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, MAX_ITEMS);
}

/* ---------- Render loop ---------- */
async function render(force = false) {
  const bar = document.getElementById("ticker");
  const track = document.getElementById("marquee");
  if (!bar || !track) return;

  try {
    const titles = await fetchTitles(force);
    if (!titles.length) throw new Error("No titles");

    bar.classList.remove("error");
    track.textContent = buildMarqueeText(titles);

    const seconds = Math.max(
      25,
      Math.min(90, Math.floor(track.textContent.length / 3))
    );
    track.style.animationDuration = `${seconds}s`;
  } catch (e) {
    console.error("Errore feed:", e);
    bar.classList.add("error");
    track.textContent = "Impossibile leggere il feed.";
  }
}

// start
render(true);
setInterval(() => render(true), REFRESH_MS);
