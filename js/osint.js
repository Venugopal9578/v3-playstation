document.addEventListener('DOMContentLoaded', () => {
    // Fetching 4 profiles at once: 1 Target, 3 Decoys for the multiple-choice options. Extremely fast, zero keys.
    const API_URL = 'https://randomuser.me/api/?results=4&inc=name,location,dob,picture&noinfo';

    const grid = document.getElementById('dataGrid');
    const scoreDisplay = document.getElementById('score');
    const actionBtn = document.getElementById('actionBtn');

    let isPlaying = false;
    let score = 0;
    let target = null;
    let decoys = [];
    let currentQuestionType = '';
    let timerInterval;

    async function fetchIntel() {
        grid.innerHTML = '<div style="color: #ef4444; text-align: center; width: 100%;">Intercepting encrypted data packets...</div>';
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('API Breach');
            const data = await response.json();

            target = data.results[0];
            decoys = [data.results[1], data.results[2], data.results[3]];
            return true;
        } catch (error) {
            console.error("Connection Fault:", error);
            grid.innerHTML = '<div style="color: #ff3366; text-align: center; width: 100%;">Interception Failed. Please reboot connection.</div>';
            return false;
        }
    }

    async function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = score;
        actionBtn.disabled = true;
        actionBtn.textContent = "PROFILER ACTIVE";

        initiateRound();
    }

    async function initiateRound() {
        const success = await fetchIntel();
        if (!success) {
            triggerGameOver();
            return;
        }
        renderObservationPhase();
    }

    function renderObservationPhase() {
        grid.innerHTML = `
            <div class="osint-card">
                <div class="osint-header">TARGET ACQUIRED</div>
                <img src="${target.picture.large}" alt="Target Photo" class="osint-photo">
                <div class="osint-data">
                    <div class="data-row"><span>NAME:</span> ${target.name.first} ${target.name.last}</div>
                    <div class="data-row"><span>AGE:</span> ${target.dob.age}</div>
                    <div class="data-row"><span>COUNTRY:</span> ${target.location.country}</div>
                </div>
                <div class="timer-bar-container">
                    <div class="timer-bar" id="timerBar"></div>
                </div>
            </div>
        `;

        // 8 Second Observation Timer
        const timerBar = document.getElementById('timerBar');
        let timeLeft = 100; // percentage

        timerInterval = setInterval(() => {
            timeLeft -= (100 / 80); // 80 ticks of 100ms = 8 seconds
            timerBar.style.width = `${Math.max(0, timeLeft)}%`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                renderInterrogationPhase();
            }
        }, 100);
    }

    function renderInterrogationPhase() {
        // Randomly select what to ask
        const questionTypes = ['country', 'age', 'lastName'];
        currentQuestionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        let questionText = '';
        let correctAns = '';
        let decoyAns = [];

        if (currentQuestionType === 'country') {
            questionText = "What was the target's COUNTRY of origin?";
            correctAns = target.location.country;
            decoyAns = decoys.map(d => d.location.country);
        } else if (currentQuestionType === 'age') {
            questionText = "What was the target's exact AGE?";
            correctAns = target.dob.age.toString();
            decoyAns = decoys.map(d => d.dob.age.toString());
        } else {
            questionText = "What was the target's LAST NAME?";
            correctAns = target.name.last;
            decoyAns = decoys.map(d => d.name.last);
        }

        // Combine and shuffle answers
        let answers = [...new Set([...decoyAns, correctAns])]; // Set prevents duplicate decoys
        // If we don't have 4 unique answers due to duplicates, add some generic fallbacks
        while (answers.length < 4) {
            if (currentQuestionType === 'age') answers.push((Math.floor(Math.random() * 50) + 20).toString());
            else answers.push("Unknown");
        }
        answers = answers.slice(0, 4).sort(() => Math.random() - 0.5);

        let htmlString = `
            <div class="osint-interrogation">
                <div class="osint-header blink">DATA PURGED</div>
                <div class="osint-question">${questionText}</div>
                <div class="osint-options">
        `;

        answers.forEach(ans => {
            const isCorrect = ans === correctAns;
            htmlString += `<button class="osint-btn" data-correct="${isCorrect}">${ans}</button>`;
        });

        htmlString += `</div></div>`;
        grid.innerHTML = htmlString;

        document.querySelectorAll('.osint-btn').forEach(btn => {
            btn.addEventListener('click', handleAnswer);
        });
    }

    function handleAnswer(e) {
        document.querySelectorAll('.osint-btn').forEach(btn => btn.disabled = true);

        const isCorrect = e.target.dataset.correct === "true";

        if (isCorrect) {
            e.target.classList.add('correct');
            score++;
            scoreDisplay.textContent = score;
            setTimeout(initiateRound, 1500);
        } else {
            e.target.classList.add('incorrect');
            document.querySelector('.osint-btn[data-correct="true"]').classList.add('correct-reveal');
            setTimeout(triggerGameOver, 2500);
        }
    }

    function triggerGameOver() {
        isPlaying = false;
        clearInterval(timerInterval);
        grid.innerHTML = '';
        actionBtn.disabled = false;
        actionBtn.textContent = "INTERCEPT NEW TARGET";

        const modal = document.getElementById('gameOverModal');
        document.getElementById('finalScoreDisplay').textContent = score;
        modal.classList.add('active');
    }

    document.getElementById('modalDismissBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
    });

    actionBtn.addEventListener('click', startGame);
});