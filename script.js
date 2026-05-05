let queue = [], isSpinning = false, isFreeMode = false, freeSpinCount = 0;
let isMuted = false;
// ১ ও ২ নম্বর লাইনের ঠিক নিচে এটি বসান
let currentBet = 10, isTurbo = false, isAuto = false;


async function loadBatch() {
    try {
        let url = `spin_generator.php?uid=${userId}${isFreeMode ? '&mode=free' : ''}`;
        let r = await fetch(url);
        let d = await r.json();
        if (d.results) {
            queue = d.results;
            if (document.getElementById('reel-0').innerHTML === "") renderReels(queue[0]);
        }
        if (d.balance !== undefined) document.getElementById('balance').innerText = parseFloat(d.balance).toFixed(2);
    } catch (e) { console.error("Data Load Error"); }
}

function renderReels(data) {
    data.reels.forEach((col, i) => {
        let el = document.getElementById(`reel-${i}`);
        if(el) el.innerHTML = col.map(c => `<div class="cell"><img src="${c.s}"></div>`).join('');
    });
}

async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;

    let data = queue.shift();
    playS('spin');

    data.reels.forEach((col, i) => {
        let el = document.getElementById(`reel-${i}`);
        if(el) {
            el.innerHTML = col.map((c, j) => `
                <div class="cell cell-fall" style="animation-delay: ${j*0.05}s">
                    <img src="${c.s}">
                </div>
            `).join('');
        }
    });

    setTimeout(() => {
        isSpinning = false;
        if (data.win > 0) {
            document.getElementById('win-amount').innerText = parseFloat(data.win).toFixed(2);
            playS('win');
        }
        if (queue.length < 5) loadBatch();
    }, 800);
}
// ৫২ থেকে ৫৮ লাইনের জায়গায় এটি বসান
let currentBet = 10, isTurbo = false, isAuto = false, autoInterval;

// ১. বেট কন্ট্রোল লজিক
function changeBet(amount) {
    if (isSpinning) return;
    let newBet = currentBet + amount;
    if (newBet >= 10 && newBet <= 500) {
        currentBet = newBet;
        document.getElementById('current-bet').innerText = currentBet.toFixed(2);
        playS('click');
        queue = []; 
        loadBatch();
    }
}

// ২. টার্বো ও অটো মোড হ্যান্ডেলার
document.getElementById('turbo-btn').onclick = function() {
    isTurbo = !isTurbo;
    this.classList.toggle('active');
    this.innerText = isTurbo ? "TURBO: ON" : "TURBO: OFF";
};

document.getElementById('auto-btn').onclick = function() {
    isAuto = !isAuto;
    this.classList.toggle('active');
    this.innerText = isAuto ? "AUTO: ON" : "AUTO: OFF";
    if (isAuto) startAutoCycle();
};

function startAutoCycle() {
    if (isAuto && !isSpinning) handleSpin();
    setTimeout(() => { if (isAuto) startAutoCycle(); }, isTurbo ? 1000 : 2500);
}

// ৩. মেইন বাটন কানেকশন ও ডাটা লোড
document.getElementById('sound-toggle').onclick = function() {
    isMuted = !isMuted;
    this.innerText = isMuted ? "Sound: OFF" : "Sound: ON";
};

document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();

