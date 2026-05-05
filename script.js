let queue = [], isSpinning = false, isFreeMode = false, freeSpinCount = 0, currentMultiplier = 1;

// ডাটা লোড করা
async function loadBatch() {
    try {
        let r = await fetch(`spin_generator.php?uid=${userId}${isFreeMode ? '&mode=free' : ''}`);
        let d = await r.json();
        if (d.results) queue = d.results;
        if (d.balance) document.getElementById('balance').innerText = parseFloat(d.balance).toFixed(2);
    } catch (e) { console.error("Data Load Error"); }
}

// স্পিন হ্যান্ডেল করা
async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;

    if (isFreeMode) {
        freeSpinCount--;
        document.getElementById('fs-count').innerText = freeSpinCount;
    }

    let data = queue.shift();
    playS('spin');

    // রীল আপডেট
    data.reels.forEach((col, i) => {
        let el = document.getElementById(`reel-${i}`);
        el.innerHTML = col.map((c, j) => `
            <div class="cell cell-fall" style="animation-delay: ${j*0.05}s">
                <img src="${c.s}">
            </div>
        `).join('');
    });

    // উইন চেক ও অটো-প্লে
    setTimeout(() => {
        isSpinning = false;
        if (data.win > 0) {
            document.getElementById('win-amount').innerText = data.win;
            playS('win');
        }
        
        // ফ্রি স্পিন লজিক
        if (isFreeMode && freeSpinCount > 0) {
            setTimeout(handleSpin, 1500);
        } else if (isFreeMode && freeSpinCount === 0) {
            isFreeMode = false;
            document.getElementById('fs-info').style.display = 'none';
            alert("Free Spins Finished!");
        }

        if (queue.length < 5) loadBatch();
    }, 1000);
}

// বাটন কানেক্ট
document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();
