// ===== CONFIG =====
// Embedded SVG for fallback to prevent network errors
const FALLBACK_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM1ODViNzAiIC8+PHRleHQgeD0iMTYiIHk9IjIxIiBmaWxsPSIjY2RkNmY0IiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+PzwvdGV4dD48L3N2Zz4=";

const SYMBOL_MAP = {
    'KAS': 'kaspa', 'HBAR': 'hedera-hashgraph', 'BTC': 'bitcoin', 'ETH': 'ethereum',
    'SOL': 'solana', 'XRP': 'ripple', 'ADA': 'cardano', 'DOT': 'polkadot',
    'DOGE': 'dogecoin', 'AVAX': 'avalanche-2', 'MATIC': 'matic-network',
    'LINK': 'chainlink', 'SHIB': 'shiba-inu', 'LTC': 'litecoin', 'PEPE': 'pepe',
    'BONK': 'bonk', 'ICP': 'internet-computer', 'JASMY': 'jasmycoin', 'DOVU': 'dovu-2',
    'PENGU': 'pudgy-penguins', 'KTA': 'keeta'
};

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? '/api' : 'https://api.coingecko.com/api/v3';

// ===== STATE =====
let portfolio = [];
let selectedCoinData = null;
let dashboardSort = { key: 'value', dir: 'desc' };

// ===== HELPERS =====
function getIcon(symbol, thumb) {
    if (thumb && thumb.includes('http')) return thumb;
    return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
}

function formatUSD(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

// ===== INIT =====
window.onload = () => {
    loadData();
    document.getElementById('date').valueAsDate = new Date();
};

// ===== DATA LOGIC =====
function loadData() {
    const stored = localStorage.getItem('crypto_portfolio_v2');
    if (stored) {
        portfolio = JSON.parse(stored);
        // Ensure IDs are mapped
        portfolio.forEach(p => {
            if (!p.coinGeckoId && SYMBOL_MAP[p.symbol.toUpperCase()]) {
                p.coinGeckoId = SYMBOL_MAP[p.symbol.toUpperCase()];
            }
        });
        renderUI();
        updatePrices();
    } else {
        fetch('cp.json').then(r => r.json()).then(data => {
            if(data.portfolio) {
                portfolio = data.portfolio.map(p => ({
                    symbol: p.symbol,
                    name: p.name,
                    coinGeckoId: SYMBOL_MAP[p.symbol.toUpperCase()] || null,
                    thumb: null,
                    currentPrice: 0,
                    buys: p.fills.map(f => ({
                        id: Math.random().toString(36).substr(2, 9),
                        amount: f.qty,
                        price: f.price,
                        date: f.timestamp
                    }))
                }));
                saveData();
                renderUI();
                updatePrices();
            }
        }).catch(() => console.log("No default data found"));
    }
}

function saveData() {
    localStorage.setItem('crypto_portfolio_v2', JSON.stringify(portfolio));
    renderUI();
}

// ===== PRICE FETCHING =====
async function updatePrices(force = false) {
    const ids = [...new Set(portfolio.map(p => p.coinGeckoId).filter(Boolean))];
    if(ids.length === 0) return;

    const indicator = document.getElementById('status-indicator');
    indicator.innerHTML = '<span style="color: var(--yellow)">●</span> Fetching...';

    // Also check for missing metadata (icons)
    fetchMetadata();

    try {
        const res = await fetch(`${API_URL}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`);
        if(!res.ok) throw new Error("API Error");

        const data = await res.json();

        portfolio.forEach(coin => {
            if(coin.coinGeckoId && data[coin.coinGeckoId]) {
                coin.currentPrice = data[coin.coinGeckoId].usd;
                coin.change24h = data[coin.coinGeckoId].usd_24h_change;
            }
        });

        indicator.innerHTML = '<span style="color: var(--green)">●</span> Live Prices';
        document.getElementById('last-updated').innerText = new Date().toLocaleTimeString();
        saveData();
    } catch (e) {
        console.error(e);
        indicator.innerHTML = '<span style="color: var(--red)">●</span> API Error';
    }
}

async function fetchMetadata() {
    // Find coins with missing thumbs and valid IDs
    const missing = portfolio.filter(p => !p.thumb && p.coinGeckoId);
    if(missing.length === 0) return;

    const ids = [...new Set(missing.map(p => p.coinGeckoId))];

    try {
        // Fetch in chunks if needed, but for now just fetch all
        // Note: /coins/markets is heavy, but gives image.
        const res = await fetch(`${API_URL}/coins/markets?vs_currency=usd&ids=${ids.join(',')}`);
        if(!res.ok) return;

        const data = await res.json();
        let changed = false;

        data.forEach(item => {
            portfolio.forEach(p => {
                if(p.coinGeckoId === item.id && !p.thumb) {
                    p.thumb = item.image;
                    changed = true;
                }
            });
        });

        if(changed) {
            saveData();
            // Re-render only if needed, but usually price update triggers render or next loop will
            renderUI();
        }
    } catch(e) {
        console.warn("Failed to fetch metadata", e);
    }
}

// ===== RENDERING =====
function renderUI() {
    renderDashboard();
    renderPositions();
}

function setSort(key) {
    if(dashboardSort.key === key) {
        dashboardSort.dir = dashboardSort.dir === 'desc' ? 'asc' : 'desc';
    } else {
        dashboardSort.key = key;
        dashboardSort.dir = 'desc';
    }
    renderDashboard();
}

function updateSortIcons() {
    ['symbol', 'amount', 'price', 'value', 'pl'].forEach(key => {
        const th = document.getElementById(`th-${key}`);
        if(th) {
            const iconEl = th.querySelector('i');
            if(iconEl) {
                iconEl.className = dashboardSort.key === key
                    ? `fas fa-sort-${dashboardSort.dir === 'asc' ? 'up' : 'down'}`
                    : 'fas fa-sort';
                iconEl.style.opacity = dashboardSort.key === key ? '1' : '0.3';
            }
        }
    });
}

function renderDashboard() {
    let totalVal = 0, totalInvested = 0;

    const tbody = document.getElementById('holdings-tbody');
    tbody.innerHTML = '';

    updateSortIcons();

    // Pre-calculate data
    let rows = portfolio.map(coin => {
        const amount = coin.buys.reduce((sum, b) => sum + b.amount, 0);
        if(amount <= 0) return null;

        const invested = coin.buys.reduce((sum, b) => sum + (b.amount * b.price), 0);
        const value = amount * coin.currentPrice;
        const pl = value - invested;
        const plPct = invested > 0 ? (pl/invested)*100 : 0;

        return { coin, amount, invested, value, pl, plPct, price: coin.currentPrice, symbol: coin.symbol };
    }).filter(Boolean);

    // Calculate totals
    rows.forEach(r => {
        totalVal += r.value;
        totalInvested += r.invested;
    });

    // Sort
    rows.sort((a, b) => {
        let valA = a[dashboardSort.key];
        let valB = b[dashboardSort.key];

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return dashboardSort.dir === 'asc' ? -1 : 1;
        if (valA > valB) return dashboardSort.dir === 'asc' ? 1 : -1;
        return 0;
    });

    rows.forEach(r => {
        const { coin, amount, value, pl, plPct } = r;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="display: flex; align-items: center; gap: 0.75rem;">
                <img src="${getIcon(coin.symbol, coin.thumb)}" class="coin-img" onerror="this.src='${FALLBACK_ICON}'">
                <div>
                    <div style="font-weight:600">${coin.symbol}</div>
                    <div style="font-size:0.8rem; color: var(--subtext0)">${coin.name}</div>
                </div>
            </td>
            <td>${amount.toLocaleString()}</td>
            <td>${formatUSD(coin.currentPrice)}</td>
            <td>${formatUSD(value)}</td>
            <td>
                <div class="${pl >= 0 ? 'text-green' : 'text-red'}">${formatUSD(pl)}</div>
                <div style="font-size:0.8rem" class="${pl >= 0 ? 'text-green' : 'text-red'}">${plPct.toFixed(2)}%</div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const totalPL = totalVal - totalInvested;
    const totalPct = totalInvested > 0 ? (totalPL/totalInvested)*100 : 0;

    document.getElementById('dash-total').innerText = formatUSD(totalVal);
    const plEl = document.getElementById('dash-pl');
    plEl.innerText = (totalPL>0?'+':'') + formatUSD(totalPL);
    plEl.className = `card-value ${totalPL>=0?'text-green':'text-red'}`;

    const pctEl = document.getElementById('dash-pl-percent');
    pctEl.innerText = totalPct.toFixed(2) + '%';
    pctEl.className = `card-sub ${totalPct>=0?'text-green':'text-red'}`;
}

function renderPositions() {
    const container = document.getElementById('positions-container');
    container.innerHTML = '';
    const filter = document.getElementById('filter-input').value.toLowerCase();

    portfolio.forEach(coin => {
        if(!coin.name.toLowerCase().includes(filter) && !coin.symbol.toLowerCase().includes(filter)) return;

        const totalAmount = coin.buys.reduce((a, b) => a + b.amount, 0);
        if(totalAmount <= 0 && coin.buys.length === 0) return;

        const totalValue = totalAmount * coin.currentPrice;
        const totalInvested = coin.buys.reduce((a,b) => a + (b.amount*b.price), 0);
        const avgPrice = totalAmount > 0 ? totalInvested / totalAmount : 0;
        const totalPL = totalValue - totalInvested;
        const totalPLPct = totalInvested > 0 ? (totalPL/totalInvested)*100 : 0;

        const card = document.createElement('div');
        card.className = 'coin-group';

        let rowsHtml = coin.buys.map(buy => {
            const bVal = buy.amount * coin.currentPrice;
            const bCost = buy.amount * buy.price;
            const bPl = bVal - bCost;
            const bPct = bCost > 0 ? (bPl/bCost)*100 : 0;

            return `
            <tr>
                <td>${new Date(buy.date).toLocaleDateString()}</td>
                <td><span style="background:var(--surface2); padding:2px 6px; border-radius:4px; font-size:0.75rem">BUY</span></td>
                <td>${buy.amount.toLocaleString()}</td>
                <td>${formatUSD(buy.price)}</td>
                <td>${formatUSD(bVal)}</td>
                <td>
                    <span class="${bPl >= 0 ? 'text-green' : 'text-red'}">${formatUSD(bPl)}</span>
                    <span style="font-size:0.75rem; opacity:0.7">(${bPct.toFixed(1)}%)</span>
                </td>
                <td style="text-align:right">
                    <button class="btn-icon" onclick="deleteTrans('${coin.symbol}', '${buy.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
            `;
        }).join('');

        card.innerHTML = `
            <div class="coin-header">
                <div class="coin-header-left">
                    <img src="${getIcon(coin.symbol, coin.thumb)}" class="coin-img" onerror="this.src='${FALLBACK_ICON}'">
                    <div class="coin-title">
                        <h3>${coin.name} (${coin.symbol})</h3>
                        <span>${formatUSD(coin.currentPrice)}</span>
                    </div>
                </div>
                <div class="coin-header-stats">
                    <div class="stat-box">
                        <span>Holdings</span>
                        <span>${totalAmount.toLocaleString()}</span>
                    </div>
                    <div class="stat-box">
                        <span>Value</span>
                        <span>${formatUSD(totalValue)}</span>
                    </div>
                    <div class="stat-box">
                        <span>Avg Price</span>
                        <span>${formatUSD(avgPrice)}</span>
                    </div>
                    <div class="stat-box">
                        <span>P&L</span>
                        <span class="${totalPL >= 0 ? 'text-green' : 'text-red'}">
                            ${formatUSD(totalPL)} (${totalPLPct.toFixed(2)}%)
                        </span>
                    </div>
                </div>
            </div>
            <table class="trans-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Buy Price</th>
                        <th>Current Value</th>
                        <th>P&L</th>
                        <th style="text-align:right">Action</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        `;
        container.appendChild(card);
    });
}

// ===== ACTIONS =====
function deleteTrans(symbol, id) {
    if(!confirm("Delete transaction?")) return;
    const coin = portfolio.find(p => p.symbol === symbol);
    if(coin) {
        coin.buys = coin.buys.filter(b => b.id !== id);
        if(coin.buys.length === 0) {
            portfolio = portfolio.filter(p => p.symbol !== symbol);
        }
        saveData();
    }
}

function openAddModal() {
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('coin-search').value = '';
}
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('search-results').classList.add('hidden');
}

let searchTimer;
document.getElementById('coin-search').addEventListener('input', (e) => {
    const val = e.target.value;
    clearTimeout(searchTimer);
    if(val.length < 2) return;

    searchTimer = setTimeout(async () => {
        try {
            const res = await fetch(`${API_URL}/search?query=${val}`);
            const data = await res.json();
            const div = document.getElementById('search-results');
            div.innerHTML = '';
            div.classList.remove('hidden');
            data.coins.slice(0,5).forEach(c => {
                const row = document.createElement('div');
                row.className = 'search-result';
                row.innerHTML = `<img src="${c.thumb}" width="20"> ${c.name} (${c.symbol})`;
                row.onclick = () => {
                    selectedCoinData = c;
                    document.getElementById('coin-search').value = c.name;
                    div.classList.add('hidden');
                };
                div.appendChild(row);
            });
        } catch(e) { console.error(e); }
    }, 400);
});

document.getElementById('position-form').onsubmit = (e) => {
    e.preventDefault();
    if(!selectedCoinData) return alert("Select a coin first");

    const amt = parseFloat(document.getElementById('amount').value);
    const prc = parseFloat(document.getElementById('price').value);
    const dt = document.getElementById('date').value;

    let coin = portfolio.find(p => p.coinGeckoId === selectedCoinData.id);
    const newTx = { id: Date.now().toString(), amount: amt, price: prc, date: dt };

    if(coin) {
        coin.buys.push(newTx);
    } else {
        portfolio.push({
            symbol: selectedCoinData.symbol,
            name: selectedCoinData.name,
            coinGeckoId: selectedCoinData.id,
            thumb: selectedCoinData.thumb,
            currentPrice: 0,
            buys: [newTx]
        });
    }
    saveData();
    closeModal();
    updatePrices();
};

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`${tab}-tab`).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function importPortfolio() { document.getElementById('import-input').click(); }
document.getElementById('import-input').onchange = (e) => {
    const r = new FileReader();
    r.onload = (ev) => {
        try {
            const d = JSON.parse(ev.target.result);
            let imported = [];

            // Support new format { portfolio: [...] } or legacy array
            const items = Array.isArray(d) ? d : (d.portfolio || []);

            imported = items.map(p => {
                // Determine CoinGecko ID: use provided or fallback to map
                let cgId = p.coinGeckoId || SYMBOL_MAP[p.symbol.toUpperCase()] || null;

                // Handle "buys" (internal/legacy) vs "fills" (new standard)
                // Internal: buys=[{amount, price, date}]
                // External: fills=[{qty, price, timestamp}]
                let transactions = [];
                if (p.fills && Array.isArray(p.fills)) {
                    transactions = p.fills.map(f => ({
                        id: f.id || Math.random().toString(36).substr(2, 9),
                        amount: f.qty,
                        price: f.price,
                        date: f.timestamp
                    }));
                } else if (p.buys && Array.isArray(p.buys)) {
                    transactions = p.buys.map(b => ({
                        id: b.id || Math.random().toString(36).substr(2, 9),
                        amount: b.amount,
                        price: b.price,
                        date: b.date
                    }));
                }

                return {
                    symbol: p.symbol,
                    name: p.name,
                    coinGeckoId: cgId,
                    thumb: p.thumb || null,
                    currentPrice: 0, // Reset price to force fetch
                    buys: transactions
                };
            });

            if(imported.length > 0) {
                portfolio = imported;
                saveData();
                updatePrices();
                alert("Portfolio imported successfully!");
            } else {
                alert("No valid portfolio data found.");
            }
        } catch(err) {
            console.error(err);
            alert("Error parsing import file");
        }
        // Reset input
        e.target.value = '';
    };
    r.readAsText(e.target.files[0]);
};

function exportPortfolio() {
    // "Improved" export format: Standardized JSON structure with metadata
    const exportData = {
        meta: {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            app: "CryptoFolio Pro"
        },
        portfolio: portfolio.map(p => ({
            symbol: p.symbol,
            name: p.name,
            coinGeckoId: p.coinGeckoId,
            // Standardize on 'fills' with qty/timestamp for interoperability/readability
            fills: p.buys.map(b => ({
                timestamp: b.date,
                qty: b.amount,
                price: b.price
            }))
        }))
    };

    const s = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const a = document.createElement('a');
    a.href = s; a.download = `portfolio_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}