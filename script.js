// ১. গ্লোবাল ভেরিয়েবল সেটআপ
let queue = [], isSpinning = false, isFreeMode = false, freeSpinCount = 0, currentMultiplier = 1;
let isMuted = false;

// ২. ডাটাবেস থেকে ডাটা এবং ব্যালেন্স লোড করা
async function loadBatch() {
    try {
        let r = await fetch(`spin_generator.php?uid=${userId}${isFreeMode ? '&mode=free' : ''}`);
        let d = await r.json();
        
        if (d.results) queue = d.results;
        
        // ব্যালেন্স স্ক্রিনে দেখানো
        if (d.balance !== undefined) {
            document.getElementById('balance').innerText = parseFloat(d.balance).toFixed(2);
        }
    } catch (e) {
        console.error("API Error: ডাটা লোড হতে সমস্যা হচ্ছে।");
    }
}

// ৩. মাল্টিপ্লায়ার হাইলাইট করা
function updateMultiplier(level) {
    document.querySelectorAll('.m-bar span').forEach(s => s.classList.remove('active'));
    let el = document.getElementById('m' + level);
    if(el) el.classList.add('active');
}

// ৪. স্পিন হ্যান্ডেল করার মাস্টার ফাংশন
async function handleSpin() {
    // যদি স্পিন চলতে থাকে বা ডাটা না থাকে তবে থামাও
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;

    // ফ্রি স্পিন মোডে থাকলে কাউন্ট কমানো
    if (isFreeMode && freeSpinCount > 0) {
        freeSpinCount--;
        document.getElementById('fs-count').innerText = freeSpinCount;
    }

    let data = queue.shift();
    playS('spin'); // স্পিন সাউন্ড

    // রীলগুলোতে কার্ড সাজানো (ওপর থেকে নিচে পড়ার এনিমেশনসহ)
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

    // কার্ড পড়া শেষ হওয়ার পর রেজাল্ট প্রসেসিং
    setTimeout(() => {
        isSpinning = false;

        // উইন চেক করা
        if (data.win > 0) {
            document.getElementById('win-amount').innerText = parseFloat(data.win).toFixed(2);
            playS('win'); // উইন সাউন্ড
            
            // মাল্টিপ্লায়ার আপডেট লজিক
            currentMultiplier = isFreeMode ? 2 : 1; 
            updateMultiplier(currentMultiplier);
        }

        // ফ্রি স্পিন অটো-লুপ লজিক
        if (isFreeMode && freeSpinCount > 0) {
            setTimeout(handleSpin, 1500); // ১.৫ সেকেন্ড পর পর অটো স্পিন
        } else if (isFreeMode && freeSpinCount === 0) {
            isFreeMode = false;
            document.getElementById('fs-info').style.display = 'none';
            alert("🎰 অভিনন্দন! ফ্রি স্পিন শেষ হয়েছে। 🎰");
            updateMultiplier(1);
        }

        // কিউতে ডাটা কমে গেলে আবার লোড করা
        if (queue.length < 5) loadBatch();
    }, 800);
}

// ৫. সাউন্ড বাটন কন্ট্রোল
document.getElementById('sound-toggle').onclick = function() {
    isMuted = !isMuted;
    this.innerText = isMuted ? "Sound: OFF" : "Sound: ON";
    this.style.color = isMuted ? "#888" : "gold";
};

// ৬. বাটন কানেক্ট এবং গেম শুরু
document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();
