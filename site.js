function daysSince(year, month, day) {
    const then = new Date(year, month, day);
    const now = new Date();
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}
function fillDayCounters() {
    const since2019 = daysSince(2019, 0, 1);
    document.querySelectorAll('#days-since-2019, .days-2019-val').forEach(el => el.textContent = since2019);
}
fillDayCounters();
async function fetchSpotifyLanyard() {
    const discordId = '1152050115964567563';
    const ticker = document.getElementById('spotify-ticker');
    if (!ticker) return;
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        const data = await res.json();
        if (data.success && data.data.listening_to_spotify) {
            const s = data.data.spotify;
            ticker.textContent = `im listening to ${s.song.toLowerCase()} by ${s.artist.toLowerCase()} from ${s.album.toLowerCase()}!`;
        } else {
            ticker.textContent = "im not listening to anything right now so that probably means im extra sad";
        }
    } catch (err) {
        ticker.textContent = "im not awake or online or whatever";
    }
}
fetchSpotifyLanyard();
setInterval(fetchSpotifyLanyard, 10000);
function tickClock() {
    const el = document.getElementById('taskbar-clock');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
tickClock();
setInterval(tickClock, 1000);
function switchTab(tabId) {
    ['about', 'shrine', 'log', 'nodes', 'musicstats'].forEach(t => {
        const view = document.getElementById(`view-${t}`);
        const btn = document.getElementById(`btn-${t}`);
        if (view) view.classList.toggle('active', t === tabId);
        if (btn) btn.classList.toggle('active', t === tabId);
    });
}
function filterRepos(lang, btnEl) {
    const cards = document.querySelectorAll('.repo-grid .repo');
    const counter = document.getElementById('repo-count');
    document.querySelectorAll('.repo-filters button').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    let visibleCount = 0;
    cards.forEach(card => {
        const match = lang === 'all' || card.dataset.lang === lang;
        card.style.display = match ? 'flex' : 'none';
        if (match) visibleCount++;
    });
    if (counter) {
        counter.textContent = visibleCount === 1 ? '1 project' : `${visibleCount} projects`;
    }
}
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;
document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) konamiIndex++;
    else konamiIndex = (e.key === konamiCode[0]) ? 1 : 0;
    if (konamiIndex === konamiCode.length) {
        konamiIndex = 0;
        console.log("/secret.html");
    }
});