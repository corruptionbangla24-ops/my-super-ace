const images = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
const spinSound = new Audio('spin.mp3'); const stopSound = new Audio('stop.mp3'); const winSound = new Audio('win.mp3');
const clickSound = new Audio('click.mp3'); const bigWinSound = new Audio('big-win.mp3'); spinSound.loop = true;

const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3'), document.getElementById('r4'), document.getElementById('r5')];
let balance = typeof php_initial_balance !== 'undefined' ? php_initial_balance : 0;
let currentBet = 0.50, isSpinning = false, isTurbo = false, isAuto = false;
let remainingFreeSpins = 0, totalFreeSpinWin = 0, initialFreeSpins = 10;

function init() {
    reels.forEach(reel => { if(!reel) return; reel.innerHTML = '';
        for(let i=0; i<4; i++) {
            const div = document.createElement('div'); div.className = 'slot-cell';
            div.innerHTML = `<img src="${images[Math.floor(Math.random() * images.length)]}">`; reel.appendChild(div);
        }
    }); updateUI();
}

async function startSpin() {
    if (isSpinning || (balance < currentBet && remainingFreeSpins === 0)) return;
    isSpinning = true; document.getElementById('win').innerText = "0.00";
    spinSound.play().catch(() => {});
    reels.forEach((reel, index) => { setTimeout(() => { reel.classList.add(isTurbo ? 'turbo-spin' : 'spinning'); }, index * 80); });

    const formData = new FormData();
    formData.append('user_id', php_user_id);
    formData.append('bet', remainingFreeSpins > 0 ? 0 : currentBet);

    try {
        const response = await fetch('spin.php', { method: 'POST', body: formData });
        const data = await response.json();
        if (data.status === 'success') { setTimeout(() => { stopReels(data); }, isTurbo ? 200 : 800); }
        else { alert(data.message); resetSpin(); }
    } catch (e) { resetSpin(); }
}

function stopReels(serverData) {
    reels.forEach((reel, index) => {
        let stopDelay = isTurbo ? (index * 20) : (index * 150);
        setTimeout(() => {
            reel.classList.remove('spinning', 'turbo-spin'); stopSound.play().catch(() => {});
            const cells = reel.querySelectorAll('.slot-cell');
            serverData.reels[index].forEach((symbol, i) => { if(cells[i]) cells[i].innerHTML = `<img src="${symbol}">`; });
            if (index === reels.length - 1) {
                isSpinning = false; spinSound.pause();
                checkWinResult(serverData); highlightWinners(serverData); handleFreeSpins(serverData);
                if (remainingFreeSpins > 0) runFreeSpins();
                else if (isAuto) setTimeout(startSpin, 1000);
            }
        }, stopDelay);
    });
}

function checkWinResult(data) {
    let winAmt = parseFloat(data.win); balance = parseFloat(data.new_balance);
    if (winAmt > 0) {
        if(remainingFreeSpins > 0) totalFreeSpinWin += winAmt;
        showBigWin(winAmt);
        if (winAmt >= currentBet * 5) { bigWinSound.play().catch(() => {}); startCoinShower(); }
        else winSound.play().catch(() => {});
    } updateUI();
}

function highlightWinners(serverData) {
    if (serverData.is_win && serverData.win_symbol) {
        document.querySelectorAll('.slot-cell img').forEach(img => {
            if (img.src.split('/').pop() === serverData.win_symbol) img.parentElement.classList.add('win-highlight');
        });
        setTimeout(() => { document.querySelectorAll('.win-highlight').forEach(el => el.classList.remove('win-highlight')); }, 2500);
    }
}

function handleFreeSpins(serverData) {
    if (serverData.free_spins > 0 && remainingFreeSpins === 0) {
        remainingFreeSpins = serverData.free_spins; alert("🎉 ১০টি ফ্রি স্পিন পেয়েছেন!"); runFreeSpins();
    }
}

function runFreeSpins() {
    if (remainingFreeSpins > 0) {
        document.getElementById('free-spin-info').style.display = 'block';
        document.getElementById('fs-count').innerText = (11 - remainingFreeSpins) + "/10";
        remainingFreeSpins--; setTimeout(() => { if (!isSpinning) startSpin(); }, 1500);
    } else showTotalFreeSpinSummary();
}

function showBigWin(amount) {
    document.getElementById('big-win-text').innerText = amount;
    document.getElementById('big-win-overlay').style.display = 'block';
    setTimeout(() => { document.getElementById('big-win-overlay').style.display = 'none'; }, 2500);
}

function showTotalFreeSpinSummary() {
    document.getElementById('free-spin-info').style.display = 'none';
    document.getElementById('big-win-text').innerText = "CONGRATULATIONS!";
    document.getElementById('fs-total-val').innerText = totalFreeSpinWin.toFixed(2);
    document.getElementById('big-win-overlay').style.display = 'block';
    document.getElementById('total-fs-win').style.display = 'block';
    setTimeout(() => { document.getElementById('big-win-overlay').style.display = 'none'; document.getElementById('total-fs-win').style.display = 'none'; totalFreeSpinWin = 0; }, 5000);
}

function startCoinShower() {
    const container = document.getElementById('coin-container');
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const coin = document.createElement('div'); coin.className = 'coin';
            coin.style.left = Math.random() * 100 + 'vw'; container.appendChild(coin);
            setTimeout(() => coin.remove(), 2500);
        }, i * 50);
    }
}

function updateUI() {
    document.getElementById('bal').innerText = balance.toFixed(2);
    document.getElementById('bet-val').innerText = currentBet.toFixed(2);
}

function resetSpin() { isSpinning = false; spinSound.pause(); reels.forEach(reel => reel.classList.remove('spinning', 'turbo-spin')); updateUI(); }

document.getElementById('spin-trigger').onclick = startSpin;
document.getElementById('bet-plus').onclick = () => { if(!isSpinning) { currentBet += 1.0; updateUI(); } };
document.getElementById('bet-minus').onclick = () => { if(!isSpinning && currentBet > 0.5) { currentBet -= 0.5; updateUI(); } };
document.getElementById('turbo-btn').onclick = function() { isTurbo = !isTurbo; this.classList.toggle('active'); };
document.getElementById('auto-btn').onclick = function() { isAuto = !isAuto; this.classList.toggle('active'); if(isAuto && !isSpinning) startSpin(); };

init();
