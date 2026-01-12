const DATA_URL = 'https://www.adnkronos.com/NewsFeed/UltimoraNoVideoJson.xml?username=mediaone&password=m3gt67i9gm';
const MAX_ITEMS = 6;
const REFRESH_MS = 10 * 60 * 1000;
const SEP = ' | ';

// TUA adaptiveSizing (copia dal tuo originale)
function adaptiveSizing() {
  const ticker = document.querySelector('.ticker-bar');
  const marquee = document.querySelector('.marquee-track');
  const clock = document.querySelector('.clock');
  const brand = document.querySelector('.brand');
  
  function
