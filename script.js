/**
 * SuperAce Ultimate Slot - Full Sound & 1024 Ways Logic
 */

// ১. কনফিগারেশন: ১০টি ছবির নাম ও পে-আউট মান
const images = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];

const symbolValues = {
    '1.png': 15, '2.png': 12, '3.png': 10, '4.png': 8, '5.png': 5, 
    '6.png': 3, '7.png': 2, '8.png': 1.5, '9.png': 0, '10.png': 0.5 
}; // ৯ নম্বর কার্ড (9.png) হলো SCATTER

const reels = [
    document.getElementById('r1'), document.getElementById('r2'), 
    document.getElementById('r3'), document.getElementById('r4'), 
    document.getElementById('r5')
];

// ২. ৬টি সাউন্ড ইফেক্ট লোড করা
const bgMusic = new Audio('bg-music.mp3');
const spinSound = new Audio('spin.mp3');
const stopSound = new Audio('stop.mp3');
const winSound = new Audio('win.mp3');
const bigWinSound = new Audio('big-win.mp3');
const scatterSound = new Audio('scatter-win.mp3');

bgMusic.loop = true; 
bgMusic.volume = 0.3; // হালকা ব্যাকগ্রাউন্ড মিউজিক

let balance = 1000;
let currentBet = 0.50;
let isSpinning = false;
let isTurbo = false;
let isAuto = false;
let freeSpinsLeft = 0; 
let isFreeSpinMode = false;

// ৩. শুরুতে রীলে ছবি দেখানো (Updated for Full Image)
function init() {
    reels.forEach(reel => {
        reel.innerHTML = '';
        for(let i=0; i<4; i++) {
            const randomImg = images[Math.floor(Math.random() * images.length)];
            const div = document.createElement('div');
            div.className = 'slot-cell';
            // ছবিতে width:100% এবং object-fit:cover দেওয়া হয়েছে যাতে ছবি বড় হয়
            div.innerHTML = `<img src="${randomImg}" style="width:100%; height:100%; object-fit:cover; display:block;">`;
            reel.appendChild(div);
        }
    });
}


async function startSpin() {
    if (isSpinning) return;

    // ফ্রি স্পিন মোড চেক করা
    if (isFreeSpinMode && freeSpinsLeft > 0) {
        freeSpinsLeft--; // ফ্রি স্পিন হলে টাকা কাটবে না
    } else {
        if (balance < currentBet) {
            alert("ব্যালেন্স পর্যাপ্ত নয়!");
            isAuto = false;
            return;
        }
        balance -= currentBet;
        
        // সাধারণ স্পিনে ফিরলে স্কাটার সাউন্ড বন্ধ হবে
        isFreeSpinMode = false;
        scatterSound.pause();
        scatterSound.currentTime = 0;
    }

    isSpinning = true;
    updateUI();
    // ... বাকি এনিমেশন কোড (যা আগে ছিল) ...
}


    // স্পিন সাউন্ড শুরু
    spinSound.currentTime = 0;
    spinSound.play();

    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.add(isTurbo ? 'turbo-spin' : 'spinning');
        }, index * 80);
    });

    const stopTime = isTurbo ? 600 : 1500;
    setTimeout(stopReels, stopTime);
}

// ৫. রীল থামানো
function stopReels() {
    let finalBoard = [];

    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning', 'turbo-spin');
            
            // রীল থামার শব্দ
            stopSound.currentTime = 0;
            stopSound.play();
            
            let reelImages = [];
            const cells = reel.querySelectorAll('.slot-cell');
            cells.forEach(cell => {
                const randomImg = images[Math.floor(Math.random() * images.length)];
                            cell.innerHTML = `<img src="${randomImg}" style="width:100%; height:100%; object-fit:cover; display:block;">`;
            reelImages.push(randomImg);
        });

            
            finalBoard.push(reelImages);

            if (index === reels.length - 1) {
                isSpinning = false;
                spinSound.pause(); // স্পিন শব্দ বন্ধ
                check1024WaysWin(finalBoard);
                if (isAuto) setTimeout(startSpin, 1000);
            }
        }, index * 150);
    });
}

// ৬. ১০২৪ ওয়েজ উইন ও স্কাটার লজিক
function check1024WaysWin(board) {
    let totalWin = 0;
    let scatterCount = 0;

    // স্কাটার (9.png) চেক করা
    for (let i = 0; i < 5; i++) {
        if (board[i].includes('9.png')) {
            scatterCount++;
        }
    }

    // ৩টি বা তার বেশি স্কাটার পড়লে সাউন্ড ও অ্যালার্ট
 
if (scatterCount >= 3) {
    freeSpinsLeft = 12; // ১২টি ফ্রি স্পিন দেওয়া হলো
    isFreeSpinMode = true;
    
    scatterSound.currentTime = 0;
    scatterSound.loop = true; // ১২ স্পিন চলা পর্যন্ত সাউন্ড লুপ হবে
    scatterSound.play();
    
    setTimeout(() => { 
        alert("অভিনন্দন! আপনি ১২টি FREE SPINS পেয়েছেন!"); 
        startSpin(); // অটোমেটিক ফ্রি স্পিন শুরু হবে
    }, 1000);
}

    // সাধারণ ১০২৪ ওয়েজ উইন চেক
    images.forEach(symbol => {
        if (symbol === '9.png') return;

        let counts = [];
        for (let i = 0; i < 5; i++) {
            counts.push(board[i].filter(s => s === symbol).length);
        }

        if (counts[0] > 0 && counts[1] > 0 && counts[2] > 0) {
            let ways = counts[0] * counts[1] * counts[2];
            let multiplier = 2; 
            if (counts[3] > 0) { 
                ways *= counts[3]; multiplier = 5; 
                if (counts[4] > 0) { ways *= counts[4]; multiplier = 10; }
            }
            totalWin += (currentBet / 20) * symbolValues[symbol] * ways * multiplier;
        }
    });

    if (totalWin > 0) {
        balance += totalWin;
        document.getElementById('win').innerText = totalWin.toFixed(2);
        
        // বড় জয় বা সাধারণ জয়ের সাউন্ড
        if (totalWin >= currentBet * 10) bigWinSound.play();
        else winSound.play();
    }
    updateUI();
}

function updateUI() {
    document.getElementById('bal').innerText = balance.toFixed(2);
    document.getElementById('bet-val').innerText = currentBet.toFixed(2);
    document.getElementById('spin-trigger').disabled = isSpinning;
}

// বাটন কন্ট্রোল
document.getElementById('spin-trigger').onclick = startSpin;

document.getElementById('bet-plus').onclick = () => {
    if(!isSpinning) {
        if(currentBet < 10) currentBet += 0.5;
        else if(currentBet < 100) currentBet += 10;
        else if(currentBet < 1000) currentBet += 50;
        updateUI();
    }
};

document.getElementById('bet-minus').onclick = () => {
    if(!isSpinning && currentBet > 0.5) {
        if(currentBet <= 10) currentBet -= 0.5;
        else if(currentBet <= 100) currentBet -= 10;
        else if(currentBet <= 1000) currentBet -= 50;
        updateUI();
        clickSound.currentTime = 0; // এটি ব্র্যাকেটের ভেতরে থাকবে
        clickSound.play();
    }
};

document.getElementById('turbo-btn').onclick = function() {
    isTurbo = !isTurbo;
    this.classList.toggle('active');
    clickSound.currentTime = 0;
    clickSound.play();
};

document.getElementById('auto-btn').onclick = function() {
    isAuto = !isAuto; this.classList.toggle('active');
    if(isAuto && !isSpinning) startSpin();
};

init();
