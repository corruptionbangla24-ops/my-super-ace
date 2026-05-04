let queue = [], isSpinning = false;
async function loadBatch() {
    let r = await fetch(`spin_generator.php?uid=${userId}`);
    let d = await r.json();
    queue = d.results;
    document.getElementById('bal-val').innerText = queue[0].bal;
}
async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true; playS('click'); playS('spin');
    let data = queue.shift();
    document.querySelectorAll('.reel').forEach(r => r.classList.add('reel-spinning'));
    setTimeout(async () => {
        data.reels.forEach((col, i) => {
            let el = document.getElementById(`reel-${i}`);
            el.classList.remove('reel-spinning');
           el.innerHTML = col.map((c, j) => `<div class="cell ${c.g?'golden':'' } cell-fall" id="c-${i}-${j}" style="animation-delay: ${j * 0.05}s"><img src="${c.s}"></div>`).join('');
 
        });
        playS('stop');
        if (data.win_pos.length > 0) {
            await new Promise(r => setTimeout(r, 500));
                        // ২৩ নম্বর লাইনের জায়গায় এটি বসান
            data.win_pos.forEach(p => {
                let cell = document.getElementById(`c-${p.c}-${p.r}`);
                if (cell) {
                    cell.classList.remove('golden');
                    cell.classList.add('win-highlight');
                }
            });
            playS('win');

            await new Promise(r => setTimeout(r, 800));

            // কার্ড ভ্যানিশ করা (ছোট হয়ে উধাও হবে)
            data.win_pos.forEach(p => {
    let cell = document.getElementById(`c-${p.c}-${p.r}`);
    if (cell) {
        // যদি এটি গোল্ডেন কার্ড হয়, তবেই Wild আসবে
        let isGolden = cell.classList.contains('golden');
        
        cell.style.transition = "all 0.4s ease";
        cell.style.transform = "scale(0)";
        cell.style.opacity = "0";
            if (isGolden) {
                setTimeout(() => {
                    let wildCard = document.createElement('div');
                    // এটি আপনার সেই ধামাকা লাল বিস্ফোরণ ইফেক্ট দিবে
                    wildCard.className = 'cell wild-explosion cell-fall'; 
                    wildCard.id = `c-${p.c}-${p.r}`; 
                    wildCard.innerHTML = `<img src="wild.png">`;
                    
                    // যে কার্ডটি ভ্যানিশ হয়েছে ঠিক তার জায়গায় Wild বসানো
                    cell.parentElement.appendChild(wildCard);
                    
                    // সাউন্ড প্লে করা
                    playS('wild'); 
                }, 350); 
            }
    }
});


            await new Promise(r => setTimeout(r, 400));

            // ওপর থেকে নতুন কার্ড ফেলে গ্যাপ পূরণ করা
            playS('drop'); 
            for (let i = 0; i < 5; i++) {
                let reel = document.getElementById(`reel-${i}`);
                let cells = Array.from(reel.querySelectorAll('.cell'));
                cells.forEach(c => { if (c.style.opacity === "0") c.remove(); });

                let missing = 4 - reel.querySelectorAll('.cell').length;
                for (let n = 0; n < missing; n++) {
                    let newImg = Math.floor(Math.random() * 10 + 1) + ".png";
                    let newCard = document.createElement('div');
                    newCard.className = 'cell cell-fall';
                    newCard.innerHTML = `<img src="${newImg}">`;
                    reel.prepend(newCard); 
                }
            }

        }
        document.getElementById('bal-val').innerText = data.bal;
        document.getElementById('win-amount').innerText = data.win;
        isSpinning = false;
        if (queue.length < 5) loadBatch();
    }, 800);
}
document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();
