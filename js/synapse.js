document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '32ddf821fc53257860bd29b1df75776a';
    const IMAGE_BASE = 'https://image.tmdb.org/t/p/w200';

    const grid = document.getElementById('dataGrid');
    const matchesDisplay = document.getElementById('matchesFound');
    const movesDisplay = document.getElementById('movesCount');
    const actionBtn = document.getElementById('actionBtn');

    let isPlaying = false;
    let moves = 0;
    let matches = 0;
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;

    // Cache to prevent repeating posters in the same session
    let usedAssets = new Set();

    async function fetchPosters() {
        grid.innerHTML = '<div style="color: #10b981; grid-column: 1/-1; padding: 20px; text-align: center;">Extracting dynamic visual assets...</div>';
        try {
            let posters = [];
            let attempts = 0;

            // Loop until we find 8 unique, unused posters
            while (posters.length < 8 && attempts < 5) {
                // Fetch a random page of currently trending movies and TV shows
                const randomPage = Math.floor(Math.random() * 15) + 1;
                const response = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}&page=${randomPage}`);
                const data = await response.json();

                // Shuffle the fetched page results
                const results = data.results.sort(() => Math.random() - 0.5);

                for (let item of results) {
                    if (posters.length >= 8) break;
                    // Ensure the asset has a poster and hasn't been used this session
                    if (item.poster_path && !usedAssets.has(item.poster_path)) {
                        posters.push(`${IMAGE_BASE}${item.poster_path}`);
                        usedAssets.add(item.poster_path);
                    }
                }
                attempts++;
            }

            // Prevent cache overflow; clear it if the user plays dozens of rounds
            if (usedAssets.size > 150) {
                usedAssets.clear();
            }

            return posters;
        } catch (error) {
            console.error(error);
            grid.innerHTML = '<div style="color: #ff3366; grid-column: 1/-1; text-align: center;">Asset retrieval failed. Please check connection.</div>';
            return null;
        }
    }

    async function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        moves = 0;
        matches = 0;
        movesDisplay.textContent = moves;
        matchesDisplay.textContent = matches;
        actionBtn.disabled = true;
        actionBtn.textContent = "BUILDING MATRIX...";

        const posters = await fetchPosters();
        if (!posters || posters.length < 8) {
            actionBtn.disabled = false;
            actionBtn.textContent = "RETRY INITIALIZATION";
            isPlaying = false;
            return;
        }

        buildBoard(posters);
    }

    function buildBoard(posters) {
        let cardAssets = [...posters, ...posters];
        cardAssets.sort(() => Math.random() - 0.5);

        grid.innerHTML = '';
        cardAssets.forEach(imgSrc => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.poster = imgSrc;

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back"><img src="${imgSrc}" alt="Encrypted Asset"></div>
                </div>
            `;

            card.addEventListener('click', flipCard);
            grid.appendChild(card);
        });

        actionBtn.textContent = "MATRIX ACTIVE";
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        if (this.classList.contains('matched')) return;

        this.classList.add('flipped');

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        moves++;
        movesDisplay.textContent = moves;
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.poster === secondCard.dataset.poster;

        if (isMatch) {
            disableCards();
            matches++;
            matchesDisplay.textContent = matches;
            if (matches === 8) {
                setTimeout(triggerWin, 600);
            }
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1200);
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    function triggerWin() {
        isPlaying = false;
        actionBtn.disabled = false;
        actionBtn.textContent = "INITIALIZE NEW SEQUENCE";

        const modal = document.getElementById('gameOverModal');
        document.getElementById('finalScoreDisplay').textContent = moves;
        modal.classList.add('active');
    }

    document.getElementById('modalDismissBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
    });

    actionBtn.addEventListener('click', startGame);
});