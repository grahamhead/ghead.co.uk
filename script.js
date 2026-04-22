document.addEventListener('DOMContentLoaded', () => {
    // 1. Auto-focus search bar
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.focus();

    // 2. Register PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.error('Service Worker Registration Failed:', err));
    }

    // 3. Initialize Widgets
    addFavicons(); // Load favicons for the bookmarks
    initClocks();
    initWeather();
    initTickers();
    initRSS();
});

// ---------- FAVICONS ----------
function addFavicons() {
    const links = document.querySelectorAll('.bookmark-categories a');
    links.forEach(link => {
        try {
            const url = new URL(link.href);
            // Grab high quality favicons via Google
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;

            const img = document.createElement('img');
            img.src = faviconUrl;
            img.alt = '';
            img.style.width = '18px';
            img.style.height = '18px';
            img.style.marginRight = '8px';
            img.style.verticalAlign = 'text-bottom';
            img.style.borderRadius = '3px';

            link.prepend(img);
        } catch (e) {
            console.error('Invalid URL for favicon', e);
        }
    });
}

// ---------- CLOCKS ----------
function updateClocks() {
    const now = new Date();

    // London
    const optionsLonTime = { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false };
    const optionsLonDate = { timeZone: 'Europe/London', weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('lon-time').innerText = now.toLocaleTimeString('en-GB', optionsLonTime);
    document.getElementById('lon-date').innerText = now.toLocaleDateString('en-GB', optionsLonDate);

    // Dubai
    const optionsDxbTime = { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', hour12: false };
    const optionsDxbDate = { timeZone: 'Asia/Dubai', weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('dxb-time').innerText = now.toLocaleTimeString('en-GB', optionsDxbTime);
    document.getElementById('dxb-date').innerText = now.toLocaleDateString('en-GB', optionsDxbDate);
}
setInterval(updateClocks, 1000);

// ---------- WEATHER ----------
async function initWeather() {
    try {
        // London (uses open-meteo, no API key required)
        const resLon = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5085&longitude=-0.1257&current_weather=true');
        if (!resLon.ok) throw new Error('API error');
        const dataLon = await resLon.json();
        document.getElementById('lon-weather').innerText = `${dataLon.current_weather.temperature}°C`;
    } catch (e) {
        document.getElementById('lon-weather').innerText = 'Err';
        console.error('London Weather Fetch Error:', e);
    }

    try {
        // Dubai
        const resDxb = await fetch('https://api.open-meteo.com/v1/forecast?latitude=25.2582&longitude=55.3047&current_weather=true');
        if (!resDxb.ok) throw new Error('API error');
        const dataDxb = await resDxb.json();
        document.getElementById('dxb-weather').innerText = `${dataDxb.current_weather.temperature}°C`;
    } catch (e) {
        document.getElementById('dxb-weather').innerText = 'Err';
        console.error('Dubai Weather Fetch Error:', e);
    }
}

// ---------- TICKERS ----------
async function initTickers() {
    // 1. BTC via Binance API (No CORS block)
    try {
        const resBtc = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        if (!resBtc.ok) throw new Error('API error');
        const dataBtc = await resBtc.json();
        const price = parseFloat(dataBtc.price);
        document.getElementById('btc-price').innerText = '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (err) {
        document.getElementById('btc-price').innerText = 'Err';
        console.error('BTC Fetch Error:', err);
    }

    // 2. FTSE 100 via Yahoo (via free allorigins proxy which is more stable than corsproxy)
    try {
        const targetUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/^FTSE?interval=1d&range=1d';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const resFtse = await fetch(proxyUrl);
        if (!resFtse.ok) throw new Error('API error');
        const proxyData = await resFtse.json();
        const dataFtse = JSON.parse(proxyData.contents);
        const price = dataFtse.chart.result[0].meta.regularMarketPrice;
        document.getElementById('ftse-price').innerText = '£' + parseFloat(price).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (err) {
        document.getElementById('ftse-price').innerText = 'Err';
        console.error('FTSE Fetch Error:', err);
    }
}

// ---------- RSS FEEDS ----------
async function fetchRSS(url, containerId) {
    try {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data.status === 'ok') {
            const items = data.items.slice(0, 5); // top 5
            let html = '';
            items.forEach(item => {
                html += `<li><a href="${item.link}" target="_blank">${item.title}</a></li>`;
            });
            document.getElementById(containerId).innerHTML = html;
        } else {
            throw new Error('RSS status not ok');
        }
    } catch (err) {
        document.getElementById(containerId).innerHTML = '<li>Unable to load feed.</li>';
        console.error('RSS Fetch error for', url, err);
    }
}

function initRSS() {
    fetchRSS('https://news.ycombinator.com/rss', 'hn-feed');
    fetchRSS('https://techcrunch.com/feed/', 'tc-feed');
    fetchRSS('http://feeds.bbci.co.uk/news/rss.xml', 'bbc-feed');
}
