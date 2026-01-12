exports.handler = function(event, context, callback) {
  var http = require('http');
  
  var options = {
    host: 'www.adnkronos.com',
    path: '/NewsFeed/UltimoraNoVideoJson.xml?username=mediaone&password=m3gt67i9
