// ১. কার্ড নীল বর্ডারে উজ্জ্বল করার ফাংশন
function highlightWinningCards(winPos) {
    if (!winPos) return;
    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl) {
            let card = reelEl.children[c];
            if (card) {
                card.classList.add('win-highlight'); // নীল আভা
            }
        }
    });
}

// ২. কার্ড উধাও (Vanish) করার ফাংশন
function vanishWinningCards(winPos) {
    if (!winPos) return;
    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl) {
            let card = reelEl.children[c];
            if (card) {
                card.classList.remove('win-highlight');
                card.classList.add('explode'); // ভ্যানিশ ইফেক্ট
            }
        }
    });
}

// ৩. মাস্টার এনিমেশন চেইন (এটিই script.js থেকে কল হবে)
async function processWinChain(winData) {
    if (!winData || !winData.win_pos) return;

    // নীল বর্ডার হাইলাইট শুরু
    highlightWinningCards(winData.win_pos);
    playS('win');

    // ১ সেকেন্ড উজ্জ্বল হয়ে থাকবে
    await new Promise(res => setTimeout(res, 1000));

    // এবার উধাও হবে
    vanishWinningCards(winData.win_pos);

    // উধাও হওয়ার জন্য আধা সেকেন্ড সময়
    await new Promise(res => setTimeout(res, 500));
}
