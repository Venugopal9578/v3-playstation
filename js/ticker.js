document.addEventListener('DOMContentLoaded', () => {
    // Binance Public API: Lightning fast, live data, zero keys, zero CORS restrictions.
    const API_URL = 'https://api.binance.com/api/v3/ticker/price';
    const TARGET_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'DOGEUSDT', 'LINKUSDT'];

    const grid = document.getElementById('dataGrid');
    const scoreDisplay = document.getElementById('score');
    const actionBtn = document.getElementById('actionBtn');

    let isPlaying = false;
    let score = 0;
    let currentAsset = null;
    let timerInterval;

    const symbolNames = {
        'BTCUSDT': 'Bitcoin (BTC)',
        'ETHUSDT': 'Ethereum (ETH)',
        'SOLUSDT': 'Solana (SOL)',
        'BNBUSDT': 'Binance Coin (BNB)',
        'ADAUSDT': 'Cardano (ADA)',
        'XRPUSDT': 'Ripple (XRP)',
        'DOGEUSDT': 'Dogecoin (DOGE)',
        'LINKUSDT': 'Chainlink (LINK)'
    };

    async function fetchMarketData() {
        grid.innerHTML = '<div style="color: #eab308; text-align: center; width: 100%;">Tapping into Binance exchange streams...</div>';
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Exchange offline');
            const data = await response.json();

            return data.filter(item => TARGET_SYMBOLS.includes(item.symbol));
        } catch (error) {
            console.error("Connection Fault:", error);
            grid.innerHTML = '<div style="color: #ff3366; text-align: center; width: 100%;">Feed Terminated. Please reboot connection.</div>';
            return null;
        }
    }

    // Formats raw strings into readable currency
    function formatPrice(val) {
        const num = parseFloat(val);
        if (num < 1) {
            // Keep up to 4 decimals for micro-assets like DOGE/XRP
            return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        }
        return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Algorithmic decoy generator to create highly convincing fake prices
    function generateDecoys(truePrice) {
        const num = parseFloat(truePrice);
        const decoys = new Set();
        decoys.add(formatPrice(truePrice));

        while (decoys.size < 4) {
            // Shift the price by a random micro-percentage (-0.3% to +0.3%)
            const shift = num * (Math.random() * 0.006 - 0.003);
            let fakeNum = num + shift;

            // Format fake number identically
            let fakeStr = fakeNum < 1 ?
                '$' + fakeNum.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) :
                '$' + fakeNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            decoys.add(fakeStr);
        }

        return Array.from(decoys).sort(() => Math.random() - 0.5);
    }

    async function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = score;
        actionBtn.disabled = true;
        actionBtn.textContent = "TERMINAL ACTIVE";

        initiateRound();
    }

    async function initiateRound() {
        const market = await fetchMarketData();
        if (!market || market.length === 0) {
            triggerGameOver();
            return;
        }

        // Pick a random asset from the filtered list
        currentAsset = market[Math.floor(Math.random() * market.length)];
        renderObservationPhase();
    }

    function renderObservationPhase() {
        const displayName = symbolNames[currentAsset.symbol];
        const displayPrice = formatPrice(currentAsset.price);

        grid.innerHTML = `
            <div class="ticker-card">
                <div class="ticker-header blink">LIVE FEED ACQUIRED</div>
                <div class="ticker-asset">${displayName}</div>
                <div class="ticker-price">${displayPrice}</div>
                <div class="timer-bar-container">
                    <div class="timer-bar" id="timerBar"></div>
                </div>
            </div>
        `;

        // 4 Second Observation Timer
        const timerBar = document.getElementById('timerBar');
        let timeLeft = 100;

        timerInterval = setInterval(() => {
            timeLeft -= (100 / 40); // 40 ticks of 100ms = 4 seconds
            timerBar.style.width = `${Math.max(0, Math.floor(timeLeft))}%`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                renderInterrogationPhase();
            }
        }, 100);
    }

    function renderInterrogationPhase() {
        const displayName = symbolNames[currentAsset.symbol];
        const correctFormatted = formatPrice(currentAsset.price);
        const options = generateDecoys(currentAsset.price);

        let htmlString = `
            <div class="ticker-interrogation">
                <div class="ticker-header">FEED PURGED</div>
                <div class="ticker-question">What was the exact trading price of <span style="color:#eab308">${displayName}</span>?</div>
                <div class="ticker-options">
        `;

        options.forEach(opt => {
            const isCorrect = opt === correctFormatted;
            htmlString += `<button class="ticker-btn" data-correct="${isCorrect}">${opt}</button>`;
        });

        htmlString += `</div></div>`;
        grid.innerHTML = htmlString;

        document.querySelectorAll('.ticker-btn').forEach(btn => {
            btn.addEventListener('click', handleAnswer);
        });
    }

    function handleAnswer(e) {
        document.querySelectorAll('.ticker-btn').forEach(btn => btn.disabled = true);

        const isCorrect = e.target.dataset.correct === "true";

        if (isCorrect) {
            e.target.classList.add('correct');
            score++;
            scoreDisplay.textContent = score;
            setTimeout(initiateRound, 1500);
        } else {
            e.target.classList.add('incorrect');
            document.querySelector('.ticker-btn[data-correct="true"]').classList.add('correct-reveal');
            setTimeout(triggerGameOver, 2500);
        }
    }

    function triggerGameOver() {
        isPlaying = false;
        clearInterval(timerInterval);
        actionBtn.disabled = false;
        actionBtn.textContent = "INITIALIZE NEW FEED";

        const modal = document.getElementById('gameOverModal');
        document.getElementById('finalScoreDisplay').textContent = score;
        modal.classList.add('active');
    }

    document.getElementById('modalDismissBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
    });

    actionBtn.addEventListener('click', startGame);
});