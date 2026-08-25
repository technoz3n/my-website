// ---- date counters ----
function daysSince(year, month, day) {
    const then = new Date(year, month, day);
    const now = new Date();
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function fillDayCounters() {
    const since2019 = daysSince(2019, 0, 1);
    const sinceXO = daysSince(2025, 9, 24);
    document.querySelectorAll('#days-since-2019, #days-since-2019-b').forEach(el => {
        el.textContent = since2019;
    });
    document.querySelectorAll('#days-since-xo, #days-since-xo-2').forEach(el => {
        el.textContent = sinceXO;
    });
}
fillDayCounters();

// ---- spotify / discord lanyard ----
async function fetchSpotifyLanyard() {
    const discordId = '1152050115964567563';
    const titleEls = document.querySelectorAll('.track-title');
    const artistEls = document.querySelectorAll('.track-artist');
    if (!titleEls.length) return;
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        const data = await res.json();
        if (data.success && data.data.listening_to_spotify) {
            const spotify = data.data.spotify;
            titleEls.forEach(el => el.textContent = spotify.song.toLowerCase());
            artistEls.forEach(el => el.textContent = `${spotify.artist.toLowerCase()} — ${spotify.album.toLowerCase()}`);
        } else {
            titleEls.forEach(el => el.textContent = 'nothing');
            artistEls.forEach(el => el.textContent = 'nada');
        }
    } catch (err) {
        console.error('lanyard fetch error:', err);
    }
}
fetchSpotifyLanyard();
setInterval(fetchSpotifyLanyard, 10000);

// ---- taskbar clock ----
function tickClock() {
    const el = document.getElementById('taskbar-clock');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
tickClock();
setInterval(tickClock, 1000);

// ---- projects page: language filter chips ----
function initRepoFilter() {
    const chips = document.querySelectorAll('.filter-chip');
    const rows = document.querySelectorAll('.repo-row');
    if (!chips.length || !rows.length) return;
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const lang = chip.dataset.lang;
            rows.forEach(row => {
                const match = lang === 'all' || row.dataset.lang === lang;
                row.style.display = match ? '' : 'none';
            });
        });
    });
}
initRepoFilter();