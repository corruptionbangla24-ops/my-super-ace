// ১. কার্ড হাইলাইট (নীল বর্ডার)
function highlightWinningCards(winPos) {
    if (!winPos) return;
    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl) {
            let card = reelEl.children[c];
            if (card) card.classList.add('win-highlight');
        }
    });
}

// ২. কার্ড উধাও (Vanish)
function vanishWinningCards(winPos) {
    if (!winPos) return;
    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl) {
            let card = reelEl.children[c];
            if (card) {
                card.classList.remove('win-highlight');
                card.classList.add('explode'); // এটি কার্ডটি ঘোলা ও ছোট করবে
            }
        }
    });
}

// ৩. মাস্টার চেইন ফাংশন (এটি script.js থেকে কল হয়)
async function processWinChain(winData) {
    if (!winData || !winData.win_pos) {
        isSpinning = false; // কোনো উইন না থাকলে লক খুলে দাও
        return;
    }

    // ১. নীল হাইলাইট শুরু
    highlightWinningCards(winData.win_pos);
    playS('win');
    await new Promise(res => setTimeout(res, 800)); // জ্বলজ্বল করার সময়

    // ২. উধাও (Vanish) শুরু
    vanishWinningCards(winData.win_pos);
    await new Promise(res => setTimeout(res, 500)); // উধাও হওয়ার সময়

    // ৩. ফিলআপ (Fill-up): ফাঁকা জায়গায় নতুন কার্ড বসানো
    if (winData.next_combo) {
        winData.win_pos.forEach(pos => {
            let [r, c] = pos.split(',');
            let reelEl = document.getElementById(`reel-${r}`);
            let card = reelEl.children[c];
            
            if (winData.next_combo[r] && winData.next_combo[r][c]) {
                let newImg = winData.next_combo[r][c].s;
                card.innerHTML = `<img src="${newImg}">`;
                card.classList.remove('explode'); // ঘোলা ভাব সরিয়ে ফেলা
                card.classList.add('cell-new'); // ওপর থেকে পড়ার ইফেক্ট
            }
        });
        playS('stop');
        await new Promise(res => setTimeout(res, 500));
    }

    // ৪. সেশন শেষ (লক খুলে দেওয়া যাতে নেক্সট স্পিন করা যায়)
    isSpinning = false; 
    console.log("উইন এনিমেশন শেষ, নেক্সট স্পিন রেডি!");
}
