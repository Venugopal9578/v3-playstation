const gameWindow = document.getElementById('gameWindow');

// --- PHASE 1: The Infinite Runner (Mobile Ready) ---
function loadPhase1() {
    gameWindow.innerHTML = `
    <h3 style="margin-bottom: 12px; font-size: 1.5rem;">Email Preferences</h3>
    <p style="margin-bottom: 24px; color: #64748b; font-size: 0.95rem;">Are you absolutely sure you want to stop receiving our daily updates?</p>
    <button id="stayBtn" class="btn btn-primary">Keep Me Subscribed</button>
    <button id="unsubBtn" class="btn btn-danger">Unsubscribe</button>
    <p id="hintText" class="hint-text" style="cursor:pointer; pointer-events:auto;">
      (Hint: Desktop use keyboard. Mobile tap this text.)
    </p>
  `;

    const unsubBtn = document.getElementById('unsubBtn');
    const stayBtn = document.getElementById('stayBtn');
    const hintText = document.getElementById('hintText');
    let evasionCount = 0;

    const evade = (e) => {
        // Prevent mobile touch from registering as a click before it jumps
        if (e.type === 'touchstart') e.preventDefault();

        evasionCount++;
        if (evasionCount === 8) {
            hintText.style.opacity = '1';
        }

        const maxX = gameWindow.clientWidth - unsubBtn.clientWidth - 20;
        const maxY = gameWindow.clientHeight - unsubBtn.clientHeight - 20;
        const x = Math.max(10, Math.random() * maxX);
        const y = Math.max(10, Math.random() * maxY);

        unsubBtn.style.position = 'absolute';
        unsubBtn.style.left = `${x}px`;
        unsubBtn.style.top = `${y}px`;
    };

    ['mouseenter', 'touchstart'].forEach(evt => unsubBtn.addEventListener(evt, evade));

    unsubBtn.addEventListener('click', loadPhase2);

    // The Mobile Escape Hatch
    hintText.addEventListener('click', loadPhase2);
    hintText.addEventListener('touchstart', (e) => { e.preventDefault(); loadPhase2(); });

    stayBtn.addEventListener('click', () => alert("Excellent choice. Your preferences have been saved forever."));
}

// --- PHASE 2: The Precision Slider (Mobile Ready) ---
function loadPhase2() {
    const targetValue = (Math.random() * 40 + 30).toFixed(2);
    let currentVal = 0.00;

    gameWindow.innerHTML = `
    <h3 style="margin-bottom: 16px;">Verify Intent</h3>
    <p style="color: #475569; font-size: 0.95rem; padding: 0 20px;">
      To prove you are not a bot, please set the confirmation slider to exactly <strong style="color: #ef4444;">${targetValue}%</strong>.
    </p>
    
    <div class="slider-container">
      <h2 style="margin-bottom: 12px; font-variant-numeric: tabular-nums; display: flex; justify-content: center; align-items: center; gap: 16px;">
        <span id="nudgeDown" style="cursor: pointer; color: #94a3b8; font-size: 1.5rem; padding: 10px; user-select: none;">-</span>
        <span id="currentSliderVal">0.00%</span>
        <span id="nudgeUp" style="cursor: pointer; color: #94a3b8; font-size: 1.5rem; padding: 10px; user-select: none;">+</span>
      </h2>
      <input type="range" id="precisionSlider" min="0" max="100" value="0" step="0.01">
    </div>
    
    <button id="nextBtn" class="btn btn-danger" disabled>Confirm Velocity</button>
  `;

    const slider = document.getElementById('precisionSlider');
    const display = document.getElementById('currentSliderVal');
    const nextBtn = document.getElementById('nextBtn');
    const nudgeDown = document.getElementById('nudgeDown');
    const nudgeUp = document.getElementById('nudgeUp');

    function updateDisplay(val) {
        currentVal = parseFloat(val);
        slider.value = currentVal;
        const formattedVal = currentVal.toFixed(2);
        display.textContent = `${formattedVal}%`;

        if (formattedVal === targetValue) {
            display.style.color = '#10b981';
            nextBtn.disabled = false;
            nextBtn.classList.remove('btn-danger');
            nextBtn.classList.add('btn-primary');
        } else {
            display.style.color = '#1e293b';
            nextBtn.disabled = true;
            nextBtn.classList.remove('btn-primary');
            nextBtn.classList.add('btn-danger');
        }
    }

    slider.addEventListener('input', (e) => updateDisplay(e.target.value));

    nudgeDown.addEventListener('click', () => updateDisplay(Math.max(0, currentVal - 0.01)));
    nudgeUp.addEventListener('click', () => updateDisplay(Math.min(100, currentVal + 0.01)));

    nextBtn.addEventListener('click', loadPhase3);
}

// --- PHASE 3: The Logic Matrix (Naturally Mobile Ready) ---
function loadPhase3() {
    gameWindow.innerHTML = `
    <h3 style="margin-bottom: 12px;">Final Security Check</h3>
    <p style="color: #475569; font-size: 0.95rem;">Uncheck all boxes below to finalize your request.</p>
    <div id="matrixGrid" class="matrix-grid"></div>
  `;

    const grid = document.getElementById('matrixGrid');
    let state = [0, 1, 0, 1, 1, 1, 0, 1, 0];

    function renderGrid() {
        grid.innerHTML = '';
        let allUnchecked = true;

        for (let i = 0; i < 9; i++) {
            if (state[i] === 1) allUnchecked = false;

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = state[i] === 1;

            cb.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMatrix(i);
            });

            grid.appendChild(cb);
        }

        if (allUnchecked) {
            setTimeout(showVictory, 400);
        }
    }

    function toggleMatrix(index) {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const toToggle = [index];

        if (row > 0) toToggle.push(index - 3);
        if (row < 2) toToggle.push(index + 3);
        if (col > 0) toToggle.push(index - 1);
        if (col < 2) toToggle.push(index + 1);

        toToggle.forEach(i => { state[i] = state[i] === 1 ? 0 : 1; });
        renderGrid();
    }

    renderGrid();
}

function showVictory() {
    gameWindow.innerHTML = `
    <h3 style="margin-bottom: 12px; color: #10b981; font-size: 1.8rem;">Successfully Unsubscribed</h3>
    <p style="color: #64748b;">You have defeated the corporate labyrinth.</p>
    <p style="margin-top: 30px; font-size: 0.75rem; color: #cbd5e1;">*By reading this sentence, you have automatically signed a 10-year lease for a timeshare in Florida.</p>
  `;
}

loadPhase1();