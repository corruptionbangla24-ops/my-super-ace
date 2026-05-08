let queue = [];
let isSpinning = false;
let currentBet = 10.00;
let isFreeMode = false;
let freeSpinCount = 0;

// ১. ডাটাবেস থেকে স্পিন ডাটা লোড করার লজিক
async function loadBatch() {
    if (queue.length > 5) return; // ডাটা ব্যাকআপ থাকলে বাড়তি রিকোয়েস্ট পাঠাবে না
    try {
        let url = `spin_generator.php?uid=${userId}&bet=${currentBet}${isFreeMode ? '&mode=free' : ''}`;
        let response = await fetch(url, { cache: "no-store" });
        let data = await response.json();
        
        if (data && data.results) {
            queue = [...queue, ...data.results];
        }
        if (data && data.balance !== undefined) {
            document.getElementById('balance').innerText = parseFloat(data.balance).toFixed(2);
        }
    } catch (error) {
        console.error("সার্ভার কানেকশন ড্রপ করেছে, রি-ট্রাই করা হচ্ছে...", error);
        setTimeout(loadBatch, 3000); // এরর হলে ৩ সেকেন্ড পর আবার রিকোয়েস্ট যাবে
    }
}

// ২. স্পিন বাটন ক্লিক লজিক
async function handleSpin() {
    if (isSpinning) return;

    if (queue.length === 0) {
        await loadBatch();
        if (queue.length === 0) {
            alert("ডাটাবেস ফুয়েল খালি! দয়া করে clear_table_make_new.php রান দিন।");
            return;
        }
    }

    isSpinning = true;
    let currentSpinData = queue.shift(); // কিউ থেকে প্রথম ডাটা রিলিজ করা

    // তাৎক্ষণিকভাবে মেইন ব্যালেন্স থেকে বেটের টাকা মাইনাস করা
    if (!isFreeMode) {
        let balEl = document.getElementById('balance');
        if (balEl) {
            let currentBal = parseFloat(balEl.innerText);
            balEl.innerText = (currentBal - currentBet).toFixed(2);
        }
    }

    // আগের উইন অ্যামাউন্ট ০ করে দেওয়া
    document.getElementById('win-amount').innerText = "0.00";

    // প্রাথমিক রীল গ্রিড রেন্ডার করা
    renderBoard(currentSpinData.reels);

    // মাল্টিপ্লায়ার লেভেল ১ থেকে চেইন এনিমেশন ডাকা
    if (typeof processWinChain === 'function') {
        await processWinChain(currentSpinData, 1);
    }

    // ফ্রি স্পিন ট্র্যাকার চেক করা
    if (currentSpinData.free_spins > 0) {
        checkFreeSpin(currentSpinData);
    }

    // ব্যাকগ্রাউন্ডে পরবর্তী স্পিনের জন্য ডাটা এনে রাখা
    loadBatch();
}

// ৩. গ্রিডে ছবি বসানোর নিখুঁত ফাংশন
function renderBoard(reels) {
    if (!reels) return;
    for (let c = 0; c < 5; c++) {
        let reelEl = document.getElementById(`reel-${c}`);
        if (reelEl && reels[c]) {
            reelEl.innerHTML = '';
            reels[c].forEach(row => {
                let cell = document.createElement('div');
                cell.className = 'card-cell';
                cell.innerHTML = `<img src="${row.s}" alt="Card">`;
                reelEl.appendChild(cell);
            });
        }
    }
}

// ৪. বেট কম-বেশি করার ফাংশন (কোনো প্রি-লোড বাগ ছাড়া)
function changeBet(val) {
    if (isSpinning) return;
    currentBet = Math.max(10, Math.min(500, currentBet + val));
    document.getElementById('current-bet').innerText = currentBet.toFixed(2);
    queue = []; // বেট পরিবর্তন হলে পুরনো কিউ পরিষ্কার করে ফ্রেশ ডাটা আনা হবে
    loadBatch();
}

// ৫. পেজ খোলার সাথে সাথে ইঞ্জিন সচল করা
document.addEventListener("DOMContentLoaded", () => {
    loadBatch();
});
