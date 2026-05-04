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
    
    // রীল ঘোরার এনিমেশন শুরু
    document.querySelectorAll('.reel').forEach(r => r.classList.add('reel-spinning'));

    let delay = isTurbo ? 100 : 800;

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
        
        playS('stop');

        // ৪. উইন চেক এবং এনিমেশন
        if (data.win_pos && data.win_pos.length > 0) {
            await new Promise(r => setTimeout(r, 500));
            
            // হাইলাইট করা
            data.win_pos.forEach(p => {
                let cell = document.getElementById(`c-${p.c}-${p.r}`);
                if (cell) cell.classList.add('win-highlight');
            });
            playS('win');
            
            await new Promise(r => setTimeout(r, 1000));
            
            // ৫. কার্ড উধাও হওয়া (ভ্যানিশ) এবং Wild তৈরি
            data.win_pos.forEach(p => {
                let cell = document.getElementById(`c-${p.c}-${p.r}`);
                if (cell) {
                    let isGolden = cell.classList.contains('golden');
                    cell.style.transition = "all 0.4s ease";
                    cell.style.transform = "scale(0)";
                    cell.style.opacity = "0";

                    if (isGolden) {
                        setTimeout(() => {
                            let wild = document.createElement('div');
                            wild.className = 'cell wild-explosion cell-fall';
                            wild.innerHTML = '<img src="wild.png">';
                            cell.parentElement.appendChild(wild);
                            playS('wild');
                        }, 350);
                    }
                }
            });

            // ৬. খালি জায়গা ফিলআপ করা
            setTimeout(() => {
                processCascade();
            }, 500);
        }

        // ব্যালেন্স আপডেট
        document.getElementById('bal-val').innerText = data.bal;
        document.getElementById('win-amount').innerText = data.win;
        
        isSpinning = false;
        if (queue.length < 5) loadBatch();
        
    }, delay);
}

// ৭. কার্ড নিচে নামার লজিক (ফিলআপ)
function processCascade() {
    for (let i = 0; i < 5; i++) {
        let reel = document.getElementById(`reel-${i}`);
        let cells = Array.from(reel.querySelectorAll('.cell'));

        cells.forEach(c => {
            if (c.style.opacity === "0" || c.style.transform === "scale(0)") {
                c.remove();
            }
        });

        let missing = 4 - reel.querySelectorAll('.cell').length;
        for (let n = 0; n < missing; n++) {
            let newImg = Math.floor(Math.random() * 10 + 1) + ".png";
            let newCard = document.createElement('div');
            newCard.className = 'cell cell-fall';
            newCard.innerHTML = `<img src="${newImg}">`;
            reel.prepend(newCard);
        }
    }
    playS('drop');
}

// বাটন কানেক্ট করা
document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();
