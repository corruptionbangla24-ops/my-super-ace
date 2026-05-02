constes = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
const spinSound = new Audio('spin.mp3'); 
const stopSound = new Audio('stop.mp3');
const winSound = new Audio('win.mp3'); 
const bigWinSound = new Audio('big-win.mp3');
const clickSound = new Audio('click.mp3'); 
spinSound.loop = true;

const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3'), document.getElementById('r4'), document.getElementById('r5')];
let balance = typeof php_initial_balance !== 'undefined' ? php_initial_balance : 0;
// ১১ ও ১২ নম্বর লাইনের জায়গায় এটি বসান
const betSteps = [1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 500, 1000];
let currentStepIndex = 4; // ডিফল্ট ১০ টাকা সেট থাকবে
let currentBet = betSteps[currentStepIndex];
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
// ২৫ নম্বর লাইন থেকে ৪৪ নম্বর লাইনের জায়গায় এটি বসান
async function startSpin(isCascade = false) {
    if (isSpinning && !isCascade) return; // ক্যাসকেড না হলে এবং স্পিন চললে থামো

    let betToPay = isCascade ? 0 : currentBet; // ক্যাসকেড হলে টাকা কাটবে না

    // ১. ব্যালেন্স চেক (শুধুমাত্র মেইন স্পিনের জন্য)
    if (!isCascade) {
        if (freeSpinsRemaining > 0) {
            freeSpinsRemaining--;
            betToPay = 0; // ফ্রি স্পিনেও টাকা কাটবে না
            updateFreeSpinUI();
        } else {
            if (balance < currentBet) {
                alert("Insufficient Balance!");
                return;
            }
        }
        // মেইন স্পিন শুরু হলে উইন বক্স ক্লিয়ার করো
        document.getElementById('win').innerText = "0.00";
    }

    isSpinning = true;
    document.getElementById('spin-trigger').disabled = true;
    
    // ২. এনিমেশন শুরু
    spinSound.play().catch(()=>{});
    reels.forEach((r, i) => setTimeout(() => r.classList.add(isTurbo ? 'turbo-spin' : 'spinning'), i * 80));

    // ৩. সার্ভারে ডাটা পাঠানো
    const formData = new FormData();
    formData.append('user_id', php_user_id);
    formData.append('bet', betToPay); // এখানে অবশ্যই betToPay পাঠাতে হবে
    formData.append('current_bet_val', currentBet);

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

// ৬৬ নম্বর লাইন থেকে এই নতুন stopReels এবং Cascade লজিক বসান
async function stopReels(data) {
    reels.forEach((reel, i) => {
        setTimeout(() => {
            reel.classList.remove('spinning', 'turbo-spin');
            stopSound.play().catch(() => {});
            reel.innerHTML = '';
            data.reels[i].forEach(img => {
                reel.innerHTML += `<div class="slot-cell"><img src="${img}"></div>`;
            });

            if (i === 4) {
                handleWinSequence(data);
            }
        }, i * (isTurbo ? 30 : 60));
    });
}

async function handleWinSequence(data) {
    isSpinning = false;
    spinSound.pause();
    
    // ব্যালেন্স ও উইন আপডেট
    balance = parseFloat(data.new_balance);
    document.getElementById('bal').innerText = balance.toFixed(2);
    document.getElementById('win').innerText = data.win;
    document.getElementById('spin-trigger').disabled = false;

    if (data.is_win) {
        // ১. উইনিং কার্ড হাইলাইট ও পপ-আপ শো
        highlightWinners(data.win_symbol);
        showWinPopup(data.win);
        (parseFloat(data.win) >= currentBet * 5 ? bigWinSound : winSound).play().catch(() => {});

        // ২. কার্ড উধাও করে নতুন কার্ড ফেলার প্রক্রিয়া (SuperAce Style)
        setTimeout(() => {
            triggerCascade(data.win_symbol);
        }, 1500);
    } else {
        checkAutoAndFreeSpins(data);
    }
}

async function triggerCascade(symbol) {
    // ১. উইনিং কার্ডগুলো ভ্যানিশ করা (অ্যানিমেশন আগেই দেওয়া আছে)
    document.querySelectorAll('.win-highlight').forEach(el => {
        el.style.transform = "scale(0)";
        el.style.opacity = "0";
    });

    // ২. সার্ভার থেকে নতুন ডাটা আনা (টাকা কাটবে না)
    const formData = new FormData();
    formData.append('user_id', php_user_id);
    formData.append('bet', 0); 
    formData.append('is_cascade', true);
    formData.append('current_bet_val', currentBet);

    const res = await fetch('spin.php', { method: 'POST', body: formData });
    const newData = await res.json();

    // ৩. পুরো রীল না ঘুরিয়ে শুধু উইনিং ঘরগুলোতে নতুন ছবি বসানো
    setTimeout(() => {
        const reelsData = newData.reels;
        reels.forEach((reel, i) => {
            const cells = reel.querySelectorAll('.slot-cell');
            cells.forEach((cell, j) => {
                if (cell.classList.contains('win-highlight')) {
                    // শুধুমাত্র জেতা ঘরে নতুন ছবি ওপর থেকে পড়ার ইফেক্ট
                    cell.classList.remove('win-highlight');
                    cell.style.opacity = "0";
                    cell.innerHTML = `<img src="${reelsData[i][j]}" style="transform: translateY(-20px)">`;
                    
                    setTimeout(() => {
                        cell.style.transition = "all 0.3s ease-out";
                        cell.style.opacity = "1";
                        cell.querySelector('img').style.transform = "translateY(0)";
                    }, 50);
                }
            });
        });
        
        // ৪. আবার উইন চেক করা (একই স্পিনে বারবার জেতার জন্য)
        setTimeout(() => handleWinSequence(newData), 500);
    }, 600);
}


function showWinPopup(amount) {
    const winPopup = document.getElementById('big-win-overlay');
    winPopup.innerText = "WIN: " + amount;
    winPopup.classList.add('show-win');
    setTimeout(() => winPopup.classList.remove('show-win'), 2000);
}

function checkAutoAndFreeSpins(data) {
    if (freeSpinsRemaining === 0 && isAuto) {
        isAuto = false;
        document.getElementById('auto-btn').classList.remove('active');
    }

    if (data.free_spins > 0) {
        freeSpinsRemaining += data.free_spins;
        alert("অভিনন্দন! আপনি ১০টি ফ্রি স্পিন জিতেছেন!");
        updateFreeSpinUI();
        if (!isAuto) {
            isAuto = true;
            document.getElementById('auto-btn').classList.add('active');
            setTimeout(startSpin, 1000);
        }
    } else if (isAuto) {
        setTimeout(startSpin, 1000);
    }
}

function highlightWinners(symbol) {
    document.querySelectorAll('.slot-cell img').forEach(img => {
        if (img.src.includes(symbol)) img.parentElement.classList.add('win-highlight');
    });
}

function updateFreeSpinUI() {
    const spinBtn = document.getElementById('spin-trigger');
    if (freeSpinsRemaining > 0) {
        spinBtn.innerText = "FREE (" + freeSpinsRemaining + ")";
        spinBtn.style.background = "linear-gradient(#00ff88, #008855)";
    } else {
        spinBtn.innerText = "Spin";
        spinBtn.style.background = "radial-gradient(#ff5e00, #ff0000)";
    }
}

function resetSpin() {
    isSpinning = false;
    document.getElementById('spin-trigger').disabled = false;
    reels.forEach(r => r.classList.remove('spinning', 'turbo-spin'));
}
// ১৭২ নম্বর লাইন থেকে এটি বসান

// ১. স্পিন বাটন
document.getElementById('spin-trigger').onclick = () => startSpin(false);

// ২. বেট বাড়ানোর বাটন (+)
document.getElementById('bet-plus').onclick = () => {
    if (!isSpinning && currentStepIndex < betSteps.length - 1) {
        currentStepIndex++;
        currentBet = betSteps[currentStepIndex];
        document.getElementById('bet-val').innerText = currentBet.toFixed(2);
    }
};

// ৩. বেট কমানোর বাটন (-)
document.getElementById('bet-minus').onclick = () => {
    if (!isSpinning && currentStepIndex > 0) {
        currentStepIndex--;
        currentBet = betSteps[currentStepIndex];
        document.getElementById('bet-val').innerText = currentBet.toFixed(2);
    }
};

// ৪. টার্বো মোড বাটন
document.getElementById('turbo-btn').onclick = function() { 
    isTurbo = !isTurbo; 
    this.classList.toggle('active'); 
};

// ৫. অটো স্পিন বাটন
document.getElementById('auto-btn').onclick = function() { 
    isAuto = !isAuto; 
    this.classList.toggle('active'); 
    if(isAuto && !isSpinning) startSpin(false); 
};


init();

