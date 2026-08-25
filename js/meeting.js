const meetsPerWeekInput = document.getElementById('meetsPerWeek');
const durationInput = document.getElementById('duration');
const yearsInput = document.getElementById('years');
const totalHoursEl = document.getElementById('totalHours');
const contextTextEl = document.getElementById('contextText');

function calculateStats() {
    const meets = parseFloat(meetsPerWeekInput.value) || 0;
    const mins = parseFloat(durationInput.value) || 0;
    const years = parseFloat(yearsInput.value) || 0;

    // Assuming a standard 48-week working year
    const totalMinutes = meets * mins * 48 * years;
    const totalHours = Math.floor(totalMinutes / 60);
    const continuousDays = (totalHours / 24).toFixed(1);

    // Animate the number update slightly for better feel
    totalHoursEl.textContent = totalHours.toLocaleString();

    let context = `That is ${continuousDays} straight days of non-stop talking. `;

    if (totalHours === 0) {
        context = "You are either unemployed, or you have achieved absolute workplace nirvana.";
    } else if (totalHours < 100) {
        context += "A remarkably low amount of time. You are defending your calendar well.";
    } else if (totalHours < 500) {
        context += "You could have comfortably learned a new language or mastered an instrument in this time.";
    } else if (totalHours < 2000) {
        context += "You could have walked across the entire continent instead of looking at those slides.";
    } else {
        context += "A staggering sacrifice to the corporate machine. My deepest condolences.";
    }

    contextTextEl.textContent = context;
}

// Bind live updates to all inputs
[meetsPerWeekInput, durationInput, yearsInput].forEach(input => {
    input.addEventListener('input', calculateStats);
});

// Initial calculation
calculateStats();