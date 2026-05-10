/**
 * ১. কার্ড হাইলাইট করা (উইনিং পজিশন অনুযায়ী)
 */
function highlightWinningCards(winPos, winAmount) {
    if (!winPos) return;

    // স্মার্ট সাউন্ড: বড় উইন হলে 'bigwin', ছোট হলে 'win' বাজবে
    if (typeof playS === 'function') {
        if (winAmount >= (currentBet * 5)) {
            playS('bigwin');
        } else {
            playS('win');
        }
    }

    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl && reelEl.children[c]) {
            reelEl.children[c].classList.add('win-highlight');
        }
    });
}

/**
 * ২. কার্ড উধাও করা (Explosion Effect)
 */
function vanishWinningCards(winPos) {
    if (!winPos) return;
    if (typeof playS === 'function') playS('stop'); // কার্ড ফাটার শব্দ

    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl && reelEl.children[c]) {
            let card = reelEl.children[c];
            card.classList.remove('win-highlight');
            card.classList.add('explode');
        }
    });
}

/**
 * ৩. নতুন কার্ড উপর থেকে পড়া (Falling Animation)
 */
function fillUpNewCards(winPos, nextCombo) {
    if (!winPos || !nextCombo) return;
    if (typeof playS === 'function') playS('stop'); // কার্ড পড়ার শব্দ

    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl && reelEl.children[c]) {
            let card = reelEl.children[c];
            if (nextCombo[r] && nextCombo[r][c]) {
                // নতুন ইমেজ বসানো
                card.innerHTML = `<img src="${nextCombo[r][c].s}">`;
                card.classList.remove('explode');
                card.classList.add('card-dropping'); 
                
                // এনিমেশন শেষ হলে ক্লাসটি সরিয়ে ফেলা
                setTimeout(() => {
                    card.classList.remove('card-dropping');
                }, 500);
            }
        }
    });
}

/**
 * ৪. মাল্টিপ্লায়ার লাইট কন্ট্রোল (x1, x2, x3, x5)
 */
function updateMultiplierDisplay(level) {
    ['x1', 'x2', 'x3', 'x5'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    let currentId = level === 1 ? 'x1' : (level === 2 ? 'x2' : (level === 3 ? 'x3' : 'x5'));
    let activeEl = document.getElementById(currentId);
    if (activeEl) {
        activeEl.classList.add('active');
    }
}

/**
 * ৫. মাস্টার চেইন প্রসেসর (Recursive Chain Reaction)
 */
async function processWinChain(winData, level = 1) {
    // যদি কোনো উইন না থাকে, তবে চেইন শেষ
    if (!winData || !winData.win_pos || winData.win_pos.length === 0) {
        isSpinning = false;
        // ১ সেকেন্ড পর মাল্টিপ্লায়ার আবার x1 এ ফিরে যাবে
        setTimeout(() => updateMultiplierDisplay(1), 1000);
        return;
    }

    // ১. ওপরের মাল্টিপ্লায়ার লাইট আপডেট
    updateMultiplierDisplay(level);

    // ২. কার্ড হাইলাইট ও উইন সাউন্ড
    highlightWinningCards(winData.win_pos, winData.win);
    await new Promise(res => setTimeout(res, isTurbo ? 300 : 800));

    // ৩. কার্ড উধাও করা
    vanishWinningCards(winData.win_pos);
    await new Promise(res => setTimeout(res, isTurbo ? 200 : 500));

    // ৪. নতুন কার্ড ওপর থেকে পড়া
    fillUpNewCards(winData.win_pos, winData.next_combo);
    await new Promise(res => setTimeout(res, isTurbo ? 200 : 500));

    // ৫. উইন অ্যামাউন্ট ক্যালকুলেশন ও ডিসপ্লে (মাল্টিপ্লায়ার সহ)
    let winEl = document.getElementById('win-amount');
    if (winEl && winData.win > 0) {
        let currentMulti = level === 1 ? 1 : (level === 2 ? 2 : (level === 3 ? 3 : 5));
        let stepWin = parseFloat(winData.total_win_so_far || winData.win) * currentMulti;
        winEl.innerText = stepWin.toFixed(2);
    }

    // ৬. জাদুর লুপ: যদি আরও চেইন উইন বাকি থাকে
    if (winData.next_win_data) {
        // টার্বো মোডে চেইন খুব দ্রুত চলবে
        await new Promise(res => setTimeout(res, isTurbo ? 200 : 1000));
        
        let nextLevel = Math.min(level + 1, 4); // লেভেল ৪ মানে x5 বাটন
        await processWinChain(winData.next_win_data, nextLevel);
    } else {
        // সব চেইন শেষ হলে ফাইনাল ব্যালেন্স আপডেট
        if (winData.balance) {
            let balEl = document.getElementById('balance');
            if (balEl) balEl.innerText = parseFloat(winData.balance).toFixed(2);
        }
        isSpinning = false;
        
        // অটো স্পিন মোড অন থাকলে পরের স্পিন শুরু হবে
        if (typeof checkNextAuto === 'function') {
            checkNextAuto();
        }
    }
}
