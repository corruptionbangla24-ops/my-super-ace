const images = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
const symbolValues = {'1.png':15, '2.png':12, '3.png':10, '4.png':8, '5.png':5, '6.png':3, '7.png':2, '8.png':1.5, '9.png':1, '10.png':0.5};

const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3'), document.getElementById('r4'), document.getElementById('r5')];
let balance = 1000, currentBet = 10.00, isSpinning = false, isTurbo = false, isAuto = false;

function init() {
    reels.forEach(reel => {
        reel.innerHTML = '';
        for(let i=0; i<4; i++) {
            const randomImg = images[Math.floor(Math.random() * images.length)];
            const div = document.createElement('div');
            div.className = 'slot-cell';
            div.innerHTML = `<img src="${randomImg}">`;
            reel.appendChild(div);
        }
    });
    updateUI();
}

async function startSpin() {
    if (isSpinning || balance < currentBet) return;
    isSpinning = true; balance -= currentBet;
    document.getElementById('win').innerText = "0.00";
    updateUI();
    reels.forEach((reel, index) => { setTimeout(() => { reel.classList.add(isTurbo ? 'turbo-spin' : 'spinning'); }, index * 80); });
    setTimeout(stopReels, isTurbo ? 600 : 1500);
}

function stopReels() {
    let finalBoard = [];
    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning', 'turbo-spin');
            let reelImages = [];
            const cells = reel.querySelectorAll('.slot-cell');
            cells.forEach(cell => {
                const randomImg = images[Math.floor(Math.random() * images.length)];
                cell.innerHTML = `<img src="${randomImg}">`;
                reelImages.push(randomImg);
            });
            finalBoard.push(reelImages);
            if (index === reels.length - 1) {
                isSpinning = false;
                checkWin(finalBoard);
                if (isAuto) setTimeout(startSpin, 1000);
            }
        }, index * 150);
    });
}

function checkWin(board) {
    let totalWin = 0;
    images.forEach(symbol => {
        let counts = [];
        for (let i = 0; i < 5; i++) { counts.push(board[i].filter(s => s === symbol).length); }
        if (counts[0] > 0 && counts[1] > 0 && counts[2] > 0) {
            let ways = counts[0] * counts[1] * counts[2];
            let mult = 2;
            if (counts[3] > 0) { ways *= counts[3]; mult = 5; if (counts[4] > 0) { ways *= counts[4]; mult = 10; } }
            totalWin += (currentBet / 20) * symbolValues[symbol] * ways * mult;
        }
    });
    if (totalWin > 0) { balance += totalWin; document.getElementById('win').innerText = totalWin.toFixed(2); }
    updateUI();
}

function updateUI() {
    document.getElementById('bal').innerText = balance.toFixed(2);
    document.getElementById('bet-val').innerText = currentBet.toFixed(2);
    document.getElementById('spin-trigger').disabled = isSpinning;
}

document.getElementById('spin-trigger').onclick = startSpin;
document.getElementById('bet-plus').onclick = () => { if(!isSpinning && currentBet < 1000) { currentBet += 10; updateUI(); } };
document.getElementById('bet-minus').onclick = () => { if(!isSpinning && currentBet > 10) { currentBet -= 10; updateUI(); } };
document.getElementById('turbo-btn').onclick = function() { isTurbo = !isTurbo; this.classList.toggle('active'); };
document.getElementById('auto-btn').onclick = function() { isAuto = !isAuto; this.classList.toggle('active'); if(isAuto && !isSpinning) startSpin(); };

init();
