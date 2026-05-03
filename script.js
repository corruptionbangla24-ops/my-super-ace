let queue = [], isSpinning = false, isTurbo = false;

// ১. সার্ভার থেকে ডাটা আনা
async function loadBatch() {
    let r = await fetch(`spin_generator.php?uid=${userId}`);
    let d = await r.json();
    queue = d.results;
}

// ২. মেইন স্পিন ফাংশন
async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;
    let data = queue.shift();
    // ১৫ নম্বর লাইনের নিচে এই কোডটি বসান (আগের হাইলাইট মুছতে)
document.querySelectorAll('.cell').forEach(c => c.classList.remove('win-highlight'));

    // রীল রেন্ডার করা (id="c-কলাম-রো" ফরম্যাটে)
    data.reels.forEach((col, i) => {
        let el = document.getElementById(`reel-${i}`);
        el.innerHTML = col.map((c, j) => `
            <div class="cell ${c.g ? 'golden' : ''}" id="c-${i}-${j}">
                <img src="${c.s}">
            </div>
        `).join('');
    });

    // ৩. হাইলাইট এবং ক্যাসকেড লজিক
    if (data.win_pos && data.win_pos.length > 0) {
// ২৮ নম্বর লাইনের দিকে (id-টা ভালো করে মিলিয়ে নিন)
data.win_pos.forEach(p => {
    let cell = document.getElementById(`c-${p.c}-${p.r}`);
                    if (cell) {
                    cell.classList.remove('golden'); 
                    cell.classList.add('win-highlight');
                }
});

        
        await new Promise(r => setTimeout(r, 600)); // হাইলাইট দেখার সময়

        // কার্ড ভ্যানিশ হওয়া
        data.win_pos.forEach(p => {
            let cell = document.getElementById(`c-${p.c}-${p.r}`);
            if (cell) {
                cell.style.transition = "all 0.3s ease";
                cell.style.transform = "scale(0)";
                cell.style.opacity = "0";
            }
        });

        await new Promise(r => setTimeout(r, 400));

        // ৪. গ্র্যাভিটি/রিফিল (উপরের কার্ড নিচে নামা)
        processCascade(data.win_pos);
    }

    document.getElementById('bal-val').innerText = data.bal;
    document.getElementById('win-amount').innerText = data.win;
    
    isSpinning = false;
    if (queue.length < 5) loadBatch();
}
function processCascade(winPos) {
    for (let i = 0; i < 5; i++) {
        let reel = document.getElementById(`reel-${i}`);
        let currentCells = Array.from(reel.querySelectorAll('.cell'));
        
        // ১. উধাও হওয়া কার্ডগুলো রিমুভ করা
        currentCells.forEach(cell => {
            if (cell.style.opacity === "0") cell.remove();
        });

        // ২. কতটি কার্ড উধাও হয়েছে তা হিসেব করা
        let remaining = reel.querySelectorAll('.cell').length;
        let needed = 4 - remaining;

        // ৩. নতুন কার্ডগুলো রীলের মাথায় যোগ করা এবং নিচে পড়ার এনিমেশন দেওয়া
        for (let n = 0; n < needed; n++) {
            let newImg = Math.floor(Math.random() * 10) + 1 + ".png";
            let newCard = document.createElement('div');
            newCard.className = 'cell';
            
            // কার্ডটিকে শুরুতে রীলের অনেক উপরে লুকিয়ে রাখা
            newCard.style.transform = "translateY(-400px)"; 
            newCard.style.opacity = "0";
            newCard.innerHTML = `<img src="${newImg}">`;
            
            reel.prepend(newCard); // রীলের একদম উপরে যোগ হবে

            // চোখের পলকে নিচে পড়ার এনিমেশন শুরু
            setTimeout(() => {
                newCard.style.transition = "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
                newCard.style.transform = "translateY(0)";
                newCard.style.opacity = "1";
            }, n * 100); // প্রতিটি কার্ড একে একে পড়ার জন্য ছোট ডিলে
        }
    }
}



document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();
