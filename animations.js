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
// বিগ উইন ও কয়েন বৃষ্টির মাস্টার ফাংশন
function triggerBigWin(amount) {
    playS('bigwin'); // বিগ উইন সাউন্ড

    // ১. বিগ উইন টেক্সট তৈরি
    let winText = document.createElement('div');
    winText.id = 'big-win-overlay';
    winText.innerHTML = "BIG WIN<br>৳" + amount;
    document.body.appendChild(winText);

    // ২. কয়েন বৃষ্টি শুরু (৫০টি কয়েন)
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            let coin = document.createElement('div');
            coin.className = 'coin';
            coin.style.left = Math.random() * 100 + 'vw';
            coin.style.animationDuration = (Math.random() * 2 + 1) + 's'; // পড়ার গতি আলাদা হবে
            document.body.appendChild(coin);
            
            // ৩ সেকেন্ড পর কয়েনটি রিমুভ করা
            setTimeout(() => coin.remove(), 3000);
        }, i * 100);
    }

    // টেক্সটটি বড় করে দেখানো
    setTimeout(() => winText.style.transform = 'translate(-50%, -50%) scale(1)', 100);

    // ৫ সেকেন্ড পর টেক্সটটি সরিয়ে ফেলা
    setTimeout(() => {
        winText.style.opacity = '0';
        setTimeout(() => winText.remove(), 1000);
    }, 5000);
}
// স্কাটার ট্রিগার এনিমেশন
function triggerScatterDrama(scatterPos) {
    playS('scatter_intro'); // একটি ভয়ানক শুরুর সাউন্ড (যদি থাকে)
    
    // ১. পুরো গেম বোর্ড কাঁপানো শুরু
    document.querySelector('.game-board').classList.add('shake-screen');
    
    // ২. স্কাটার কার্ডগুলোকে লাল করে জ্বালিয়ে দেওয়া
    scatterPos.forEach(pos => {
        let [r, c] = pos.split(',');
        let card = document.getElementById(`reel-${r}`).children[c];
        if (card) card.classList.add('scatter-blast');
    });

    // ৩. ৩ সেকেন্ড পর ড্রামা শেষ করে ফ্রি স্পিন শুরু করা
    setTimeout(() => {
        document.querySelector('.game-board').classList.remove('shake-screen');
        document.querySelectorAll('.scatter-blast').forEach(el => el.classList.remove('scatter-blast'));
        console.log("ভয়ানক ড্রামা শেষ, এবার ফ্রি স্পিন!");
    }, 3000);
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
if (winData.win >= (currentBet * 10)) {
        triggerBigWin(winData.win.toFixed(2));
    }
    // এনিমেশন শেষ, এবার লক খুলে দেওয়া যাতে আবার স্পিন করা যায়
    isSpinning = false; 


    
}


