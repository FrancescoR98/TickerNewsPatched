exports.handler = function(event, context, callback) {
  var https = require('https');
  
  var options = {
    hostname: 'www.adnkronos.com',
    port: 443,
    path: '/NewsFeed/UltimoraNoVideoJson.xml?username=mediaone&password=m3gt67i9gm',
    method: 'GET'
  };
  
  var req = https.request(options, function(res) {
    var data = '';
    
    res.on('data', function(chunk) {
      data += chunk;
    });
    
    res.on('end', function() {
      try {
        // Estrae titoli
        var titles = [];
        var regex = /<title>([^<]{10,100}?)<\/title>/g;
        var match;
        while ((match = regex.exec(data)) !== null && titles.length < 6) {
          var title = match[1].trim();
          if (title && title.toLowerCase().indexOf('ultimoranovideo') === -1) {
            titles.push(title
