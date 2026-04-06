 // ১. কনফিগারেশন এবং সাউন্ড সেটিংস (সরাসরি কাজ করবে এমন লিঙ্ক)
const images = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];

const symbolValues = {
    '1.png': 15, '2.png': 12, '3.png': 10, '4.png': 8, '5.png': 5,
    '6.png': 3, '7.png': 2, '8.png': 1.5, '9.png': 1, '10.png': 0.5
};

// অডিও ফাইলগুলো সরাসরি .mp3 লিঙ্কে আপডেট করা হয়েছে
const spinSound = new Audio('https://soundjay.com');
const stopSound = new Audio('https://soundjay.com');
const winSound = new Audio('https://soundjay.com');
const clickSound = new Audio('https://soundjay.com');

spinSound.loop = true;

const reels = [
    document.getElementById('r1'), document.getElementById('r2'), 
    document.getElementById('r3'), document.getElementById('r4'), 
    document.getElementById('r5')
];

let balance = 1000;
let currentBet = 0.50;
let isSpinning = false;
let isTurbo = false;
let isAuto = false;

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

// ৩. স্পিন শুরু করা
async function startSpin() {
    if (isSpinning || balance < currentBet) {
        if(balance < currentBet) {
            alert("পর্যাপ্ত ব্যালেন্স নেই!");
            isAuto = false;
            document.getElementById('auto-btn').classList.remove('active');
        }
        return;
    }

    isSpinning = true;
    balance -= currentBet;
    document.getElementById('win').innerText = "0.00";
    updateUI();

    // সাউন্ড প্লে (ইউজার ইন্টারঅ্যাকশনের পর)
    spinSound.currentTime = 0;
    spinSound.play().catch(() => {});

    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.add(isTurbo ? 'turbo-spin' : 'spinning');
        }, index * 80);
    });

    const stopTime = isTurbo ? 600 : 1500;
    setTimeout(stopReels, stopTime);
}

// ৪. রীল থামানো
function stopReels() {
    let finalBoard = [];
    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning', 'turbo-spin');
            stopSound.currentTime = 0;
            stopSound.play().catch(() => {});

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
                spinSound.pause();
                check1024WaysWin(finalBoard);
                if (isAuto) setTimeout(startSpin, 1000);
            }
        }, index * 150);
    });
}

// ৫. উইন লজিক এবং সাউন্ড/কয়েন ইফেক্ট
function check1024WaysWin(board) {
    let totalWin = 0;
    images.forEach(symbol => {
        let counts = [];
        for (let i = 0; i < 5; i++) {
            let count = board[i].filter(s => s === symbol).length;
            counts.push(count);
        }

        if (counts[0] > 0 && counts[1] > 0 && counts[2] > 0) {
            let ways = counts[0] * counts[1] * counts[2];
            let multiplier = 2;
            if (counts[3] > 0) {
                ways *= counts[3];
                multiplier = 5;
                if (counts[4] > 0) {
                    ways *= counts[4];
                    multiplier = 10;
                }
            }
            totalWin += (currentBet / 20) * symbolValues[symbol] * ways * multiplier;
        }
    });

    if (totalWin > 0) {
        balance += totalWin;
        document.getElementById('win').innerText = totalWin.toFixed(2);
        
        // জেতার সাউন্ড
        winSound.currentTime = 0;
        winSound.play().catch(() => {});
        
        // বড় জয়ের সময় কয়েন ওড়ানো (বেটের ৩ গুণের বেশি জিতলে)
        if (totalWin >= currentBet * 3) {
            startCoinShower();
        }
    }
    updateUI();
}

// ৬. কয়েন শাওয়ার ফাংশন (নিখুঁত অ্যানিমেশন)
function startCoinShower() {
    const container = document.getElementById('coin-container');
    if(!container) return;
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'coin';
            coin.style.left = Math.random() * 100 + 'vw';
            coin.style.animationDuration = (Math.random() * 2 + 1) + 's';
            container.appendChild(coin);
            setTimeout(() => coin.remove(), 2500);
        }, i * 60);
    }
}

// ৭. ইউজার ইন্টারফেস এবং বাটন ইভেন্ট
function updateUI() {
    document.getElementById('bal').innerText = balance.toFixed(2);
    document.getElementById('bet-val').innerText = currentBet.toFixed(2);
    document.getElementById('spin-trigger').disabled = isSpinning;
}

document.getElementById('spin-trigger').onclick = startSpin;

document.getElementById('bet-plus').onclick = function() {
    if(!isSpinning) {
        if(currentBet < 10) currentBet += 0.5;
        else if(currentBet < 100) currentBet += 10;
        else currentBet += 50;
        if(currentBet > 1000) currentBet = 1000;
        clickSound.play().catch(() => {});
        updateUI();
    }
};

document.getElementById('bet-minus').onclick = function() {
    if(!isSpinning && currentBet > 0.5) {
        if(currentBet <= 10) currentBet -= 0.5;
        else if(currentBet <= 100) currentBet -= 10;
        else currentBet -= 50;
        clickSound.play().catch(() => {});
        updateUI();
    }
};

document.getElementById('turbo-btn').onclick = function() {
    isTurbo = !isTurbo;
    this.classList.toggle('active');
    clickSound.play().catch(() => {});
};

document.getElementById('auto-btn').onclick = function() {
    isAuto = !isAuto;
    this.classList.toggle('active');
    clickSound.play().catch(() => {});
    if(isAuto && !isSpinning) startSpin();
};

// গেম শুরু
init();
               
