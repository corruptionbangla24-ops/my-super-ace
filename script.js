// ১. কনফিগারেশন এবং সাউন্ড সেটিংস
const images = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
const symbolValues = {'1.png': 15, '2.png': 50, '3.png': 10, '4.png': 8, '5.png': 5, '6.png': 3, '7.png': 2, '8.png': 1.5, '9.png': 1, '10.png': 30};

const spinSound = new Audio('spin.mp3');
const stopSound = new Audio('stop.mp3');
const winSound = new Audio('win.mp3');
const clickSound = new Audio('click.mp3');
const bigWinSound = new Audio('big-win.mp3');
spinSound.loop = true;

const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3'), document.getElementById('r4'), document.getElementById('r5')];
let balance = typeof php_initial_balance !== 'undefined' ? php_initial_balance : 0;
let currentBet = 0.50, isSpinning = false, isTurbo = false, isAuto = false;
let remainingFreeSpins = 0;
let totalFreeSpinWin = 0;
let initialFreeSpins = 10;

// ২. শুরুতে রীলে ছবি দেখানো
function init() {
    reels.forEach(reel => {
        if(!reel) return;
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

// ৩. স্পিন শুরু
async function startSpin() {
    if (isSpinning || (balance < currentBet && remainingFreeSpins === 0)) return;
    
    isSpinning = true;
    document.getElementById('win').innerText = "0.00";
    if(spinSound) { spinSound.currentTime = 0; spinSound.play().catch(() => {}); }

    reels.forEach((reel, index) => { 
        setTimeout(() => { reel.classList.add(isTurbo ? 'turbo-spin' : 'spinning'); }, index * 80); 
    });

    const formData = new FormData();
    formData.append('user_id', php_user_id);
    formData.append('bet', remainingFreeSpins > 0 ? 0 : currentBet);

    try {
        const response = await fetch('spin.php', { method: 'POST', body: formData });
        const data = await response.json();
        if (data.status === 'success') {
            let duration = isTurbo ? 200 : 800; // ০.২ সেকেন্ডে স্পিন শেষ
            setTimeout(() => { stopReels(data); }, duration);
        } else {
            alert(data.message);
            resetSpin();
        }
    } catch (error) {
        console.error("Error:", error);
        resetSpin();
    }
}

// ৪. রীল থামানো
function stopReels(serverData) {
    reels.forEach((reel, index) => {
        let stopDelay = isTurbo ? (index * 20) : (index * 150);
        setTimeout(() => {
            reel.classList.remove('spinning', 'turbo-spin');
            if(stopSound) { stopSound.currentTime = 0; stopSound.play().catch(() => {}); }

            const cells = reel.querySelectorAll('.slot-cell');
            serverData.reels[index].forEach((symbol, i) => {
                if(cells[i]) cells[i].innerHTML = `<img src="${symbol}">`;
            });
            
            if (index === reels.length - 1) {
                isSpinning = false;
                if(spinSound) spinSound.pause();
                checkWinResult(serverData);
                highlightWinners(serverData);
                handleFreeSpins(serverData);
                if (remainingFreeSpins > 0) runFreeSpins();
                if (isAuto && remainingFreeSpins === 0) setTimeout(startSpin, 1000);
            }
        }, stopDelay);
    });
}

// ৫. উইন রেজাল্ট এবং এনিমেশন
function checkWinResult(data) {
    let winAmt = parseFloat(data.win);
    balance = parseFloat(data.new_balance);
    if (winAmt > 0) {
        if(remainingFreeSpins > 0) totalFreeSpinWin += winAmt;
        showBigWin(winAmt); // মাঝখানে বড় করে উইন দেখাবে
        if (winAmt >= currentBet * 5) {
            if(bigWinSound) bigWinSound.play().catch(() => {});
            startCoinShower();
        } else {
            if(winSound) winSound.play().catch(() => {});
        }
    }
    updateUI();
}

function highlightWinners(serverData) {
    if (serverData.is_win && serverData.win_symbol) {
        const winSym = serverData.win_symbol;
        const allCells = document.querySelectorAll('.slot-cell img');
        allCells.forEach(img => {
            if (img.src.split('/').pop() === winSym) {
                img.parentElement.classList.add('win-highlight');
            }
        });
        setTimeout(() => {
            document.querySelectorAll('.win-highlight').forEach(el => el.classList.remove('win-highlight'));
        }, 2500);
    }
}

// ৬. ফ্রি স্পিন লজিক
function handleFreeSpins(serverData) {
    if (serverData.free_spins > 0 && remainingFreeSpins === 0) {
        remainingFreeSpins = serverData.free_spins;
        alert("🎉 অভিনন্দন! আপনি " + remainingFreeSpins + "টি ফ্রি স্পিন পেয়েছেন!");
        runFreeSpins();
    }
}

function runFreeSpins() {
    if (remainingFreeSpins > 0) {
        document.getElementById('free-spin-info').style.display = 'block';
        document.getElementById('fs-count').innerText = (initialFreeSpins - remainingFreeSpins + 1) + "/" + initialFreeSpins;
        remainingFreeSpins--;
        setTimeout(() => { if (!isSpinning) startSpin(); }, 1500);
    } else {
        showTotalFreeSpinSummary();
    }
}

function showBigWin(amount) {
    let winText = document.getElementById('big-win-text');
    let overlay = document.getElementById('big-win-overlay');
    if (amount > 0 && winText && overlay) {
        winText.innerText = amount;
        overlay.style.display = 'block';
        setTimeout(() => { overlay.style.display = 'none'; }, 2500);
    }
}

function showTotalFreeSpinSummary() {
    document.getElementById('free-spin-info').style.display = 'none';
    let overlay = document.getElementById('big-win-overlay');
    let totalText = document.getElementById('total-fs-win');
    if(overlay && totalText) {
        document.getElementById('big-win-text').innerText = "CONGRATULATIONS!";
        document.getElementById('fs-total-val').innerText = totalFreeSpinWin.toFixed(2);
        overlay.style.display = 'block';
        totalText.style.display = 'block';
        setTimeout(() => {
            overlay.style.display = 'none';
            totalText.style.display = 'none';
            totalFreeSpinWin = 0;
        }, 5000);
    }
}

function startCoinShower() {
    const container = document.getElementById('coin-container');
    if(!container) return;
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'coin';
            coin.style.left = Math.random() * 100 + 'vw';
            coin.style.animationDuration = (Math.random() * 2 + 1) + 's';
            container.appendChild(coin);
            setTimeout(() => coin.remove(), 2500);
        }, i * 50);
    }
}

function updateUI() {
    if(document.getElementById('bal')) document.getElementById('bal').innerText = balance.toFixed(2);
    if(document.getElementById('bet-val')) document.getElementById('bet-val').innerText = currentBet.toFixed(2);
    if(document.getElementById('spin-trigger')) document.getElementById('spin-trigger').disabled = isSpinning;
}

function resetSpin() {
    isSpinning = false;
    if(spinSound) spinSound.pause();
    reels.forEach(reel => reel.classList.remove('spinning', 'turbo-spin'));
    updateUI();
}

// বাটন ইভেন্ট লিসেনার
document.getElementById('spin-trigger').onclick = startSpin;
document.getElementById('bet-plus').onclick = () => { if(clickSound) clickSound.play(); if(!isSpinning && currentBet < 1000) { currentBet += 1.0; updateUI(); } };
document.getElementById('bet-minus').onclick = () => { if(clickSound) clickSound.play(); if(!isSpinning && currentBet > 0.5) { currentBet -= 0.5; updateUI(); } };
document.getElementById('turbo-btn').onclick = function() { if(clickSound) clickSound.play(); isTurbo = !isTurbo; this.classList.toggle('active'); };
document.getElementById('auto-btn').onclick = function() { if(clickSound) clickSound.play(); isAuto = !isAuto; this.classList.toggle('active'); if(isAuto && !isSpinning) startSpin(); };

init();
