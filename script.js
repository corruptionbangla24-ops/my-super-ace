const images = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
const spinSound = new Audio('spin.mp3'); 
const stopSound = new Audio('stop.mp3');
const winSound = new Audio('win.mp3'); 
const bigWinSound = new Audio('big-win.mp3');
const clickSound = new Audio('click.mp3'); 
spinSound.loop = true;

const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3'), document.getElementById('r4'), document.getElementById('r5')];
let balance = typeof php_initial_balance !== 'undefined' ? php_initial_balance : 0;
let currentBet = 10.00;
let isSpinning = false, isTurbo = false, isAuto = false, freeSpinsRemaining = 0;


function init() {
    reels.forEach(reel => {
        reel.innerHTML = '';
        for(let i=0; i<4; i++) {
            const randomImg = images[Math.floor(Math.random() * images.length)];
            reel.innerHTML += `<div class="slot-cell"><img src="${randomImg}"></div>`;
        }
    });
}
async function startSpin() {
    if (isSpinning) return;

    let betToSend = currentBet; // ডিফল্ট বেট

    // ফ্রি স্পিন থাকলে টাকা কাটবে না
    if (freeSpinsRemaining > 0) {
        freeSpinsRemaining--;
        betToSend = 0; // সার্ভারে ০ বেট পাঠাবে যাতে টাকা না কাটে
        updateFreeSpinUI();
    } else {
        if (balance < currentBet) {
            alert("Insufficient Balance!");
            return;
        }
    }

    isSpinning = true;
    document.getElementById('spin-trigger').disabled = true;
    document.getElementById('win').innerText = "0.00";
    
    spinSound.play().catch(()=>{});
    reels.forEach((r, i) => setTimeout(() => r.classList.add(isTurbo ? 'turbo-spin' : 'spinning'), i * 80));

    const formData = new FormData();
    formData.append('user_id', php_user_id);
    formData.append('bet', betToSend); // এখানে currentBet এর বদলে betToSend হবে

    try {
        const res = await fetch('spin.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.status === 'success') {
            setTimeout(() => stopReels(data), isTurbo ? 150 : 600);
        } else {
            alert(data.message);
            resetSpin();
        }
    } catch (e) {
        resetSpin();
    }
}

function stopReels(data) {
    reels.forEach((reel, i) => {
        setTimeout(() => {
            reel.classList.remove('spinning', 'turbo-spin');
            stopSound.play().catch(()=>{});
            reel.innerHTML = '';
            data.reels[i].forEach(img => {
                reel.innerHTML += `<div class="slot-cell"><img src="${img}"></div>`;
            });

            if (i === 4) {
                isSpinning = false;
                spinSound.pause();
                balance = parseFloat(data.new_balance);
                document.getElementById('bal').innerText = balance.toFixed(2);
                document.getElementById('win').innerText = data.win;
                document.getElementById('spin-trigger').disabled = false;
                
                if (data.is_win) {
                    highlightWinners(data.win_symbol);
                    (parseFloat(data.win) >= currentBet * 5 ? bigWinSound : winSound).play().catch(()=>{});
                }
                if (freeSpinsRemaining === 0 && isAuto) {
    // ১০টি ফ্রি স্পিন শেষ হলে অটো স্পিন বন্ধ হবে
    isAuto = false; 
    document.getElementById('auto-btn').classList.remove('active');
}
                // ৮৭ নম্বর লাইনের ঠিক নিচে এটি বসান
if (data.is_win) {
    const winPopup = document.getElementById('big-win-overlay');
    winPopup.innerText = "WIN: " + data.win;
    winPopup.classList.add('show-win');

    setTimeout(() => {
        winPopup.classList.remove('show-win');
    }, 2500);
}

                // ৮৫ নম্বর লাইনের ঠিক নিচে এটি বসান
if (data.free_spins > 0) {
    freeSpinsRemaining += data.free_spins;
    alert("অভিনন্দন! আপনি ১০টি ফ্রি স্পিন জিতেছেন!");
    updateFreeSpinUI();
    if (!isAuto) { 
        isAuto = true; 
        document.getElementById('auto-btn').classList.add('active');
        setTimeout(startSpin, 1200); 
    }
}

// এই লাইনের পর যদি অটো-স্পিন লজিক থাকে সেটি থাকবে

                if (isAuto) setTimeout(startSpin, 800);
            }
        }, i * 60);
    });
}

function highlightWinners(symbol) {
    document.querySelectorAll('.slot-cell img').forEach(img => {
        if (img.src.includes(symbol)) img.parentElement.classList.add('win-highlight');
    });
    setTimeout(() => {
        document.querySelectorAll('.win-highlight').forEach(el => el.classList.remove('win-highlight'));
    }, 2000);
}

function resetSpin() {
    isSpinning = false;
    document.getElementById('spin-trigger').disabled = false;
    reels.forEach(r => r.classList.remove('spinning', 'turbo-spin'));
}
function updateFreeSpinUI() {
    const spinBtn = document.getElementById('spin-trigger');
    if (freeSpinsRemaining > 0) {
        spinBtn.innerText = "FREE (" + freeSpinsRemaining + ")";
        spinBtn.style.background = "linear-gradient(#00ff88, #008855)"; // সবুজ রঙ
    } else {
        spinBtn.innerText = "Spin";
        spinBtn.style.background = "radial-gradient(#ff5e00, #ff0000)"; // আগের লাল রঙ
    }
}
// ১৩৩ নম্বর লাইন থেকে এটি বসান
const betSteps = [1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 500, 1000];
let currentStepIndex = 4; // ডিফল্ট ১০ টাকা

document.getElementById('spin-trigger').onclick = startSpin;

document.getElementById('bet-plus').onclick = () => {
    if (!isSpinning && currentStepIndex < betSteps.length - 1) {
        currentStepIndex++;
        currentBet = betSteps[currentStepIndex];
        document.getElementById('bet-val').innerText = currentBet.toFixed(2);
    }
};

document.getElementById('bet-minus').onclick = () => {
    if (!isSpinning && currentStepIndex > 0) {
        currentStepIndex--;
        currentBet = betSteps[currentStepIndex];
        document.getElementById('bet-val').innerText = currentBet.toFixed(2);
    }
};

document.getElementById('turbo-btn').onclick = function() { 
    isTurbo = !isTurbo; 
    this.classList.toggle('active'); 
};

document.getElementById('auto-btn').onclick = function() { 
    isAuto = !isAuto; 
    this.classList.toggle('active'); 
    if(isAuto && !isSpinning) startSpin(); 
};

init();


