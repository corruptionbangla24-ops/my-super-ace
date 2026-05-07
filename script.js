    let currentBet = 1.00; // ১ টাকা থেকে শুরু
let isSpinning = false;
let userId = 1;

function changeBet(val) {
    if (isSpinning) return;
    currentBet = Math.max(1.00, Math.min(500.00, currentBet + val));
    let betEl = document.getElementById('current-bet');
    if (betEl) betEl.innerText = currentBet.toFixed(2);
}

function updateReelsOnScreen(reelsData) {
    for (let c = 0; c < 5; c++) {
        let reelEl = document.getElementById(`reel-${c}`);
        if (reelEl && reelsData[c]) {
            for (let r = 0; r < 4; r++) {
                let card = reelEl.children[r];
                if (card && reelsData[c][r]) {
                    card.innerHTML = `<img src="${reelsData[c][r].s}">`;
                }
            }
        }
    }
}

async function handleSpinButton() {
    if (isSpinning) return;
    
    let balEl = document.getElementById('balance');
    if (!balEl) return;
    
    let currentBal = parseFloat(balEl.innerText);
    
    if (currentBal < currentBet && !isFreeMode) {
        alert("পরপ্ত ব্যালেন্স নেই!");
        return;
    }
    
    isSpinning = true;
    if (typeof playS === "function") playS('spin');

    if (!isFreeMode) {
        balEl.innerText = (currentBal - currentBet).toFixed(2);
    }
    
    let winEl = document.getElementById('win-amount');
    if (winEl) winEl.innerText = "0.00";
    
    try {
        let url = `spin_generator.php?uid=${userId}&bet=${currentBet}${isFreeMode ? '&mode=free' : ''}`;
        let res = await fetch(url, { cache: "no-store" });
        let data = await res.json();
        
        if (data.reels) {
            updateReelsOnScreen(data.reels);
            await new Promise(r => setTimeout(r, 600)); // চাকা থামা বিরতি
            
            totalSpinWin = 0; 
            currentCombo = 1;
            await processWinChainLive(); // লাইভ এনিমেশন ইঞ্জিন চালু
        } else {
            isSpinning = false;
        }
    } catch (e) {
        console.error(e);
        isSpinning = false;
    }
}
