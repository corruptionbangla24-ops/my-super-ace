const cardPaytable = {'2.png':100, '5.png':80, '10.png':60, '7.png':50, '3.png':40, '4.png':30, '1.png':20, '6.png':10, '8.png':5};
let currentCombo = 1;
let totalSpinWin = 0;
let isFreeMode = false;
let freeSpinCount = 0;

function getCurrentReelsFromScreen() {
    let reels = [];
    for (let c = 0; c < 5; c++) {
        let column = [];
        let reelEl = document.getElementById(`reel-${c}`);
        if (reelEl) {
            for (let r = 0; r < 4; r++) {
                let imgEl = reelEl.children[r]?.querySelector('img');
                let imgSrc = imgEl ? imgEl.src.split('/').pop() : '8.png';
                column.push({ s: imgSrc });
            }
        }
        reels.push(column);
    }
    return reels;
}

function calculateLiveWin(reels) {
    let winPos = [];
    let totalMultiplier = 0;
    let scatterCount = 0;
    let scatterPos = [];

    for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 4; r++) {
            if (reels[c] && reels[c][r] && reels[c][r].s === '9.png') {
                scatterCount++;
                scatterPos.push(`${c},${r}`);
            }
        }
    }

    for (let r0 = 0; r0 < 4; r0++) {
        if (!reels || !reels[r0]) continue;
        let target = reels[r0].s;
        if (target === '9.png' || target === 'wild.png') continue;

        let matchCount = 1;
        let tempPos = [`0,${r0}`];

        for (let col = 1; col < 5; col++) {
            let foundInCol = false;
            for (let row = 0; row < 4; row++) {
                if (reels[col] && reels[col][row]) {
                    let cur = reels[col][row].s;
                    if (cur === target || cur === 'wild.png') {
                        tempPos.push(`${col},${row}`);
                        foundInCol = true;
                    }
                }
            }
            if (foundInCol) matchCount++; else break;
        }

        if (matchCount >= 3) {
            tempPos.forEach(p => { if (!winPos.includes(p)) winPos.push(p); });
            let payout = cardPaytable[target] || 5;
            totalMultiplier += (payout / 40) * (matchCount / 3);
        }
    }
    return { pos: winPos, multiplier: totalMultiplier, scatters: scatterCount, scatterPos: scatterPos };
}

// মাস্টার ভয়ানক স্কাটার ড্রামা
function triggerScatterDrama(scatterPos) {
    if (typeof playS === "function") playS('scatter_intro');
    let board = document.querySelector('.reels-container');
    if (board) board.classList.add('shake-screen');
    scatterPos.forEach(pos => {
        let [r, c] = pos.split(',');
        document.getElementById(`reel-${r}`)?.children[c]?.classList.add('scatter-blast');
    });
    setTimeout(() => {
        if (board) board.classList.remove('shake-screen');
        document.querySelectorAll('.scatter-blast').forEach(el => el.classList.remove('scatter-blast'));
    }, 3000);
}

async function processWinChainLive() {
    let currentReels = getCurrentReelsFromScreen();
    let winData = calculateLiveWin(currentReels);

    // ৩টি স্কাটার ডিটেকশন ও ২০টি ফ্রি স্পিন মেকানিজম
    if (winData.scatters >= 3 && !isFreeMode) {
        triggerScatterDrama(winData.scatterPos);
        isFreeMode = true;
        freeSpinCount = 20;
        
        let fsInfo = document.getElementById('fs-info');
        let fsCount = document.getElementById('fs-count');
        if (fsInfo) fsInfo.style.display = 'block';
        if (fsCount) fsCount.innerText = freeSpinCount;
        
        await new Promise(res => setTimeout(res, 3500));
    }

    if (winData.pos.length === 0) {
        currentCombo = 1;
        updateMultiplierUI(1);
        
        // ফ্রি স্পিন অটোমেটিক লুপ
        if (isFreeMode && freeSpinCount > 0) {
            freeSpinCount--;
            let fsCount = document.getElementById('fs-count');
            if (fsCount) fsCount.innerText = freeSpinCount;
            
            if (freeSpinCount === 0) {
                isFreeMode = false;
                let fsInfo = document.getElementById('fs-info');
                if (fsInfo) fsInfo.style.display = 'none';
            }
            await new Promise(res => setTimeout(res, 1000));
            if (typeof handleSpinButton === "function") handleSpinButton();
        } else {
            isSpinning = false;
        }
        return;
    }

    let activeMultiplier = 1;
    if (currentCombo === 2) activeMultiplier = 2;
    else if (currentCombo === 3) activeMultiplier = 3;
    else if (currentCombo >= 4) activeMultiplier = 5;

    updateMultiplierUI(currentCombo);

    let stepWin = currentBet * winData.multiplier * activeMultiplier;
    totalSpinWin += stepWin;

    // A. হাইলাইট
    winData.pos.forEach(pos => {
        let [r, c] = pos.split(',');
        document.getElementById(`reel-${r}`)?.children[c]?.classList.add('win-highlight');
    });
    if (typeof playS === "function") playS('win');
    await new Promise(res => setTimeout(res, 700));

    // B. ভ্যানিশ
    winData.pos.forEach(pos => {
        let [r, c] = pos.split(',');
        let card = document.getElementById(`reel-${r}`)?.children[c];
        if (card) { card.classList.remove('win-highlight'); card.classList.add('explode'); }
    });
    await new Promise(res => setTimeout(res, 400));

    // C. নতুন ভিন্ন ভিন্ন ছবি রিফিল
    winData.pos.forEach(pos => {
        let [r, c] = pos.split(',');
        let card = document.getElementById(`reel-${r}`)?.children[c];
        if (card) {
            let keys = Object.keys(cardPaytable);
            let randomImg = keys[Math.floor(Math.random() * keys.length)];
            card.innerHTML = `<img src="${randomImg}">`;
            card.classList.remove('explode');
            card.classList.add('cell-new');
        }
    });
    if (typeof playS === "function") playS('stop');
    
    animateWinText(totalSpinWin);
    await new Promise(res => setTimeout(res, 600));

    // সার্ভারে লাইভ জয়ের ডাটা পাঠানো
    try { await fetch(`update_live_win.php?uid=${userId}&win=${stepWin}`); } catch(e){}

    currentCombo++;
    await processWinChainLive();
}

function animateWinText(targetAmount) {
    let winEl = document.getElementById('win-amount');
    if (!winEl) return;
    let start = parseFloat(winEl.innerText) || 0;
    let duration = 500, startT = null;
    function step(currT) {
        if (!startT) startT = currT;
        let progress = currT - startT;
        let currV = Math.min(start + (targetAmount - start) * (progress / duration), targetAmount);
        winEl.innerText = currV.toFixed(2);
        if (progress < duration) requestAnimationFrame(step);
        else winEl.innerText = targetAmount.toFixed(2);
    }
    requestAnimationFrame(step);
}

function updateMultiplierUI(combo) {
    document.querySelectorAll('.mult-box').forEach(el => el.classList.remove('active'));
    if (combo === 1) document.getElementById('m1')?.classList.add('active');
    else if (combo === 2) document.getElementById('m2')?.classList.add('active');
    else if (combo === 3) document.getElementById('m3')?.classList.add('active');
    else if (combo >= 4) document.getElementById('m5')?.classList.add('active');
}
