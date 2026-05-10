// ১. মেইন ভেরিয়েবল
let queue = [], isSpinning = false, currentBet = 10.00, isFreeMode = false;

// ২. ডাটাবেস থেকে স্পিন ডাটা লোড করা
async function loadBatch() {
    if (queue.length > 5) return;
    try {
        let url = `spin_generator.php?uid=${userId}&bet=${currentBet}${isFreeMode ? '&mode=free' : ''}`;
        let response = await fetch(url, { cache: "no-store" });
        let data = await response.json();
        
        if (data && data.results) {
            queue = [...queue, ...data.results];
        }
        if (data && data.balance !== undefined) {
            document.getElementById('balance').innerText = parseFloat(data.balance).toFixed(2);
        }
    } catch (error) {
        console.error("ডাটা লোড এরর:", error);
        setTimeout(loadBatch, 3000);
    }
}

// ৩. স্পিন বাটন কন্ট্রোল
async function handleSpin() {
    if (isSpinning) return;

    // অডিও আনলক (মোবাইল ব্রাউজারের জন্য)
    if (typeof sounds !== 'undefined') {
        Object.values(sounds).forEach(s => {
            s.play().then(() => { s.pause(); s.currentTime = 0; }).catch(() => {});
        });
    }

    if (queue.length === 0) {
        await loadBatch();
        if (queue.length === 0) return;
    }

    isSpinning = true;
    let data = queue.shift();
    
    document.getElementById('win-amount').innerText = "0.00";
    
    // স্পিন সাউন্ড বাজানো
    if (typeof playS === 'function') playS('spin');

    renderBoard(data.reels);
    
    // চেইন উইন এনিমেশন শুরু
    if (typeof processWinChain === 'function') {
        await processWinChain(data, 1);
    }
    
    // স্পিন শেষ হলে পরবর্তী চেক
    loadBatch();
    isSpinning = false;
    if (typeof checkNextAuto === 'function') checkNextAuto();
}

// ৪. রীল রেন্ডার ও উপর থেকে পড়ার এনিমেশন
function renderBoard(reels) {
    if (!reels) return;
    for (let c = 0; c < 5; c++) {
        let reelEl = document.getElementById(`reel-${c}`);
        if (reelEl && reels[c]) {
            reelEl.innerHTML = '';
            reels[c].forEach((row, index) => {
                let cell = document.createElement('div');
                cell.className = 'card-cell card-dropping'; 
                cell.style.animationDelay = `${(c * 0.1) + (index * 0.05)}s`; 
                cell.innerHTML = `<img src="${row.s}">`;
                reelEl.appendChild(cell);
            });
        }
    }
}

// ৫. বেট পরিবর্তন বাটন
function changeBet(val) {
    if (isSpinning) return;
    if (typeof playS === 'function') playS('click');
    currentBet = Math.max(10, Math.min(500, currentBet + val));
    document.getElementById('current-bet').innerText = currentBet.toFixed(2);
    queue = []; // নতুন বেটের জন্য পুরনো কিউ ক্লিয়ার
    loadBatch();
}

// --- বাটন লজিক সেকশন ---

// হোম বাটন
const homeBtn = document.querySelectorAll('.nav-btn, .top-btn')[0];
if (homeBtn) {
    homeBtn.onclick = () => {
        if (typeof playS === 'function') playS('click');
        window.location.href = 'index.php';
    };
}

// সাউন্ড বাটন
let isMuted = false;
const soundBtn = document.querySelectorAll('.nav-btn, .top-btn')[1];
if (soundBtn) {
    soundBtn.onclick = function() {
        isMuted = !isMuted;
        this.innerText = isMuted ? "Sound: OFF" : "Sound: ON";
        this.style.color = isMuted ? "#666" : "#ffd700";
        if (typeof playS === 'function') playS('click');
    };
}

// টার্বো বাটন
let isTurbo = false;
const turboBtn = document.getElementById('turbo-btn');
if (turboBtn) {
    turboBtn.onclick = () => {
        if (typeof playS === 'function') playS('click');
        isTurbo = !isTurbo;
        turboBtn.classList.toggle('turbo-active');
        turboBtn.innerText = isTurbo ? "TURBO ON" : "TURBO OFF";
    };
}

// অটো বাটন
let isAuto = false;
const autoBtn = document.getElementById('auto-btn');
if (autoBtn) {
    autoBtn.onclick = () => {
        if (typeof playS === 'function') playS('click');
        isAuto = !isAuto;
        autoBtn.classList.toggle('auto-active');
        autoBtn.innerText = isAuto ? "AUTO ON" : "AUTO OFF";
        if (isAuto && !isSpinning) handleSpin();
    };
}

// অটো স্পিন কন্টিনিউ ফাংশন
function checkNextAuto() {
    if (isAuto && !isSpinning) {
        setTimeout(handleSpin, isTurbo ? 200 : 1200);
    }
}

// পেজ লোড হলে প্রথম ব্যাচ ডাটা আনা
document.addEventListener("DOMContentLoaded", loadBatch);
