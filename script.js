let queue = [], isSpinning = false, isTurbo = false;

// ১. ডাটা লোড করা
async function loadBatch() {
    try {
        let r = await fetch(`spin_generator.php?uid=${userId}`);
        let d = await r.json();
        queue = d.results;
    } catch (e) { console.log("Load error:", e); }
}

// ২. মেইন স্পিন ফাংশন
async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;
    
    playS('click');
    playS('spin');
    
    let data = queue.shift();
    document.querySelectorAll('.reel').forEach(r => r.classList.add('reel-spinning'));

    let delay = isTurbo ? 100 : 800;

    setTimeout(async () => {
        // রীল রেন্ডার এবং ওয়াইল্ড চেক
        data.reels.forEach((col, i) => {
            let el = document.getElementById(`reel-${i}`);
            el.classList.remove('reel-spinning');
            el.innerHTML = col.map((c, j) => {
                let isWild = (c.s === 'wild.png');
                return `<div class="cell ${c.g ? 'golden' : ''} ${isWild ? 'wild-explosion' : ''} cell-fall" id="c-${i}-${j}" style="animation-delay: ${j * 0.05}s">
                            <img src="${c.s}">
                        </div>`;
            }).join('');
        });
        
        playS('stop');

        // উইন এবং ক্যাসকেড লজিক
        if (data.win_pos && data.win_pos.length > 0) {
            await new Promise(r => setTimeout(r, 500));
            data.win_pos.forEach(p => {
                let cell = document.getElementById(`c-${p.c}-${p.r}`);
                if (cell) cell.classList.add('win-highlight');
            });
            playS('win');
            
            await new Promise(r => setTimeout(r, 1000));
            // কার্ড উধাও হওয়া এবং ড্রপ সাউন্ড
            playS('drop');
            processCascade(data.win_pos);
        }

        document.getElementById('bal-val').innerText = data.bal;
        document.getElementById('win-amount').innerText = data.win;
        
        isSpinning = false;
        if (queue.length < 5) loadBatch();
        
    }, delay);
}
function processCascade() {
    for (let i = 0; i < 5; i++) {
        let reel = document.getElementById(`reel-${i}`);
        let cells = Array.from(reel.querySelectorAll('.cell'));

        // ১. উধাও হওয়া কার্ডগুলো রিমুভ করা
        cells.forEach(c => {
            if (c.style.opacity === "0" || c.style.transform === "scale(0)") {
                c.remove();
            }
        });

        // ২. খালি জায়গা হিসেব করে নতুন কার্ড যোগ করা
        let remaining = reel.querySelectorAll('.cell').length;
        let missing = 4 - remaining;

        for (let n = 0; n < missing; n++) {
            let newImg = Math.floor(Math.random() * 10 + 1) + ".png";
            let newCard = document.createElement('div');
            newCard.className = 'cell cell-fall'; 
            newCard.innerHTML = `<img src="${newImg}">`;
            
            // রীলের শুরুতে (উপরে) নতুন কার্ডটি ঢুকানো
            reel.prepend(newCard); 
        }
    }
    // কার্ড পড়ার সাউন্ড
    playS('drop');
}

// বাটন কানেক্ট করা
document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();
