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
            data.win_pos.forEach(p => document.getElementById(`c-${p.c}-${p.r}`)?.classList.add('win-highlight'));
            playS('win');
            await new Promise(r => setTimeout(r, 1000));
            playS('drop');
            // Cascade লজিক এখানে কল হবে
        }
        document.getElementById('bal-val').innerText = data.bal;
        document.getElementById('win-amount').innerText = data.win;
        isSpinning = false;
        if (queue.length < 5) loadBatch();
    }, 800);
}
document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();
