exports.handler = function(event, context, callback) {
  var http = require('http');
  
  var options = {
    host: 'www.adnkronos.com',
    path: '/NewsFeed/UltimoraNoVideoJson.xml?username=mediaone&password=m3gt67i9gm'
  };
  
  http.request(options, function(response) {
    var str = '';
    
    response.on('data', function (chunk) {
      str += chunk;
    });
    
    response.on('end', function () {
      var titles = [];
      var re = /<title>([^<]{10,})<\/title>/g;
      var match;
      
      while (match)
