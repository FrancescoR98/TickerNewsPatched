const fetch = require('node-fetch');

exports.handler = function(event, context, callback) {
  const FEED_URL = 'https://www.adnkronos.com/NewsFeed/UltimoraNoVideoJson.xml?username=mediaone&password=m3gt67i9gm';
  
  fetch(FEED_URL)
    .then(res => {
      if (!res.ok) throw new Error('Adnkronos ' + res.status);
      return res.text();
    })
    .then(xml => {
      const titles = [];
      let match;
      const regex = /<title>([^<]{10,})<\/title>/g;
      while ((match = regex.exec(xml)) !== null && titles.length < 6) {
        const title = match[1].trim();
        if (title && !title.includes('ultimoranovideo')) {
          titles.push(title);
        }
      }
      
      callback(null, {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(titles)
      });
    })
    .catch(error => {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      });
    });
};
