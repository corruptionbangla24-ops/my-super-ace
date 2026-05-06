// ১. কার্ড নীল বর্ডারে হাইলাইট করা
function highlightWinningCards(winPos) {
    if (!winPos) return;
    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl && reelEl.children[c]) {
            reelEl.children[c].classList.add('win-highlight');
        }
    });
}

// ২. কার্ড উধাও (Vanish) করা
function vanishWinningCards(winPos) {
    if (!winPos) return;
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

// ৩. নতুন কার্ড দিয়ে ফিলআপ (Cascading)
function fillUpNewCards(winPos, nextCombo) {
    if (!winPos || !nextCombo) return;
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
    playS('stop');
}

// ৪. মাস্টার চেইন ফাংশন (Recursive - এটিই বারবার নিজেকে কল করবে)
async function processWinChain(winData) {
    if (!winData || !winData.win_pos || winData.win_pos.length === 0) {
        isSpinning = false; // যখন আর কোনো উইন থাকবে না, তখন লক খুলবে
        return;
    }

    // A. হাইলাইট এনিমেশন
    highlightWinningCards(winData.win_pos);
    playS('win');
    await new Promise(res => setTimeout(res, 800));

    // B. ভ্যানিশ এনিমেশন
    vanishWinningCards(winData.win_pos);
    await new Promise(res => setTimeout(res, 500));

    // C. নতুন কার্ড ফিলআপ
    fillUpNewCards(winData.win_pos, winData.next_combo);
    await new Promise(res => setTimeout(res, 500));

    // D. টাকা গোনার এনিমেশন (Counting)
    if (winData.win > 0) {
        let winEl = document.getElementById('win-amount');
        let startWin = parseFloat(winEl.innerText) || 0;
        let endWin = parseFloat(winData.total_win_so_far || winData.win);
        let duration = 800, startTime = null;

        function countWin(currentTime) {
            if (!startTime) startTime = currentTime;
            let progress = currentTime - startTime;
            let currentWin = Math.min(startWin + (endWin - startWin) * (progress / duration), endWin);
            if (winEl) winEl.innerText = currentWin.toFixed(2);
            if (progress < duration) requestAnimationFrame(countWin);
            else if (winEl) winEl.innerText = endWin.toFixed(2);
        }
        requestAnimationFrame(countWin);
    }

    // E. জাদুর লুপ: যদি সার্ভার থেকে আরও পরের উইন (Next Combo Win) পাঠানো হয়ে থাকে
    if (winData.next_win_data) {
        console.log("পরের চেইন উইন শুরু হচ্ছে...");
        await new Promise(res => setTimeout(res, 1000)); // সামান্য বিরতি
        await processWinChain(winData.next_win_data); // নিজেকে আবার কল করা (আনলিমিটেড চেইন)
    } else {
        // সব উইন শেষ হলে মেইন ব্যালেন্স সিঙ্ক করা
        if (winData.balance) {
            document.getElementById('balance').innerText = parseFloat(winData.balance).toFixed(2);
        }
        isSpinning = false;
    }
}
