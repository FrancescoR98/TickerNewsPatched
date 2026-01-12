exports.handler = function(event, context, callback) {
  callback(null, {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify([
      "Test titolo 1 - Funziona!",
      "Checco Zalone record",
      "Altra notizia test",
      "Trump policy 2026",
      "Economia Italia",
      "Sport breaking"
    ])
  });
};
