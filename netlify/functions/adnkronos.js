// netlify/functions/adnkronos.js

exports.handler = async function (event) {
  try {
    const params = event.queryStringParameters || {};
    const force = typeof params.refresh !== "undefined";

    const FEED_URL =
      "https://www.adnkronos.com/NewsFeed/UltimoraNoVideoJson.xml?username=mediaone&password=m3gt67i9gm";

    // Fetch server-side (niente CORS)
    const upstream = await fetch(FEED_URL, {
      headers: {
        "User-Agent": "netlify-function-adnkronos",
        "Accept": "application/xml,text/xml,*/*",
      },
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          error: `Upstream error ${upstream.status}`,
          bodyStart: text.slice(0, 200),
        }),
      };
    }

    const xmlText = await upstream.text();

    // Estrai titoli: prende <title>...</title>, filtra "ultimoranovideo"
    const rawTitles = xmlText.match(/<title>([\s\S]*?)<\/title>/gi) || [];
    const titles = rawTitles
      .map((t) => t.replace(/<\/?title>/gi, "").trim())
      .filter((t) => t && !t.toLowerCase().includes("ultimoranovideo"))
      .slice(0, 6);

    // Se non troviamo titoli, meglio rispondere 200 con array vuoto (debug dal client)
    // Volendo puoi fare throw new Error(...) ma così il ticker andrebbe sempre in errore.
    const body = JSON.stringify(titles);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",

        // Cache condivisa Netlify CDN: 3 ore (10800s)
        // Browser: 0 (così ogni impianto chiede al CDN, non ad Adnkronos)
        "Cache-Control": force
          ? "no-store"
          : "public, s-maxage=10800, max-age=0",
      },
      body,
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: String(e) }),
    };
  }
};
