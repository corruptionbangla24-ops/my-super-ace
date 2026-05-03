let queue = [], isSpinning = false, isTurbo = false;

async function loadBatch() {
    let r = await fetch(`spin_generator.php?uid=${userId}`);
    let d = await r.json();
    queue = d.results;
}

async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;
    let data = queue.shift();
    
    // ১. রীল রেন্ডার করা
    data.reels.forEach((col, i) => {
        let el = document.getElementById(`reel-${i}`);
        el.innerHTML = col.map((c, j) => `<div class="cell ${c.g?'golden':''}" id="c-${i}-${j}"><img src="${c.s}"></div>`).join('');
    });

    // ২. উইনিং কার্ড হাইলাইট এবং প্রসেসিং
    if (data.win_pos && data.win_pos.length > 0) {
        // হাইলাইট করা
        data.win_pos.forEach(p => {
            document.getElementById(`c-${p.c}-${p.r}`)?.classList.add('win-highlight');
        });
        
        await new Promise(r => setTimeout(r, 600)); // হাইলাইট দেখার সময়

        // ৩. ভ্যানিশ এনিমেশন
        data.win_pos.forEach(p => {
            let cell = document.getElementById(`c-${p.c}-${p.r}`);
            if (cell) {
                cell.style.transform = "scale(0)";
                cell.style.opacity = "0";
            }
        });

        await new Promise(r => setTimeout(r, 400));

        // ৪. কার্ড রিমুভ এবং ওপর থেকে নতুন কার্ড ফেলার আসল ম্যাজিক (Refill)
        data.win_pos.forEach(p => document.getElementById(`c-${p.c}-${p.r}`)?.remove());

        // প্রতি রীলে ফাঁকা জায়গা পূরণ করা
        for (let i = 0; i < 5; i++) {
            let reel = document.getElementById(`reel-${i}`);
            let currentCells = reel.querySelectorAll('.cell');
            let missing = 4 - currentCells.length;

            for (let m = 0; m < missing; m++) {
                let newSymbol = Math.floor(Math.random() * 10) + 1 + ".png";
                let newCard = document.createElement('div');
                newCard.className = 'cell'; // এখানে গোল্ডেন লজিক পরে যোগ করা যাবে
                newCard.style.opacity = "0";
                newCard.style.transform = "translateY(-100px)"; // উপর থেকে পড়ার ইফেক্ট
                newCard.innerHTML = `<img src="${newSymbol}">`;
                
                reel.prepend(newCard); // রীলের একদম উপরে যোগ হবে

                // পড়ার এনিমেশন
                setTimeout(() => {
                    newCard.style.transition = "all 0.4s ease-out";
                    newCard.style.opacity = "1";
                    newCard.style.transform = "translateY(0)";
                }, 10);
            }
        }
    }

    // ৫. ব্যালেন্স এবং উইন আপডেট
    document.getElementById('bal-val').innerText = data.bal;
    document.getElementById('win-amount').innerText = data.win;
    
    isSpinning = false;
    if (queue.length < 5) loadBatch();
}
// ৭৫ নম্বর লাইনের নিচে এটি বসান
document.getElementById('spin-btn').onclick = handleSpin;

// প্রথমবার গেম লোড হলে ডাটা আনা শুরু করবে
loadBatch();
