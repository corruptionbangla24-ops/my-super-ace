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
    
    // রীল রেন্ডার
    data.reels.forEach((col, i) => {
        let el = document.getElementById(`reel-${i}`);
        el.innerHTML = col.map((c, j) => `<div class="cell ${c.g?'golden':''}" id="c-${i}-${j}"><img src="${c.s}"></div>`).join('');
    });

    if (data.win_pos.length > 0) {
        // ১. হাইলাইট
        data.win_pos.forEach(p => document.getElementById(`c-${p.c}-${p.r}`)?.classList.add('win-highlight'));
        
        await new Promise(r => setTimeout(r, 600));

        // ২. ভ্যানিশ ও গ্র্যাভিটি (Gravity Logic)
        data.win_pos.forEach(p => {
            let cell = document.getElementById(`c-${p.c}-${p.r}`);
            if (cell) cell.style.transform = "scale(0)";
        });

        await new Promise(r => setTimeout(r, 400));
        
        // ৩. রিফিল (উপরের কার্ড নিচে নামা)
        data.win_pos.forEach(p => document.getElementById(`c-${p.c}-${p.r}`)?.remove());
        // এখানে নতুন কার্ড যোগ করার লজিক...
    }

    document.getElementById('bal-val').innerText = data.bal;
    document.getElementById('win-amount').innerText = data.win;
    isSpinning = false;
    if (queue.length < 5) loadBatch();
}

document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();
