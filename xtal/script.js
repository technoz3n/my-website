const audio = document.getElementById("audio");
const play = document.getElementById("play");
const canvas = document.getElementById("spectrum");
const ctx = canvas.getContext("2d");
const progress = document.getElementById("progress");
const progressContainer = document.querySelector(".progress-container");
const time = document.getElementById("time");

let audioContext;
let analyser;
let source;
let frequencyData;

function setupAudio() {
    if (audioContext) {
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
        return;
    }

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;

    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    frequencyData = new Uint8Array(analyser.frequencyBinCount);
}

play.addEventListener("click", async () => {
    setupAudio();

    if (audio.paused) {
        await audioContext.resume();
        await audio.play();
        play.textContent = "Ⅱ";
    } else {
        audio.pause();
        play.textContent = "▶";
    }
});

audio.addEventListener("ended", () => {
    play.textContent = "▶";
});

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw() {
    requestAnimationFrame(draw);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    if (!analyser) return;

    analyser.getByteFrequencyData(frequencyData);

    const centerX = width / 2;
    const centerY = height / 2;

    const baseRadius = width * 0.365;
    const barCount = 160;
    const step = Math.floor(frequencyData.length / barCount);

    for (let i = 0; i < barCount; i++) {
        const value = frequencyData[i * step] / 255;
        const angle = (i / barCount) * Math.PI * 2;

        const innerRadius = baseRadius;
        const outerRadius = innerRadius + value * 38;

        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(220, 235, 239, ${0.35 + value * 0.65})`;
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";
        ctx.stroke();
    }
}

audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;

    progress.style.width =
        `${(audio.currentTime / audio.duration) * 100}%`;

    const minutes = Math.floor(audio.currentTime / 60);
    const seconds = Math.floor(audio.currentTime % 60);

    time.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;
});

progressContainer.addEventListener("click", (event) => {
    if (!audio.duration) return;

    const rect = progressContainer.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;

    audio.currentTime = fraction * audio.duration;
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
draw();
