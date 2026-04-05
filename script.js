/**
 * SuperAce Ultimate Slot - 1024 Ways to Win Logic
 * Author: Beginner Web Dev Partner
 */

// ১. কনফিগারেশন: আপনার ১০টি ছবির নাম এবং তাদের জেতার মান (Payout)
const images = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];

// প্রতিটি ছবির জন্য আলাদা আলাদা গুনাঙ্ক (এটি প্রফেশনাল গেমের নিয়ম)
const symbolValues = {
    '1.png': 15,  // সবচেয়ে দামী ছবি (১৫ গুণ)
    '2.png': 12, 
    '3.png': 10,
    '4.png': 8,
    '5.png': 5,
    '6.png': 3,
    '7.png': 2,
    '8.png': 1.5,
    '9.png': 1,
    '10.png': 0.5  // সবচেয়ে কম দামী ছবি
};

const reels = [
    document.getElementById('r1'), 
    document.getElementById('r2'), 
    document.getElementById('r3'), 
    document.getElementById('r4'), 
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
            // নিচে 'images/' মুছে দেওয়া হয়েছে
            div.innerHTML = `<img src="${randomImg}" style="width:85%; height:85%; object-fit:contain;">`;
            reel.appendChild(div);
        }
    });
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
    document.getElementById('win').innerText = "0.00"; // নতুন স্পিনে উইন রিসেট
    updateUI();

    // এনিমেশন শুরু
    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.add(isTurbo ? 'turbo-spin' : 'spinning');
        }, index * 80);
    });

    const stopTime = isTurbo ? 600 : 1500;
    setTimeout(stopReels, stopTime);
}

// ৪. রীল থামানো এবং ডাটা সংগ্রহ
function stopReels() {
    let finalBoard = []; // ৫টি রীলের সব ছবি এখানে জমা হবে

    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning', 'turbo-spin');
            
            let reelImages = [];
            const cells = reel.querySelectorAll('.slot-cell');
            
            cells.forEach(cell => {
    const randomImg = images[Math.floor(Math.random() * images.length)];
    // নিচে 'images/' মুছে দেওয়া হয়েছে
    cell.innerHTML = `<img src="${randomImg}">`;
reelImages.push(randomImg);
                
});

            finalBoard.push(reelImages);

            // শেষ রীল থামলে উইন চেক করো
            if (index === reels.length - 1) {
                isSpinning = false;
                check1024WaysWin(finalBoard);
                if (isAuto) setTimeout(startSpin, 800);
            }
        }, index * 150);
    });
}

// ৫. ১০২৪ ওয়েজ উইনিং লজিক (The Core Engine)
// ৫. ১০২৪ ওয়েজ উইনিং লজিক (সঠিক ভার্সন)
function check1024WaysWin(board) {
    let totalWin = 0;

    images.forEach(symbol => {
        let counts = []; 
        for (let i = 0; i < 5; i++) {
            let count = board[i].filter(s => s === symbol).length;
            counts.push(count);
        }

        // বাম থেকে ডানে অন্তত প্রথম ৩টি রীলে ছবি থাকতে হবে
        if (counts[0] > 0 && counts[1] > 0 && counts[2] > 0) {
            let ways = counts[0] * counts[1] * counts[2];
            let multiplier = 2; // ৩টি রীল মিললে ২ গুণ বোনাস

            if (counts[3] > 0) {
                ways *= counts[3];
                multiplier = 5; // ৪টি রীল মিললে ৫ গুণ বোনাস
                if (counts[4] > 0) {
                    ways *= counts[4];
                    multiplier = 10; // ৫টি রীল মিললে ১০ গুণ বোনাস
                }
            }

            let win = (currentBet / 20) * symbolValues[symbol] * ways * multiplier;
            totalWin += win;
        }
    });

    if (totalWin > 0) {
        balance += totalWin;
        document.getElementById('win').innerText = totalWin.toFixed(2);
    }
    updateUI();
}

// ৬. ইউজার ইন্টারফেস আপডেট
function updateUI() {
    document.getElementById('bal').innerText = balance.toFixed(2);
    document.getElementById('bet-val').innerText = currentBet.toFixed(2);
    document.getElementById('spin-trigger').disabled = isSpinning;
}

// ৭. বাটন ইভেন্ট হ্যান্ডলার
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
    }
};

document.getElementById('turbo-btn').onclick = function() {
    isTurbo = !isTurbo;
    this.classList.toggle('active');
};

document.getElementById('auto-btn').onclick = function() {
    isAuto = !isAuto;
    this.classList.toggle('active');
    if(isAuto) startSpin();
};

// গেম শুরু করা
init();
