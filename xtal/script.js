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
    if (audioContext) return;

    audioContext = new AudioContext();

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0.72;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -25;

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
        setPlayIcon("pause", "pause");
    } else {
        audio.pause();
        setPlayIcon("play_arrow", "play");
    }
});

audio.addEventListener("ended", () => {
    setPlayIcon("play_arrow", "play");
});

audio.addEventListener("ended", () => {
    setPlayIcon("play_arrow", "play");
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

    const baseRadius = width * 0.32;

    const barCount = 200;
    const maxLength = 45;

    const minFrequency = 35;
    const maxFrequency = 16000;
    const nyquist = audioContext.sampleRate / 2;

    for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;

        const normalized = i / (barCount - 1);

        const frequency = minFrequency * Math.pow(
            maxFrequency / minFrequency,
            normalized
        );

        const bin = Math.min(
            Math.round(frequency / nyquist * frequencyData.length),
            frequencyData.length - 1
        );

        let value = frequencyData[bin] / 255;

        const bassBoost = 1.0 + 1.5 * Math.pow(1 - normalized, 2);

        value = Math.min(value * bassBoost, 1);

        value = Math.pow(value, 0.85);

        const innerRadius = baseRadius;
        const outerRadius = innerRadius + value * maxLength;

        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;

        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = `rgba(220, 235, 239, ${0.3 + value * 0.7})`;
        ctx.lineWidth = 1.3;
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

    time.textContent =
        `${minutes}:${String(seconds).padStart(2, "0")}`;
});

progressContainer.addEventListener("click", (event) => {
    if (!audio.duration) return;

    const rect = progressContainer.getBoundingClientRect();

    const fraction = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width)
    );

    audio.currentTime = fraction * audio.duration;
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
draw();

function setPlayIcon(icon, label) {
    const element = play.querySelector("span");

    play.classList.add("switching");

    setTimeout(() => {
        element.textContent = icon;
        play.setAttribute("aria-label", label);

        play.classList.remove("switching");
    }, 150);
}   
