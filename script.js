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
    updateClocks();
    initWeather();
    initTickers();
    initRSS();
    checkPings();
});

// ---------- FAVICONS ----------
function addFavicons() {
    const links = document.querySelectorAll('.bookmark-categories a, .internal-links a');
    links.forEach(link => {
        try {
            let faviconUrl = link.dataset.iconUrl;
            if (!faviconUrl) {
                const url = new URL(link.href);
                const domain = link.dataset.favicon || url.hostname;
                // Grab high quality favicons via Google
                faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
            }

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
function getWeatherIcon(code, isDay) {
    if (code === 0) return isDay ? '☀️' : '🌙';
    if (code === 1 || code === 2) return isDay ? '⛅' : '☁️';
    if (code === 3) return '☁️';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '🌡️';
}

async function initWeather() {
    try {
        // London (uses open-meteo, no API key required)
        const resLon = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5085&longitude=-0.1257&current_weather=true');
        if (!resLon.ok) throw new Error('API error');
        const dataLon = await resLon.json();
        const iconLon = getWeatherIcon(dataLon.current_weather.weathercode, dataLon.current_weather.is_day);
        document.getElementById('lon-weather').innerText = `${iconLon} ${dataLon.current_weather.temperature}°C`;
    } catch (e) {
        document.getElementById('lon-weather').innerText = 'Err';
        console.error('London Weather Fetch Error:', e);
    }

    try {
        // Dubai
        const resDxb = await fetch('https://api.open-meteo.com/v1/forecast?latitude=25.2582&longitude=55.3047&current_weather=true');
        if (!resDxb.ok) throw new Error('API error');
        const dataDxb = await resDxb.json();
        const iconDxb = getWeatherIcon(dataDxb.current_weather.weathercode, dataDxb.current_weather.is_day);
        document.getElementById('dxb-weather').innerText = `${iconDxb} ${dataDxb.current_weather.temperature}°C`;
    } catch (e) {
        document.getElementById('dxb-weather').innerText = 'Err';
        console.error('Dubai Weather Fetch Error:', e);
    }
}

// ---------- TICKERS & CHARTS ----------
function formatChange(change, changePercent) {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${sign}${changePercent.toFixed(2)}%)`;
}

function createChart(canvasId, dataPoints, isPositive, currencySymbol) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 120);
    if (isPositive) {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    } else {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
    }
    const color = isPositive ? '#10b981' : '#ef4444';

    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const padding = (max - min) * 0.1;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataPoints.map((_, i) => i),
            datasets: [{
                data: dataPoints,
                borderColor: color,
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return currencySymbol + context.parsed.y.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                        },
                        title: () => null
                    }
                }
            },
            scales: {
                x: { display: false },
                y: { display: false, min: min - padding, max: max + padding }
            },
            interaction: { mode: 'index', intersect: false }
        }
    });
}

async function initTickers() {
    // 1. BTC via Binance API (24h chart)
    try {
        const resBtc = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=24');
        if (!resBtc.ok) throw new Error('API error');
        const klines = await resBtc.json();
        
        const prices = klines.map(k => parseFloat(k[4])); // Close prices
        const currentPrice = prices[prices.length - 1];
        const openPrice24h = parseFloat(klines[0][1]); // Open price 24h ago
        
        const change = currentPrice - openPrice24h;
        const changePercent = (change / openPrice24h) * 100;
        const isPositive = change >= 0;

        document.getElementById('btc-price').innerText = '$' + currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const changeEl = document.getElementById('btc-change');
        changeEl.innerText = formatChange(change, changePercent);
        changeEl.className = 'change ' + (isPositive ? 'positive' : 'negative');
        
        createChart('btc-chart', prices, isPositive, '$');
    } catch (err) {
        document.getElementById('btc-price').innerText = 'Err';
        console.error('BTC Fetch Error:', err);
    }

    // 2. FTSE 100 via Yahoo
    try {
        const targetUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/^FTSE?interval=15m&range=1d';
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        const resFtse = await fetch(proxyUrl);
        if (!resFtse.ok) throw new Error('API error');
        const dataFtse = await resFtse.json();
        
        const result = dataFtse.chart.result[0];
        const currentPrice = result.meta.regularMarketPrice;
        const previousClose = result.meta.chartPreviousClose || result.meta.previousClose || currentPrice;
        
        let prices = [];
        if (result.indicators.quote && result.indicators.quote[0].close) {
            prices = result.indicators.quote[0].close.filter(p => p !== null);
        }
        if (prices.length === 0) prices = [currentPrice, currentPrice]; // Fallback if no chart data
        
        const change = currentPrice - previousClose;
        const changePercent = previousClose ? (change / previousClose) * 100 : 0;
        const isPositive = change >= 0;

        document.getElementById('ftse-price').innerText = '£' + currentPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const changeEl = document.getElementById('ftse-change');
        changeEl.innerText = formatChange(change, changePercent);
        changeEl.className = 'change ' + (isPositive ? 'positive' : 'negative');

        createChart('ftse-chart', prices, isPositive, '£');
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

// ---------- PINGS ----------
async function checkPings() {
    const links = document.querySelectorAll('a[data-ping]');
    links.forEach(async (link) => {
        const pingUrl = link.dataset.ping;
        const statusSpan = link.querySelector('.ping-status');
        if (!statusSpan) return;

        try {
            await fetch(pingUrl, { mode: 'no-cors', cache: 'no-store' });
            statusSpan.classList.add('online');
            statusSpan.classList.remove('offline');
        } catch (error) {
            statusSpan.classList.add('offline');
            statusSpan.classList.remove('online');
            console.error('Ping failed for', pingUrl, error);
        }
    });
}
