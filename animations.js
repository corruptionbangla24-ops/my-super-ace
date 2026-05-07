// ১. গেমের গ্লোবাল ভেরিয়েবল ও পে-টেবিল
const cardPaytable = {'2.png':100, '5.png':80, '10.png':60, '7.png':50, '3.png':40, '4.png':30, '1.png':20, '6.png':10, '8.png':5};
let currentCombo = 1;
let totalSpinWin = 0;
let isFreeMode = false;     // ফ্রি স্পিন মোডের ট্র্যাকার
let freeSpinCount = 0;     // কয়টি ফ্রি স্পিন বাকি আছে তার কাউন্টার

// ২. স্ক্রিন থেকে লাইভ রীল ডাটা তুলে আনা
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

// ৩. ১০২৪ উপায়ের আসল ম্যাচিং ও স্কাটার কাউন্টিং ইঞ্জিন
function calculateLiveWin(reels) {
    let winPos = [];
    let totalMultiplier = 0;
    let scatterCount = 0;
    let scatterPos = [];

    // স্ক্রিনের প্রতিটি ঘর স্ক্যান করে ৯.png (Scatter) গুনে রাখা
    for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 4; r++) {
            if (reels[c] && reels[c][r] && reels[c][r].s === '9.png') {
                scatterCount++;
                scatterPos.push(`${c},${r}`);
            }
        }
    }

    // প্রথম কলামের ছবি ধরে ১০২৪ উপায়ের ম্যাচিং চেক
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
                    let currentCard = reels[col][row].s;
                    if (currentCard === target || currentCard === 'wild.png') {
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

// ৪. জাদুকরী লাইভ চেইন লুপ (Recursive)
async function processWinChainLive() {
    let currentReels = getCurrentReelsFromScreen();
    let winData = calculateLiveWin(currentReels);

    // 🎁 জাদুর নতুন অংশ: যদি ৩টি বা তার বেশি স্কাটার পড়ে এবং গেমটি অলরেডি ফ্রি মোডে না থাকে
    if (winData.scatters >= 3 && !isFreeMode) {
        // ১. আপনার সেই ভয়ানক এনিমেশন (Screen Shake) চালু হবে
        if (typeof triggerScatterDrama === "function") {
            triggerScatterDrama(winData.scatterPos);
        }
        
        // ২. ফ্রি স্পিন কাউন্টার সেট করা
        isFreeMode = true;
        freeSpinCount = 20; // ২০টি ফ্রি স্পিন বোনাস
        
        // UI আপডেট (নিশ্চিত করুন আপনার HTML এ এই ID গুলো আছে)
        let fsInfo = document.getElementById('fs-info');
        let fsCount = document.getElementById('fs-count');
        if (fsInfo) fsInfo.style.display = 'block';
        if (fsCount) fsCount.innerText = freeSpinCount;
        
        playS('scatter'); // স্কাটার জয়ের রাজকীয় সাউন্ড
        await new Promise(res => setTimeout(res, 3500)); // ৩.৫ সেকেন্ড ড্রামা দেখতে দিন
    }

    // যদি আর কোনো ১০২৪ উপায়ের মিল না থাকে, তবে চেইন রিঅ্যাকশন শেষ
    if (winData.pos.length === 0) {
        currentCombo = 1;
        updateMultiplierUI(1);
        
        // 🔁 ফ্রি স্পিন মোড চালু থাকলে অটোমেটিক পরবর্তী ফ্রি স্পিন চালানো
        if (isFreeMode && freeSpinCount > 0) {
            freeSpinCount--;
            let fsCount = document.getElementById('fs-count');
            if (fsCount) fsCount.innerText = freeSpinCount;
            
            if (freeSpinCount === 0) {
                isFreeMode = false; // ২০টি শেষ হলে ফ্রি মোড অফ
                let fsInfo = document.getElementById('fs-info');
                if (fsInfo) fsInfo.style.display = 'none';
            }
            
            // ১ সেকেন্ড বিরতি দিয়ে স্বয়ংক্রিয়ভাবে পরের ফ্রি স্পিন শুরু করা 🚀
            await new Promise(res => setTimeout(res, 1000));
            if (typeof handleSpin === "function") handleSpin();
        } else {
            isSpinning = false; // সাধারণ মোডে স্পিন বাটন আনলক
        }
        return;
    }

    // কম্বো লেভেল অনুযায়ী মাল্টিপ্লায়ার মিটার ফিক্সিং (x1, x2, x3, x5)
    let activeMultiplier = 1;
    if (currentCombo === 2) activeMultiplier = 2;
    else if (currentCombo === 3) activeMultiplier = 3;
    else if (currentCombo >= 4) activeMultiplier = 5;

    updateMultiplierUI(currentCombo);

    let stepWin = currentBet * winData.multiplier * activeMultiplier;
    totalSpinWin += stepWin;

    // A. উইনিং কার্ড নীল আভা দিয়ে হাইলাইট
    winData.pos.forEach(pos => {
        let [r, c] = pos.split(',');
        document.getElementById(`reel-${r}`)?.children[c]?.classList.add('win-highlight');
    });
    playS('win');
    await new Promise(res => setTimeout(res, 700));

    // B. উইনিং কার্ড উধাও (Vanish)
    winData.pos.forEach(pos => {
        let [r, c] = pos.split(',');
        let card = document.getElementById(`reel-${r}`)?.children[c];
        if (card) {
            card.classList.remove('win-highlight');
            card.classList.add('explode');
        }
    });
    await new Promise(res => setTimeout(res, 400));

    // C. জাদুর রিফিল (Refill)
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
    playS('stop');
    
    animateWinText(totalSpinWin);
    await new Promise(res => setTimeout(res, 600));

    // সার্ভারে লাইভ উইন আপডেট পাঠানো (ডাটাবেসে ব্যালেন্স যোগ)
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
