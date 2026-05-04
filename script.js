let queue = [], isSpinning = false, isTurbo = false;

async function loadBatch() {
    let r = await fetch(`spin_generator.php?uid=${userId}`);
    let d = await r.json();
    queue = d.results;
}

async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;
    
    playS('click');
    playS('spin');
    
    let data = queue.shift();
    document.querySelectorAll('.reel').forEach(r => r.classList.add('reel-spinning'));

    // টার্বো মোড অনুযায়ী স্পিন টাইম সেট করা
    let delay = isTurbo ? 100 : 800;

    setTimeout(async () => {
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

        if (data.win_pos && data.win_pos.length > 0) {
            // হাইলাইট ডিলে টার্বো অনুযায়ী অ্যাডজাস্ট করা
            let highlightDelay = isTurbo ? 200 : 500;
            
            await new Promise(r => setTimeout(r, highlightDelay));
            
            data.win_pos.forEach(p => {
                let cell = document.getElementById(`c-${p.c}-${p.r}`);
                if (cell) {
                    cell.classList.remove('golden');
                    cell.classList.add('win-highlight');
                }
            });
            playS('win');

            // ভ্যানিশ এনিমেশন
            await new Promise(r => setTimeout(r, isTurbo ? 400 : 800));
            
            data.win_pos.forEach(p => {
                let cell = document.getElementById(`c-${p.c}-${p.r}`);
                if (cell) {
                    cell.style.transform = "scale(0)";
                    cell.style.opacity = "0";
                }
            });

            setTimeout(() => {
                playS('drop');
                processCascade();
            }, 300);
        }

        if (parseFloat(data.win) > 0) playS('calculation');
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
        cells.forEach(c => { if (c.style.opacity === "0") c.remove(); });

        let missing = 4 - reel.querySelectorAll('.cell').length;
        for (let n = 0; n < missing; n++) {
            let newCard = document.createElement('div');
            newCard.className = 'cell cell-fall';
            // গোল্ডেন কার্ডের চান্সও এখানে রাখা হয়েছে (১০%)
            if(Math.random() < 0.1) newCard.classList.add('golden');
            newCard.innerHTML = `<img src="${Math.floor(Math.random()*10)+1}.png">`;
            reel.prepend(newCard);
        }
    }
}
// ১. নিশ্চিত করুন বাটন আইডি আপনার index.php এর সাথে মিলছে
document.getElementById('spin-btn').onclick = function() {
    handleSpin();
};


if (spinBtn) {
    spinBtn.onclick = () => {
        console.log("Spin Clicked!"); // চেক করার জন্য
        handleSpin();
    };
}

// ২. শুরুতে ডাটা লোড করা
window.onload = () => {
    loadBatch();
};


