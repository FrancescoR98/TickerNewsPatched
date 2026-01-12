// Legge direttamente l'XML (senza /api e senza functions)
const FEED_URL =
  "https://www.adnkronos.com/NewsFeed/UltimoraNoVideoJson.xml?username=mediaone&password=m3gt67i9gm";

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
function buildMarqueeText(ts) {
  const t = ts.join(SEP);
  return `${t}${SEP}${t}${SEP}`;
}

/* ---------- Fetch + parse XML ---------- */
/**
 * Ritorna un oggetto nel formato:
 * { json: { news: [ {title: "..."} , ... ] } }
 * così il tuo extractTitles rimane identico.
 */
async function fetchLocal(force = false) {
  // force non serve più (non c'è cache server-side), lo teniamo per compatibilità
  const url = `${FEED_URL}${FEED_URL.includes("?") ? "&" : "?"}ts=${Date.now()}`;

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(
      `Bad response (${r.status}) body-start=${text.slice(0, 60)}`
    );
  }

  const xmlText = await r.text();

  // Estrae tutti i <title>...</title> (uso dotAll con [\\s\\S] per compatibilità)
  const matches = xmlText.match(/<title>([\s\S]*?)<\/title>/gi) || [];

  // Pulisce e filtra (toglie "ultimoranovideo" e stringhe vuote)
  const titles = matches
    .map((m) => m.replace(/<\/?title>/gi, "").trim())
    .filter((t) => t && !t.toLowerCase().includes("ultimoranovideo"))
    .slice(0, MAX_ITEMS);

  return {
    json: {
      news: titles.map((title) => ({ title })),
    },
  };
}

function extractTitles(p) {
  try {
    const n = p?.json?.news ?? [];
    return n.slice(0, MAX_ITEMS).map((x) => x?.title ?? "").filter(Boolean);
  } catch {
    return [];
  }
}

/* ---------- Render loop ---------- */
async function render(force = false) {
  const bar = document.getElementById("ticker");
  const track = document.getElementById("marquee");
  if (!bar || !track) return;

  try {
    const data = await fetchLocal(force);
    const titles = extractTitles(data);

    if (!titles.length) throw new Error("no titles");

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
