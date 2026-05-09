let queue = [], isSpinning = false, currentBet = 10.00;

async function loadBatch() {
    try {
        let r = await fetch(`spin_generator.php?uid=${userId}&bet=${currentBet}`);
        let d = await r.json();
        if (d.results) queue = [...queue, ...d.results];
        if (d.balance) document.getElementById('balance').innerText = parseFloat(d.balance).toFixed(2);
    } catch (e) { setTimeout(loadBatch, 3000); }
}

async function handleSpin() {
    if (isSpinning) return;
    if (queue.length === 0) { await loadBatch(); if(queue.length===0) return; }
    isSpinning = true;
    let data = queue.shift();
    document.getElementById('win-amount').innerText = "0.00";
    renderBoard(data.reels);
    await processWinChain(data, 1);
    loadBatch();
    // ২০ নম্বর লাইনের ঠিক নিচে এটি যোগ করুন
isSpinning = false;
checkNextAuto();

}

function renderBoard(reels) {
    if (!reels) return;
    for (let c = 0; c < 5; c++) {
        let reelEl = document.getElementById(`reel-${c}`);
        reelEl.innerHTML = '';
        reels[c].forEach(row => {
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.innerHTML = `<img src="${row.s}">`;
            reelEl.appendChild(cell);
        });
    }
}

function changeBet(val) {
    if (isSpinning) return;
    currentBet = Math.max(10, Math.min(500, currentBet + val));
    document.getElementById('current-bet').innerText = currentBet.toFixed(2);
    queue = []; loadBatch();
}
// --- হোম বাটন ---
document.querySelectorAll('.nav-btn, .top-btn')[0].addEventListener('click', () => {
    window.location.href = 'index.php'; 
});

// --- সাউন্ড বাটন (৩য় বাটনটি সাধারণত সাউন্ডের হয়) ---
let isMuted = false;
document.querySelectorAll('.nav-btn, .top-btn')[1].addEventListener('click', function() {
    isMuted = !isMuted;
    this.innerText = isMuted ? "Sound: OFF" : "Sound: ON";
    this.style.color = isMuted ? "#666" : "#ffd700";
});

// টার্বো বাটন লজিক
const turboBtn = document.getElementById('turbo-btn');
let isTurbo = false; // এটি গ্লোবাল থাকতে হবে

if (turboBtn) {
    turboBtn.onclick = () => {
        isTurbo = !isTurbo;
        turboBtn.classList.toggle('turbo-active'); // সিএসএস এ হলুদ বর্ডার দিবে
        turboBtn.innerText = isTurbo ? "TURBO ON" : "TURBO OFF";
        turboBtn.style.color = isTurbo ? "#ffd700" : "#888";
    };
}

// অটো বাটন লজিক
const autoBtn = document.getElementById('auto-btn');
let isAuto = false;

if (autoBtn) {
    autoBtn.onclick = () => {
        isAuto = !isAuto;
        autoBtn.classList.toggle('auto-active');
        autoBtn.innerText = isAuto ? "AUTO ON" : "AUTO OFF";
        autoBtn.style.color = isAuto ? "#ffd700" : "#888";
        if (isAuto && !isSpinning) handleSpin();
    };
}

// অটো স্পিন কন্টিনিউ করার ফাংশন
function checkNextAuto() {
    if (isAuto && !isSpinning) {
        setTimeout(handleSpin, isTurbo ? 200 : 1200);
    }
}


document.addEventListener("DOMContentLoaded", loadBatch);
