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
