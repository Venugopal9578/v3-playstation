document.addEventListener('DOMContentLoaded', () => {
    // OpenTDB API: Category 11 (Film), Multiple Choice. 100% free, zero CORS issues, pure text.
    const API_URL = 'https://opentdb.com/api.php?amount=10&category=11&type=multiple';

    const grid = document.getElementById('dataGrid');
    const scoreDisplay = document.getElementById('score');
    const actionBtn = document.getElementById('actionBtn');

    let isPlaying = false;
    let score = 0;
    let currentQuestions = [];
    let questionIndex = 0;

    // Helper to decode HTML entities returned by the API (e.g., &quot; to ")
    function decodeHTML(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    async function fetchDatastream() {
        grid.innerHTML = '<div style="color: #8b5cf6; text-align: center; width: 100%;">Tapping into global trivia databanks...</div>';
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('API Breach');
            const data = await response.json();

            if (data.response_code !== 0) throw new Error('Data Depleted');

            currentQuestions = data.results;
            return true;
        } catch (error) {
            console.error("Connection Fault:", error);
            grid.innerHTML = '<div style="color: #ff3366; text-align: center; width: 100%;">Datastream Offline. Please reboot connection.</div>';
            return false;
        }
    }

    async function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        score = 0;
        questionIndex = 0;
        scoreDisplay.textContent = score;
        actionBtn.disabled = true;
        actionBtn.textContent = "DECRYPTION ACTIVE";

        const success = await fetchDatastream();
        if (!success) {
            actionBtn.disabled = false;
            actionBtn.textContent = "REBOOT CONNECTION";
            isPlaying = false;
            return;
        }

        renderQuestion();
    }

    function renderQuestion() {
        if (questionIndex >= currentQuestions.length) {
            triggerGameOver();
            return;
        }

        const qData = currentQuestions[questionIndex];
        const questionText = decodeHTML(qData.question);

        // Combine and shuffle answers
        let answers = [...qData.incorrect_answers, qData.correct_answer];
        answers.sort(() => Math.random() - 0.5);

        let htmlString = `
            <div class="cipher-card">
                <div class="cipher-difficulty ${qData.difficulty}">${qData.difficulty.toUpperCase()}</div>
                <div class="cipher-question">${questionText}</div>
                <div class="cipher-options">
        `;

        answers.forEach(ans => {
            const decodedAns = decodeHTML(ans);
            const isCorrect = ans === qData.correct_answer;
            htmlString += `<button class="cipher-btn" data-correct="${isCorrect}">${decodedAns}</button>`;
        });

        htmlString += `</div></div>`;
        grid.innerHTML = htmlString;

        document.querySelectorAll('.cipher-btn').forEach(btn => {
            btn.addEventListener('click', handleAnswer);
        });
    }

    function handleAnswer(e) {
        // Lock buttons
        document.querySelectorAll('.cipher-btn').forEach(btn => btn.disabled = true);

        const isCorrect = e.target.dataset.correct === "true";

        if (isCorrect) {
            e.target.classList.add('correct');
            score++;
            scoreDisplay.textContent = score;
        } else {
            e.target.classList.add('incorrect');
            // Highlight the correct one
            document.querySelector('.cipher-btn[data-correct="true"]').classList.add('correct-reveal');
        }

        setTimeout(() => {
            questionIndex++;
            renderQuestion();
        }, 1500);
    }

    function triggerGameOver() {
        isPlaying = false;
        grid.innerHTML = '';
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