// ১. কনফিগারেশন এবং সাউন্ড সেটিংস
const images = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
const symbolValues = {'1.png': 15, '2.png': 12, '3.png': 10, '4.png': 8, '5.png': 5, '6.png': 3, '7.png': 2, '8.png': 1.5, '9.png': 1, '10.png': 0.5};

// অডিও ফাইল লোড করা
const spinSound = new Audio('spin.mp3');
const stopSound = new Audio('stop.mp3');
const winSound = new Audio('win.mp3');
const clickSound = new Audio('click.mp3');
const bigWinSound = new Audio('big-win.mp3');
spinSound.loop = true;

const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3'), document.getElementById('r4'), document.getElementById('r5')];
// ব্যালেন্স PHP থেকে আসা ভেরিয়েবল php_initial_balance থেকে লোড হবে
let balance = typeof php_initial_balance !== 'undefined' ? php_initial_balance : 1000;
let currentBet = 10.00, isSpinning = false, isTurbo = false, isAuto = false;

// ২. শুরুতে রীলে ছবি দেখানো
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

// ৩. স্পিন শুরু (Database এর সাথে কানেক্টেড)
async function startSpin() {
    if (isSpinning || balance < currentBet) {
        if(balance < currentBet) alert("ব্যালেন্স পর্যাপ্ত নয়!");
        return;
    }
    
    isSpinning = true;
    document.getElementById('win').innerText = "0.00";
    updateUI();
    
    // সাউন্ড শুরু
    spinSound.currentTime = 0;
    spinSound.play().catch(() => {});

    // এনিমেশন শুরু
    reels.forEach((reel, index) => { 
        setTimeout(() => { reel.classList.add(isTurbo ? 'turbo-spin' : 'spinning'); }, index * 60); 
    });

    // সার্ভার (spin.php) থেকে রেজাল্ট নিয়ে আসা
    const formData = new FormData();
    formData.append('user_id', php_user_id);
    formData.append('bet', currentBet);

    try {
        const response = await fetch('spin.php', { method: 'POST', body: formData });
        const data = await response.json();

        if (data.status === 'success') {
            setTimeout(() => stopReels(data), isTurbo ? 300 : 800);
        } else {
            alert(data.message);
            resetSpin();
        }
    } catch (error) {
        console.error("Error:", error);
        resetSpin();
    }
}

// ৪. রীল থামানো এবং ফলাফল দেখানো
function stopReels(serverData) {
    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning', 'turbo-spin');
            stopSound.currentTime = 0;
            stopSound.play().catch(() => {});

            // সার্ভার থেকে আসা নির্দিষ্ট সিম্বলগুলো বসানো
            const cells = reel.querySelectorAll('.slot-cell');
            serverData.reels[index].forEach((symbol, i) => {
                cells[i].innerHTML = `<img src="${symbol}">`;
            });
            
            if (index === reels.length - 1) {
                isSpinning = false;
                spinSound.pause();
                checkWinResult(serverData);
                highlightWinners(serverData);

                if (isAuto) setTimeout(startSpin, 1000);
            }
        }, index * 150);
    });
}

// ৫. উইন লজিক এবং সাউন্ড কন্ট্রোল
function checkWinResult(data) {
    const totalWin = parseFloat(data.win);
    balance = parseFloat(data.new_balance);
    
    if (totalWin > 0) {
        document.getElementById('win').innerText = totalWin.toFixed(2);
        
        // বড় বা সাধারণ উইন সাউন্ড
        if (totalWin >= currentBet * 5) {
            bigWinSound.currentTime = 0;
            bigWinSound.play().catch(() => {});
            startCoinShower(); // বড় জয়ে কয়েন ঝরবে
        } else {
            winSound.currentTime = 0;
            winSound.play().catch(() => {});
        }
    }
    updateUI();
}

// ৬. কয়েন শাওয়ার ফাংশন
function startCoinShower() {
    const container = document.getElementById('coin-container');
    if(!container) return;
    for (let i = 0; i < 45; i++) {
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
function highlightWinners(serverData) {
    if (serverData.is_win && serverData.win_symbol) {
        const allCells = document.querySelectorAll('.slot-cell img');
        allCells.forEach(img => {
            // ছবির নাম মিলিয়ে কালো হাইলাইট যোগ করা
            if (img.src.split('/').pop() === serverData.win_symbol) {
                img.parentElement.classList.add('win-highlight');
            }
        });

        // ৩ সেকেন্ড পর হাইলাইট সরিয়ে ফেলা
        setTimeout(() => {
            document.querySelectorAll('.win-highlight').forEach(el => el.classList.remove('win-highlight'));
        }, 3000);
    }
}
// ১৫২ নম্বর লাইনের আগে এটি বসান (ফ্রি স্পিন ইঞ্জিন)
let remainingFreeSpins = 0;

function handleFreeSpins(serverData) {
    if (serverData.free_spins > 0) {
        remainingFreeSpins = serverData.free_spins;
        alert("🎉 অভিনন্দন! আপনি " + remainingFreeSpins + "টি ফ্রি স্পিন পেয়েছেন!");
        runFreeSpins();
    }
}

function runFreeSpins() {
    if (remainingFreeSpins > 0) {
        remainingFreeSpins--;
        console.log("বাকি ফ্রি স্পিন: " + remainingFreeSpins);
        
        // ১.৫ সেকেন্ড পর পর অটোমেটিক স্পিন হবে
        setTimeout(() => {
            if (!isSpinning) startSpin(); 
        }, 1500);
    }
}

function updateUI() {
    document.getElementById('bal').innerText = balance.toFixed(2);
    document.getElementById('bet-val').innerText = currentBet.toFixed(2);
    document.getElementById('spin-trigger').disabled = isSpinning;
}

function resetSpin() {
    isSpinning = false;
    spinSound.pause();
    reels.forEach(reel => reel.classList.remove('spinning', 'turbo-spin'));
    updateUI();
}

// বাটন ইভেন্ট হ্যান্ডলারসমূহ
document.getElementById('spin-trigger').onclick = startSpin;
document.getElementById('bet-plus').onclick = () => { clickSound.play(); if(!isSpinning && currentBet < 1000) { currentBet += 10; updateUI(); } };
document.getElementById('bet-minus').onclick = () => { clickSound.play(); if(!isSpinning && currentBet > 10) { currentBet -= 10; updateUI(); } };
document.getElementById('turbo-btn').onclick = function() { clickSound.play(); isTurbo = !isTurbo; this.classList.toggle('active'); };
document.getElementById('auto-btn').onclick = function() { clickSound.play(); isAuto = !isAuto; this.classList.toggle('active'); if(isAuto && !isSpinning) startSpin(); };

// গেম শুরু
init();

            
