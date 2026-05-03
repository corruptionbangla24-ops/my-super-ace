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
        data.reels.forEach((col, i) => {
            let el = document.getElementById(`reel-${i}`);
            el.innerHTML = col.map(c => `<div class="cell ${c.g?'golden':''}"><img src="${c.s}"></div>`).join('');
        });
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
