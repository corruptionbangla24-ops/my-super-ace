let queue = [], isSpinning = false, isTurbo = false;

// ১. সার্ভার থেকে ৫০টি স্পিন লোড করা
async function loadBatch() {
    try {
        let r = await fetch(`spin_generator.php?uid=${userId}`);
        let d = await r.json();
        if (d.results) {
            queue = d.results;
        }
    } catch (e) {
        console.error("Batch load failed", e);
    }
}

// ২. স্পিন ফাংশন
async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;
    
    let data = queue.shift();
    
    // রীল ঘোরার এনিমেশন শুরু
    document.querySelectorAll('.reel').forEach(r => r.classList.add('reel-spinning'));

    let delay = isTurbo ? 50 : 800;

    setTimeout(async () => {
        // ৩. রীল রেন্ডার করা
        data.reels.forEach((col, i) => {
            let el = document.getElementById(`reel-${i}`);
            el.classList.remove('reel-spinning');
            el.innerHTML = col.map((c, j) => `
                <div class="cell ${c.g ? 'golden' : ''} cell-fall" id="c-${i}-${j}" style="animation-delay: ${j * 0.05}s">
                    <img src="${c.s}">
                </div>
            `).join('');
        });

        // ৪. উইন চেক এবং হাইলাইট
        if (data.win_pos && data.win_pos.length > 0) {
            await new Promise(r => setTimeout(r, isTurbo ? 200 : 500));
            
            data.win_pos.forEach(p => {
                let cell = document.getElementById(`c-${p.c}-${p.r}`);
                if (cell) {
                    cell.classList.remove('golden');
                    cell.classList.add('win-highlight');
                }
            });

            // ভ্যানিশ এনিমেশন
            await new Promise(r => setTimeout(r, isTurbo ? 400 : 800));
            
            data.win_pos.forEach(p => {
                let cell = document.getElementById(`c-${p.c}-${p.r}`);
                if (cell) {
                    cell.style.transform = "scale(0)";
                    cell.style.opacity = "0";
                }
            });

            // ওপর থেকে কার্ড নিচে ফেলার লজিক
            setTimeout(() => {
                processCascade();
            }, 300);
        }

        // ব্যালেন্স আপডেট
        document.getElementById('bal-val').innerText = data.bal;
        document.getElementById('win-amount').innerText = data.win;
        
        isSpinning = false;
        
        // কিউতে কার্ড কমে গেলে আবার নতুন করে আনা
        if (queue.length < 5) loadBatch();
        
    }, delay);
}

// ৫. কার্ড নিচে নামার লজিক
function processCascade() {
    for (let i = 0; i < 5; i++) {
        let reel = document.getElementById(`reel-${i}`);
        let cells = Array.from(reel.querySelectorAll('.cell'));
        cells.forEach(c => { if (c.style.opacity === "0") c.remove(); });

        let missing = 4 - reel.querySelectorAll('.cell').length;
        for (let n = 0; n < missing; n++) {
            let newCard = document.createElement('div');
            newCard.className = 'cell cell-fall';
            if(Math.random() < 0.1) newCard.classList.add('golden');
            newCard.innerHTML = `<img src="${Math.floor(Math.random()*10)+1}.png">`;
            reel.prepend(newCard);
        }
    }
}

// ৬. বাটন কানেকশন (এটি সবচেয়ে জরুরি)
document.getElementById('spin-btn').onclick = () => {
    handleSpin();
};

// গেম শুরুতেই ডাটা লোড করা
loadBatch();
