// ১. কার্ড নীল বর্ডারে উজ্জ্বল করার ফাংশন
function highlightWinningCards(winPos) {
    if (!winPos || winPos.length === 0) return;

    winPos.forEach(pos => {
        let [r, c] = pos.split(','); // রীল এবং সারির পজিশন (যেমন "0,1")
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl && reelEl.children[c]) {
            let card = reelEl.children[c];
            card.classList.add('win-highlight'); // নীল হাইলাইট ক্লাস যোগ
            console.log("হাইলাইট করা হলো পজিশন:", r, c);
        }
    });
}


async function processWinChain(winData) {
    if (!winData || !winData.win_pos) return;

    // আমরা যে ফাংশনটি বানালাম সেটি ডাকলাম
    highlightWinningCards(winData.win_pos);
    playS('win');

    // ১ সেকেন্ড পর যেন পরের কাজ শুরু হয়
    await new Promise(res => setTimeout(res, 1000));
}
