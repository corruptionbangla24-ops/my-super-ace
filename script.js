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

document.addEventListener("DOMContentLoaded", loadBatch);
