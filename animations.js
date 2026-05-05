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
// ২. কার্ড উধাও (Vanish) করার ফাংশন
function vanishWinningCards(winPos) {
    if (!winPos) return;
    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl && reelEl.children[c]) {
            let card = reelEl.children[c];
            card.classList.remove('win-highlight'); // নীল বর্ডার সরানো
            card.classList.add('explode'); // ভ্যানিশ ইফেক্ট
        }
    });
}

// ৩. নতুন কার্ড দিয়ে ফিলআপ (Fill-up) করার ফাংশন
function fillUpNewCards(winPos, nextCombo) {
    if (!winPos) return;
    winPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let reelEl = document.getElementById(`reel-${r}`);
        if (reelEl && reelEl.children[c]) {
            let card = reelEl.children[c];
            if (nextCombo && nextCombo[r] && nextCombo[r][c]) {
                card.innerHTML = `<img src="${nextCombo[r][c].s}">`; // নতুন ছবি
                card.classList.remove('explode');
                card.classList.add('cell-new'); // ওপর থেকে পড়ার এনিমেশন
            }
        }
    });
    playS('stop'); // কার্ড পড়ার শব্দ
}


async function processWinChain(winData) {
    if (!winData || !winData.win_pos) return;

    // আমরা যে ফাংশনটি বানালাম সেটি ডাকলাম
    highlightWinningCards(winData.win_pos);
    playS('win');

    // ১ সেকেন্ড পর যেন পরের কাজ শুরু হয়
    await new Promise(res => setTimeout(res, 1000));
    // ২৫ নম্বর লাইনের ঠিক নিচে এটি বসবে
    // ৩. কার্ড উধাও (Vanish) শুরু
    vanishWinningCards(winData.win_pos);
    await new Promise(res => setTimeout(res, 500));

    // ৪. নতুন কার্ড দিয়ে ফিলআপ (Fill-up)
    fillUpNewCards(winData.win_pos, winData.next_combo);
    await new Promise(res => setTimeout(res, 500));

    // এনিমেশন শেষ, এবার লক খুলে দেওয়া যাতে আবার স্পিন করা যায়
    isSpinning = false; 


    
}


