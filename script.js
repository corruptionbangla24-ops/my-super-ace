let queue = [], isSpinning = false, isFreeMode = false, freeSpinCount = 0;
let isMuted = false;
// ১ ও ২ নম্বর লাইনের ঠিক নিচে এটি বসান
let currentBet = 10, isTurbo = false, isAuto = false;


async function loadBatch() {
    try {
        let url = `spin_generator.php?uid=${userId}${isFreeMode ? '&mode=free' : ''}`;
        let r = await fetch(url);
        let d = await r.json();
        if (d.results) {
            queue = d.results;
            if (document.getElementById('reel-0').innerHTML === "") renderReels(queue[0]);
        }
        if (d.balance !== undefined) document.getElementById('balance').innerText = parseFloat(d.balance).toFixed(2);
    } catch (e) { console.error("Data Load Error"); }
}

function renderReels(data) {
    data.reels.forEach((col, i) => {
        let el = document.getElementById(`reel-${i}`);
        if(el) el.innerHTML = col.map(c => `<div class="cell"><img src="${c.s}"></div>`).join('');
    });
}

async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;
    if (isFreeMode && freeSpinCount > 0) {
        freeSpinCount--;
        document.getElementById('fs-count').innerText = freeSpinCount;
    }

    let data = queue.shift();
    playS('spin');

    data.reels.forEach((col, i) => {
        let el = document.getElementById(`reel-${i}`);
        if(el) {
            el.innerHTML = col.map((c, j) => `
                <div class="cell cell-fall" style="animation-delay: ${j*0.05}s">
                    <img src="${c.s}">
                </div>
            `).join('');
        }
    });

    // ৪৯ নম্বর লাইনে এটি লিখুন
setTimeout(async () => {
        // ৫০ থেকে ৫৬ নম্বর লাইনের জায়গায় এটি বসবে
        playS('stop');
        
        if (data.win > 0) {
            // চেইন উইন শুরু হবে (কার্ড ফাটবে ও নতুন কার্ড আসবে)
            await processWinChain(data); 
        } else {
            // যদি কোনো উইন না থাকে, তবেই স্পিন শেষ হবে
            isSpinning = false; 
        }

        
		        // ৫৬ নম্বর লাইনের নিচে এটি পেস্ট করুন
        if (data.free_spins > 0 && !isFreeMode) {
            isFreeMode = true;
            freeSpinCount = data.free_spins; // ২০টি ফ্রি স্পিন সেট হবে
            document.getElementById('fs-info').style.display = 'block';
            document.getElementById('fs-count').innerText = freeSpinCount;
            playS('scatter');
        }

        if (isFreeMode && freeSpinCount > 0) {
            setTimeout(handleSpin, isTurbo ? 800 : 1500); 
        } else if (isFreeMode && freeSpinCount === 0) {
            isFreeMode = false;
            document.getElementById('fs-info').style.display = 'none';
        }

        if (queue.length < 5) loadBatch();
    }, 800);
}


// ১. বেট কন্ট্রোল লজিক
function changeBet(amount) {
    if (isSpinning) return;
    let newBet = currentBet + amount;
    if (newBet >= 10 && newBet <= 500) {
        currentBet = newBet;
        document.getElementById('current-bet').innerText = currentBet.toFixed(2);
        playS('click');
        queue = []; 
        loadBatch();
    }
}

// ২. টার্বো ও অটো মোড হ্যান্ডেলার
document.getElementById('turbo-btn').onclick = function() {
    isTurbo = !isTurbo;
    this.classList.toggle('active');
    this.innerText = isTurbo ? "TURBO: ON" : "TURBO: OFF";
};

document.getElementById('auto-btn').onclick = function() {
    isAuto = !isAuto;
    this.classList.toggle('active');
    this.innerText = isAuto ? "AUTO: ON" : "AUTO: OFF";
    if (isAuto) startAutoCycle();
};

function startAutoCycle() {
    if (isAuto && !isSpinning) handleSpin();
    setTimeout(() => { if (isAuto) startAutoCycle(); }, isTurbo ? 1000 : 2500);
}
// বিগ উইন (Big Win) ফাংশন
function showBigWin(amount) {
    let winDiv = document.createElement('div');
    winDiv.style = "position:fixed; top:40%; left:50%; transform:translate(-50%,-50%); color:gold; font-size:50px; font-weight:bold; text-shadow:0 0 20px red; z-index:1000; text-align:center;";
    winDiv.innerHTML = "BIG WIN<br>৳" + amount;
    document.body.appendChild(winDiv);
    playS('bigwin');
    setTimeout(() => winDiv.remove(), 4000);
}
// ৩. মেইন বাটন কানেকশন ও ডাটা লোড
document.getElementById('sound-toggle').onclick = function() {
    isMuted = !isMuted;
    this.innerText = isMuted ? "Sound: OFF" : "Sound: ON";
};

document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();
async function processWinChain(winData) {
    if (!winData || winData.win <= 0) {
        isSpinning = false;
        return;
    }

    playS('win');
	

    // বর্ডার জ্বলজ্বল করার জন্য ১ সেকেন্ড সময় দিন (যাতে আপনার চোখে পড়ে)
    await new Promise(res => setTimeout(res, 1000));

    // এবার উধাও করার কাজ শুরু
    if (winData.win_pos) {
        winData.win_pos.forEach(pos => {
            let [r, c] = pos.split(',');
            let card = document.getElementById(`reel-${r}`).children[c];
            if (card) {
                card.classList.add('explode'); // ভ্যানিশ ইফেক্ট
            }
        });
    }


    // কার্ড উজ্জ্বল হয়ে থাকার জন্য ৬০০ মিলিসেকেন্ড সময় দিন
    await new Promise(res => setTimeout(res, 600));

    // এবার উজ্জ্বলতা সরিয়ে উধাও (Vanish) করার ফাংশন
    if (winData.win_pos) {
        winData.win_pos.forEach(pos => {
            let [r, c] = pos.split(',');
            let card = document.getElementById(`reel-${r}`).children[c];
            if (card) {
                card.classList.remove('win-highlight');
                card.classList.add('explode'); // ভ্যানিশ ইফেক্ট যোগ
            }
        });
    }



    // ৩. উইন অ্যামাউন্ট আপডেট
    document.getElementById('win-amount').innerText = parseFloat(winData.win).toFixed(2);

    // ৪. লুপ: যদি আরও উইন থাকে (চেইন রিঅ্যাকশন)
    if (winData.has_next_win && winData.next_data) {
        await new Promise(res => setTimeout(res, 800));
        await processWinChain(winData.next_data); // আবার নিজেকে কল করবে
    } else {
        isSpinning = false; // সব উইন শেষ হলে তবেই লক খুলবে
    }
}

