/**
 * SuperAce Ultimate Slot - Fixed Full Code
 * Features: 1024 Ways, 12 Free Spins, 6 Sounds, Full Images
 */

// ১. কনফিগারেশন
const images = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
const symbolValues = {
    '1.png': 15, '2.png': 12, '3.png': 10, '4.png': 8, '5.png': 5, 
    '6.png': 3, '7.png': 2, '8.png': 1.5, '9.png': 0, '10.png': 0.5 
};

const reels = [
    document.getElementById('r1'), document.getElementById('r2'), 
    document.getElementById('r3'), document.getElementById('r4'), 
    document.getElementById('r5')
];

// ২. সাউন্ড ইফেক্টস
const bgMusic = new Audio('bg-music.mp3');
const spinSound = new Audio('spin.mp3');
const stopSound = new Audio('stop.mp3');
const winSound = new Audio('win.mp3');
const bigWinSound = new Audio('big-win.mp3');
const scatterSound = new Audio('scatter-win.mp3');
const clickSound = new Audio('stop.mp3'); // ক্লিক সাউন্ড হিসেবে স্টপ সাউন্ড ব্যবহার

bgMusic.loop = true; 
bgMusic.volume = 0.3;

// ৩. গেম ভেরিয়েবলস
let balance = 1000;
let currentBet = 0.50;
let isSpinning = false;
let isTurbo = false;
let isAuto = false;
let freeSpinsLeft = 0; 
let isFreeSpinMode = false;

// ৪. শুরুতে রীলে ছবি দেখানো
function init() {
    reels.forEach(reel => {
        reel.innerHTML = '';
        for(let i=0; i<4; i++) {
            const randomImg = images[Math.floor(Math.random() * images.length)];
            const div = document.createElement('div');
            div.className = 'slot-cell';
            div.innerHTML = `<img src="${randomImg}" style="width:100%; height:100%; object-fit:cover; display:block;">`;
            reel.appendChild(div);
        }
    });
}

// ৫. স্পিন শুরু
async function startSpin() {
    if (isSpinning) return;

    // ৫৯ থেকে ৮৪ লাইনের সংশোধিত কোড:
    
    // ব্যাকগ্রাউন্ড মিউজিক প্রথম ক্লিকের পর চালু হবে
    bgMusic.play().catch(() => console.log("Audio waiting for click"));

    if (isFreeSpinMode && freeSpinsLeft > 0) {
        freeSpinsLeft--;
    } else {
        if (balance < currentBet) {
            alert("ব্যালেন্স পর্যাপ্ত নয়!");
            isAuto = false;
            isFreeSpinMode = false;
            if (typeof scatterSound !== 'undefined') scatterSound.pause();
            updateUI();
            return;
        }
        balance -= currentBet;
        if (freeSpinsLeft === 0) {
            isFreeSpinMode = false;
            if (typeof scatterSound !== 'undefined') {
                scatterSound.pause();
                scatterSound.currentTime = 0;
            }
        }
    }

    isSpinning = true;
    document.getElementById('win').innerText = "0.00";
    updateUI();

    // স্পিন সাউন্ড শুরু করা (এটি নিশ্চিত করবে স্পিন করার সময় শব্দ হবে)
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

// ৬. রীল থামানো

function stopReels() {
    let finalBoard = [];

    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning', 'turbo-spin');
            
            // প্রতিটি রীল থামার সময় ছোট শব্দ (Click sound)
            stopSound.currentTime = 0;
            stopSound.play();

            let reelImages = [];
            const cells = reel.querySelectorAll('.slot-cell');
            cells.forEach(cell => {
                const randomImg = images[Math.floor(Math.random() * images.length)];
                cell.innerHTML = `<img src="${randomImg}" style="width:85%; height:85%; object-fit:contain;">`;
                reelImages.push(randomImg);
            });
            
            finalBoard.push(reelImages);

            // যখন শেষ রীলটি থামবে (৫ নম্বর রীল)
            if (index === reels.length - 1) {
                isSpinning = false;
                
                // ১. স্পিন সাউন্ড এখানে অবশ্যই থামিয়ে দিতে হবে
                spinSound.pause();
                spinSound.currentTime = 0; // সাউন্ড রিসেট করা

                // ২. উইন লজিক চেক করা
                check1024WaysWin(finalBoard);

                // ৩. অটো মোড চেক করা
                if (isFreeSpinMode && freeSpinsLeft > 0) {
                    setTimeout(startSpin, 1000);
                } else if (isAuto) {
                    setTimeout(startSpin, 1000);
                }
            }
        }, index * 150); // প্রতিটি রীল থামার ব্যবধান
    });
}

// ৭. উইন ও স্কাটার লজিক
function check1024WaysWin(board) {
    let totalWin = 0;
    let scatterCount = 0;

    // স্কাটার (9.png) চেক
    for (let i = 0; i < 5; i++) {
        if (board[i].includes('9.png')) scatterCount++;
    }

    if (scatterCount >= 3 && !isFreeSpinMode) {
        freeSpinsLeft = 12;
        isFreeSpinMode = true;
        scatterSound.currentTime = 0;
        scatterSound.loop = true;
        scatterSound.play();
        alert("অভিনন্দন! আপনি ১২টি FREE SPINS পেয়েছেন!");
        setTimeout(startSpin, 1500);
    }

    // ১০২৪ ওয়েজ উইন চেক
    images.forEach(symbol => {
        if (symbol === '9.png') return;
        let counts = [];
        for (let i = 0; i < 5; i++) {
            counts.push(board[i].filter(s => s === symbol).length);
        }

        if (counts[0] > 0 && counts[1] > 0 && counts[2] > 0) {
            let ways = counts[0] * counts[1] * counts[2];
            let mult = 2;
            if (counts[3] > 0) { ways *= counts[3]; mult = 5; 
                if (counts[4] > 0) { ways *= counts[4]; mult = 10; }
            }
            totalWin += (currentBet / 20) * symbolValues[symbol] * ways * mult;
        }
    });

    if (totalWin > 0) {
        balance += totalWin;
        document.getElementById('win').innerText = totalWin.toFixed(2);
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

// ৮. বাটন কন্ট্রোল
document.getElementById('spin-trigger').onclick = startSpin;

document.getElementById('bet-plus').onclick = () => {
    if(!isSpinning) {
        if(currentBet < 10) currentBet += 0.5;
        else if(currentBet < 100) currentBet += 10;
        else if(currentBet < 1000) currentBet += 50;
        updateUI();
        clickSound.play();
    }
};

document.getElementById('bet-minus').onclick = () => {
    if(!isSpinning && currentBet > 0.5) {
        if(currentBet <= 10) currentBet -= 0.5;
        else if(currentBet <= 100) currentBet -= 10;
        else if(currentBet <= 1000) currentBet -= 50;
        updateUI();
        clickSound.play();
    }
};

document.getElementById('turbo-btn').onclick = function() {
    isTurbo = !isTurbo; this.classList.toggle('active');
    clickSound.play();
};

document.getElementById('auto-btn').onclick = function() {
    isAuto = !isAuto; this.classList.toggle('active');
    clickSound.play();
    if(isAuto && !isSpinning) startSpin();
};

init();
