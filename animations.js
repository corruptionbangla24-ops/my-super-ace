// ১. কার্ড নীল বর্ডারে হাইলাইট করা (১০২৪ উপায়ের জন্য)
function highlightWinningCards(winPos) {
    if (!winPos) return;
    playS('win');

    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl && reelEl.children[c]) {
            reelEl.children[c].classList.add('win-highlight');
        }
    });
}

// ২. কার্ড উধাও (Vanish/Explode) করা
function vanishWinningCards(winPos) {
    if (!winPos) return;
    playS('stop');

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

// ৩. নতুন কার্ড ওপর থেকে নেমে ফিলআপ হওয়া (Cascading Drop)
function fillUpNewCards(winPos, nextCombo) {
    if (!winPos || !nextCombo) return;
    playS('stop');

    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl && reelEl.children[c]) {
            let card = reelEl.children[c];
            if (nextCombo[r] && nextCombo[r][c]) {
                card.innerHTML = `<img src="${nextCombo[r][c].s}">`;
                card.classList.remove('explode');
                card.classList.add('cell-new');
            }
        }
    });
    if (typeof playS === 'function') playS('stop');
}

// ৪. ওপরে থাকা মাল্টিপ্লায়ার (x1, x2, x3, x5) হলুদ বাটন কন্ট্রোল করার ম্যাজিক
function updateMultiplierDisplay(level) {
    // সব বাটন থেকে একটিভ ক্লাস সরানো
    ['x1', 'x2', 'x3', 'x5'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    // বর্তমান কম্বো লেভেল অনুযায়ী লাইট জ্বালানো
    let currentId = level === 1 ? 'x1' : (level === 2 ? 'x2' : (level === 3 ? 'x3' : 'x5'));
    let activeEl = document.getElementById(currentId);
    if (activeEl) {
        activeEl.classList.add('active');
    }
}

// ৫. মূল চেইন রিঅ্যাকশন ইঞ্জিন (Recursive Loop)
async function processWinChain(winData, level = 1) {
    if (!winData || !winData.win_pos || winData.win_pos.length === 0) {
        isSpinning = false;
        updateMultiplierDisplay(1); // চেইন শেষ হলে আবার x1-এ ব্যাক করবে
        return;
    }

    // মাল্টিপ্লায়ার লাইট সচল করা
    updateMultiplierDisplay(level);

    // A. কার্ড হাইলাইট করা
    highlightWinningCards(winData.win_pos);
    if (typeof playS === 'function') playS('win');
    await new Promise(res => setTimeout(res, 800));

    // B. কার্ড ভ্যানিশ করা
    vanishWinningCards(winData.win_pos);
    await new Promise(res => setTimeout(res, 500));

    // C. নতুন কার্ড ফিলআপ
    fillUpNewCards(winData.win_pos, winData.next_combo);
    await new Promise(res => setTimeout(res, 500));

    // D. টাকা গোনার রিয়েল-টাইম এনিমেশন (মাল্টিপ্লায়ার সহ গুণফল)
    if (winData.win > 0) {
        let winEl = document.getElementById('win-amount');
        if (winEl) {
            let startWin = parseFloat(winEl.innerText) || 0;
            let currentMulti = level === 1 ? 1 : (level === 2 ? 2 : (level === 3 ? 3 : 5));
            let endWin = parseFloat(winData.total_win_so_far || winData.win) * currentMulti;
            let duration = 800, startTime = null;

            function countWin(currentTime) {
                if (!startTime) startTime = currentTime;
                let progress = currentTime - startTime;
                let currentWin = Math.min(startWin + (endWin - startWin) * (progress / duration), endWin);
                winEl.innerText = currentWin.toFixed(2);
                if (progress < duration) {
                    requestAnimationFrame(countWin);
                } else {
                    winEl.innerText = endWin.toFixed(2);
                }
            }
            requestAnimationFrame(countWin);
        }
    }

    // E. আনলিমিটেড লুপ: যদি ডাটাবেস থেকে পরবর্তী কম্বো পাঠানো হয়ে থাকে
    if (winData.next_win_data) {
        // ১১১ নম্বর লাইনে এটি বসান
await new Promise(res => setTimeout(res, isTurbo ? 200 : 800));

        let nextLevel = Math.min(level + 1, 4); // ৪ নম্বর লেভেল মানে x5 বাটন
        await processWinChain(winData.next_win_data, nextLevel); 
    } else {
        // সব চেইন বিক্রিয়া শেষ হলে টাটকা ব্যালেন্স মেইন বক্সে সিঙ্ক করা
        if (winData.balance) {
            let balEl = document.getElementById('balance');
            if (balEl) balEl.innerText = parseFloat(winData.balance).toFixed(2);
        }
        isSpinning = false;
        if (typeof checkNextAuto === 'function') checkNextAuto();

        setTimeout(() => updateMultiplierDisplay(1), 1000); // পুনরায় x1-এ ব্যাক
    }
}
