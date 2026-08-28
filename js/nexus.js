document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://restcountries.com/v3.1/all?fields=name,population,flags';

    const grid = document.getElementById('dataGrid');
    const scoreDisplay = document.getElementById('score');
    const actionBtn = document.getElementById('actionBtn');

    let isPlaying = false;
    let score = 0;
    let countries = [];
    let currentCountry = null;
    let nextCountry = null;

    // The Offline Backup Matrix ensures 100% uptime
    const fallbackData = [
        { name: "China", population: 1402112000, flag: "https://flagcdn.com/cn.svg" },
        { name: "India", population: 1428627663, flag: "https://flagcdn.com/in.svg" },
        { name: "United States", population: 339996563, flag: "https://flagcdn.com/us.svg" },
        { name: "Indonesia", population: 277534122, flag: "https://flagcdn.com/id.svg" },
        { name: "Pakistan", population: 240485658, flag: "https://flagcdn.com/pk.svg" },
        { name: "Nigeria", population: 223804632, flag: "https://flagcdn.com/ng.svg" },
        { name: "Brazil", population: 216422446, flag: "https://flagcdn.com/br.svg" },
        { name: "Bangladesh", population: 172954319, flag: "https://flagcdn.com/bd.svg" },
        { name: "Russia", population: 144444359, flag: "https://flagcdn.com/ru.svg" },
        { name: "Mexico", population: 128455567, flag: "https://flagcdn.com/mx.svg" },
        { name: "Japan", population: 123294513, flag: "https://flagcdn.com/jp.svg" },
        { name: "Ethiopia", population: 126527060, flag: "https://flagcdn.com/et.svg" },
        { name: "Philippines", population: 117337368, flag: "https://flagcdn.com/ph.svg" },
        { name: "Egypt", population: 112716598, flag: "https://flagcdn.com/eg.svg" },
        { name: "Vietnam", population: 98858950, flag: "https://flagcdn.com/vn.svg" },
        { name: "Turkey", population: 85816199, flag: "https://flagcdn.com/tr.svg" },
        { name: "Iran", population: 89172767, flag: "https://flagcdn.com/ir.svg" },
        { name: "Germany", population: 83294633, flag: "https://flagcdn.com/de.svg" },
        { name: "Thailand", population: 71801279, flag: "https://flagcdn.com/th.svg" },
        { name: "United Kingdom", population: 67736802, flag: "https://flagcdn.com/gb.svg" },
        { name: "France", population: 68000000, flag: "https://flagcdn.com/fr.svg" },
        { name: "Italy", population: 58870762, flag: "https://flagcdn.com/it.svg" },
        { name: "South Africa", population: 60414495, flag: "https://flagcdn.com/za.svg" },
        { name: "South Korea", population: 51439038, flag: "https://flagcdn.com/kr.svg" },
        { name: "Spain", population: 47519628, flag: "https://flagcdn.com/es.svg" },
        { name: "Argentina", population: 46234830, flag: "https://flagcdn.com/ar.svg" },
        { name: "Canada", population: 38929902, flag: "https://flagcdn.com/ca.svg" },
        { name: "Australia", population: 26011400, flag: "https://flagcdn.com/au.svg" }
    ];

    async function fetchGlobalData() {
        grid.innerHTML = '<div style="color: #10b981; text-align: center; width: 100%;">Downloading global demographic datasets...</div>';
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('API Breach');
            const data = await response.json();

            countries = data.filter(c => c.population > 1000).map(c => ({
                name: c.name.common,
                population: c.population,
                flag: c.flags.svg
            }));
            return true;
        } catch (error) {
            console.warn("API Offline. Engaging Local Fallback Matrix.");
            // Instantly deploy the local backup array if the API fails
            countries = fallbackData;
            return true;
        }
    }

    function getRandomCountry() {
        return countries[Math.floor(Math.random() * countries.length)];
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    async function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = score;
        actionBtn.disabled = true;
        actionBtn.textContent = "NEXUS ACTIVE";

        if (countries.length === 0) {
            const success = await fetchGlobalData();
            if (!success) {
                actionBtn.disabled = false;
                actionBtn.textContent = "REBOOT CONNECTION";
                isPlaying = false;
                return;
            }
        }

        currentCountry = getRandomCountry();
        nextCountry = getRandomCountry();
        while (nextCountry.name === currentCountry.name) {
            nextCountry = getRandomCountry();
        }

        renderBoard();
    }

    function renderBoard() {
        grid.innerHTML = `
            <div class="country-card">
                <img src="${currentCountry.flag}" alt="Flag of ${currentCountry.name}">
                <div class="country-name">${currentCountry.name}</div>
                <div class="population-label">POPULATION</div>
                <div class="population-value">${formatNumber(currentCountry.population)}</div>
            </div>
            
            <div class="vs-badge">VS</div>
            
            <div class="country-card">
                <img src="${nextCountry.flag}" alt="Flag of ${nextCountry.name}">
                <div class="country-name">${nextCountry.name}</div>
                <div class="population-label">HAS A</div>
                <div class="action-buttons" id="guessButtons">
                    <button class="guess-btn high" data-guess="higher">Higher ▲</button>
                    <button class="guess-btn low" data-guess="lower">Lower ▼</button>
                </div>
                <div class="population-value hidden" id="nextPop">${formatNumber(nextCountry.population)}</div>
            </div>
        `;

        document.querySelectorAll('.guess-btn').forEach(btn => {
            btn.addEventListener('click', handleGuess);
        });
    }

    function handleGuess(e) {
        const guess = e.target.dataset.guess;
        const nextPopElement = document.getElementById('nextPop');
        const buttons = document.getElementById('guessButtons');

        buttons.style.display = 'none';
        nextPopElement.classList.remove('hidden');

        const isHigher = nextCountry.population >= currentCountry.population;
        const isCorrect = (guess === 'higher' && isHigher) || (guess === 'lower' && !isHigher);

        if (isCorrect) {
            nextPopElement.style.color = '#10b981';
            score++;
            scoreDisplay.textContent = score;

            setTimeout(() => {
                currentCountry = nextCountry;
                nextCountry = getRandomCountry();
                while (nextCountry.name === currentCountry.name) {
                    nextCountry = getRandomCountry();
                }
                renderBoard();
            }, 1500);
        } else {
            nextPopElement.style.color = '#ff3366';
            setTimeout(triggerGameOver, 1500);
        }
    }

    function triggerGameOver() {
        isPlaying = false;
        actionBtn.disabled = false;
        actionBtn.textContent = "INITIALIZE NEW SEQUENCE";

        const modal = document.getElementById('gameOverModal');
        document.getElementById('finalScoreDisplay').textContent = score;
        modal.classList.add('active');
    }

    document.getElementById('modalDismissBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
    });

    actionBtn.addEventListener('click', startGame);
});