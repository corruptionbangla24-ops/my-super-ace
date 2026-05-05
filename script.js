// ১. গ্লোবাল ভেরিয়েবল
let queue = [], isSpinning = false, isFreeMode = false, freeSpinCount = 0, currentMultiplier = 1;
let isMuted = false;

// ২. ডাটাবেস থেকে তথ্য লোড করার মাস্টার ফাংশন
async function loadBatch() {
    try {
        // userId index.php থেকে আসছে
        let r = await fetch(`spin_generator.php?uid=${userId}${isFreeMode ? '&mode=free' : ''}`);
        let d = await r.json();
        
        if (d.results) {
            queue = d.results;
            // যদি রীল খালি থাকে তবে প্রথম ডাটা দিয়ে কার্ড সাজাও
            if (document.getElementById('reel-0').innerHTML === "") {
                renderFirstReels(queue[0]);
            }
        }
        
        if (d.balance !== undefined) {
            document.getElementById('balance').innerText = parseFloat(d.balance).toFixed(2);
        }
    } catch (e) {
        console.error("ডাটা লোড হচ্ছে না। চেক করুন spin_generator.php ঠিক আছে কি না।");
    }
}

// ৩. গেম ওপেন হলে প্রথমবার রীল সাজানো
function renderFirstReels(data) {
    if(!data) return;
    data.reels.forEach((col, i) => {
        let el = document.getElementById(`reel-${i}`);
        if(el) {
            el.innerHTML = col.map(c => `
                <div class="cell"><img src="${c.s}"></div>
            `).join('');
        }
    });
}

// ৪. মাল্টিপ্লায়ার আপডেট
function updateMultiplier(level) {
    document.querySelectorAll('.m-bar span').forEach(s => s.classList.remove('active'));
    let el = document.getElementById('m' + level);
    if(el) el.classList.add('active');
}

// ৫. স্পিন বাটন হ্যান্ডেলার
async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;

    if (isFreeMode && freeSpinCount > 0) {
        freeSpinCount--;
        document.getElementById('fs-count').innerText = freeSpinCount;
    }

    let data = queue.shift();
    playS('spin');

    // রীল এনিমেশন
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

    setTimeout(() => {
        isSpinning = false;
        if (data.win > 0) {
            document.getElementById('win-amount').innerText = parseFloat(data.win).toFixed(2);
            playS('win');
        }

        // অটো-প্লে ফ্রি স্পিন
        if (isFreeMode && freeSpinCount > 0) {
            setTimeout(handleSpin, 1500);
        } else if (isFreeMode && freeSpinCount === 0) {
            isFreeMode = false;
            document.getElementById('fs-info').style.display = 'none';
            updateMultiplier(1);
        }

        if (queue.length < 5) loadBatch();
    }, 800);
}

// ৬. সাউন্ড কন্ট্রোল
document.getElementById('sound-toggle').onclick = function() {
    isMuted = !isMuted;
    this.innerText = isMuted ? "Sound: OFF" : "Sound: ON";
    this.style.color = isMuted ? "#888" : "gold";
};

// বাটন কানেক্ট এবং গেম স্টার্ট
document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();
