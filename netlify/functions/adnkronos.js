exports.handler = async function (event) {
  try {
    const params = event.queryStringParameters || {};
    const force = typeof params.refresh !== "undefined";

    const FEED_URL =
      "https://www.adnkronos.com/NewsFeed/UltimoraNoVideoJson.xml?username=mediaone&password=m3gt67i9gm";

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

    // 1) Estrai contenuto del tag <json>...</json>
    const m = xmlText.match(/<json\b[^>]*>([\s\S]*?)<\/json>/i);
    if (!m) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify([]),
      };
    }

    let jsonStr = m[1].trim();

    // 2) Rimuovi eventuale CDATA
    jsonStr = jsonStr.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();

    // 3) Parse e prendi news[].title
    const obj = JSON.parse(jsonStr);

    // Alcuni feed hanno {json:{news:[...]}} altri {news:[...]} → gestiamo entrambi
    const news =
      obj?.json?.news ||
      obj?.news ||
      obj?.json?.items ||
      obj?.items ||
      [];

    const titles = (Array.isArray(news) ? news : [])
      .map((x) => (x && typeof x.title === "string" ? x.title.trim() : ""))
      .filter(Boolean)
      .slice(0, 6);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": force
          ? "no-store"
          : "public, s-maxage=10800, max-age=0",
      },
      body: JSON.stringify(titles),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: String(e) }),
    };
  }
};
