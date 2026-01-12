exports.handler = async function (event) {
  try {
    const FEED_URL =
      "https://www.adnkronos.com/NewsFeed/UltimoraNoVideoJson.xml?username=mediaone&password=m3gt67i9gm";

    const upstream = await fetch(FEED_URL, {
      headers: {
        "User-Agent": "netlify-function-adnkronos",
        "Accept": "application/xml,text/xml,*/*",
      },
    });

    const text = await upstream.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        status: upstream.status,
        contentType: upstream.headers.get("content-type"),
        start: text.slice(0, 1200),   // preview XML
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: String(e) }),
    };
  }
};
