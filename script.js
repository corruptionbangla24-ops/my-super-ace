let queue = [], isSpinning = false, isFreeMode = false, freeSpinCount = 0;
let currentBet = 10, isTurbo = false, isAuto = false, isMuted = false;

async function loadBatch() {
    try {
        let url = `spin_generator.php?uid=${userId}&bet=${currentBet}${isFreeMode ? '&mode=free' : ''}`;
        let r = await fetch(url);
        let d = await r.json();
        if (d.results) queue = d.results;
        if (d.balance) document.getElementById('balance').innerText = parseFloat(d.balance).toFixed(2);
    } catch (e) { console.error("Data error"); }
}

async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;

    if (isFreeMode && freeSpinCount > 0) {
        freeSpinCount--;
        document.getElementById('fs-count').innerText = freeSpinCount;
    }

    let data = queue.shift();
    playS('spin');

    data.reels.forEach((col, i) => {
        let el = document.getElementById(`reel-${i}`);
        el.innerHTML = col.map((c, j) => `
            <div class="cell cell-fall" style="animation-delay: ${j*0.05}s">
                <img src="${c.s}">
            </div>
        `).join('');
    });

    setTimeout(async () => {
        playS('stop');
        if (data.win > 0) {
            // এটি animations.js থেকে নীল হাইলাইট আর ভ্যানিশ চালাবে
            await processWinChain(data); 
        } else {
            isSpinning = false;
        }

        checkFreeSpin(data);
        if (queue.length < 5) loadBatch();
    }, 800);
}

function checkFreeSpin(data) {
    // ১. ২০টি ফ্রি স্পিন শুরু করা (৩টি ৯.png পড়লে)
    if (data.free_spins > 0 && !isFreeMode) {
        isFreeMode = true;
        freeSpinCount = data.free_spins; // ২০টি
        document.getElementById('fs-info').style.display = 'block';
        document.getElementById('fs-count').innerText = freeSpinCount;
        playS('scatter');
    }

    // ২. অটো-স্পিন লজিক (এটি গেমকে থামতে দেবে না)
    if (isFreeMode && freeSpinCount > 0) {
        isSpinning = false; // লক খুলে দেওয়া যাতে পরের স্পিন হতে পারে
        setTimeout(() => {
            if (isFreeMode) handleSpin(); // অটোমেটিক পরের স্পিন শুরু
        }, isTurbo ? 800 : 1500);
    } else if (isFreeMode && freeSpinCount === 0) {
        isFreeMode = false;
        document.getElementById('fs-info').style.display = 'none';
        isSpinning = false;
    } else {
        isSpinning = false; // নরমাল স্পিন শেষে লক খোলা
    }
}


    

function changeBet(val) {
    if (isSpinning) return;
    currentBet = Math.max(10, Math.min(500, currentBet + val));
    document.getElementById('current-bet').innerText = currentBet.toFixed(2);
    queue = []; loadBatch();
}

document.getElementById('turbo-btn').onclick = () => { isTurbo = !isTurbo; document.getElementById('turbo-btn').classList.toggle('active'); };
document.getElementById('auto-btn').onclick = () => { isAuto = !isAuto; document.getElementById('auto-btn').classList.toggle('active'); if(isAuto) handleSpin(); };
document.getElementById('sound-toggle').onclick = () => { isMuted = !isMuted; document.getElementById('sound-toggle').innerText = isMuted ? "Sound: OFF" : "Sound: ON"; };
document.getElementById('spin-btn').onclick = handleSpin;

loadBatch();
