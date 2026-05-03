let queue = [];
let isSpinning = false, isTurbo = false;

async function loadBatch() {
    let r = await fetch(`spin_generator.php?uid=${userId}`);
    let d = await r.json();
    queue = d.results;
}

document.getElementById('spin').onclick = async () => {
    if (isSpinning) return;
    if (queue.length === 0) await loadBatch();
    
    isSpinning = true;
    let data = queue.shift();
    let reels = document.querySelectorAll('.reel');
    
    reels.forEach(r => r.classList.add('blur'));
    
       setTimeout(() => {
        // ১. রীল রেন্ডার করা এবং প্রতিটি সেলে আইডি দেওয়া
        data.reels.forEach((col, i) => {
            let el = document.getElementById(`reel-${i}`);
            el.innerHTML = col.map((c, idx) => `
                <div class="cell ${c.g ? 'golden' : ''}" id="c-${i}-${idx}">
                    <img src="${c.s}">
                </div>
            `).join('');
        });

                // ২. সঠিক উইনিং পজিশন হাইলাইট এবং ভ্যানিশ করা
        if (data.win_pos && data.win_pos.length > 0) {
            data.win_pos.forEach(pos => {
                let col = pos[0]; // কলাম
                let row = pos[1]; // রো
                let cell = document.getElementById(`c-${col}-${row}`);
                
                if (cell) {
                    cell.classList.add('win-highlight');
                    
                    // ০.৫ সেকেন্ড পর কার্ডটি উধাও হবে
                    setTimeout(() => {
                        cell.style.transition = "all 0.3s ease";
                        cell.style.transform = "scale(0)";
                        cell.style.opacity = "0";
                    }, 500);
                }
            });
        }


        reels.forEach(r => r.classList.remove('blur'));
        document.getElementById('bal').innerText = data.bal;
        document.getElementById('win').innerText = data.win;
        isSpinning = false;
        
        if (queue.length < 5) loadBatch();
    }, isTurbo ? 50 : 600);
 
};

document.getElementById('turbo').onclick = function() {
    isTurbo = !isTurbo;
    this.innerText = isTurbo ? "TURBO ON" : "TURBO OFF";
    this.style.background = isTurbo ? "green" : "#333";
};

loadBatch();
