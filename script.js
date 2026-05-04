let queue = [], isSpinning = false, isTurbo = false;

// ১. ডাটা লোড করা
async function loadBatch() {
    try {
        let r = await fetch(`spin_generator.php?uid=${userId}`);
        let d = await r.json();
        queue = d.results;
    } catch (e) { console.log("Load error:", e); }
}

// ২. মেইন স্পিন ফাংশন
async function handleSpin() {
    if (isSpinning || queue.length === 0) return;
    isSpinning = true;
    
    playS('click');
    playS('spin');
    
    let data = queue.shift();
    
    // রীল ঘোরার এনিমেশন শুরু
    document.querySelectorAll('.reel').forEach(r => r.classList.add('reel-spinning'));

    let delay = isTurbo ? 100 : 800;

    setTimeout(async () => {
        // ৩. রীল রেন্ডার করা
        data.reels.forEach((col, i) => {
            let el = document.getElementById(`reel-${i}`);
            el.classList.remove('reel-spinning');
          el.innerHTML = col.map((c, j) => {
    // যদি ছবির নাম wild.png হয়, তবে wild-explosion ক্লাস যোগ হবে
    let isW = (c.s === 'wild.png'); 
    return `<div class="cell ${c.g?'golden':''} ${isW?'wild-explosion':''}" id="c-${i}-${j}">
                <img src="${c.s}">
            </div>`;
}).join('');
  
        });
        
        playS('stop');

          // --- ১০০০০০০০০০% একুরেট উইন লজিক শুরু ---
        if (data.win_pos && data.win_pos.length > 0) {
            await new Promise(r => setTimeout(r, 600)); // উইন দেখার বিরতি

            // ধাপ ১: কার্ড ভ্যানিশ এবং Wild তৈরি (স্থির থাকবে)
            data.win_pos.forEach(p => {
                let cell = document.getElementById(`c-${p.c}-${p.r}`);
                if (cell) {
                    let isGolden = cell.classList.contains('golden');
                    cell.style.transition = "all 0.4s ease";
                    cell.style.transform = "scale(0)";
                    cell.style.opacity = "0";

                    if (isGolden) {
                        setTimeout(() => {
                            let wild = document.createElement('div');
                            // শুরুতে win-highlight দেব না যাতে এটি সাথে সাথে উধাও না হয়
                            wild.className = 'cell wild-explosion cell-fall'; 
                            wild.id = `c-${p.c}-${p.r}`; 
                            wild.innerHTML = '<img src="wild.png">';
                            cell.parentElement.appendChild(wild);
                            playS('wild');
                        }, 350);
                    }
                }
            });

            // ধাপ ২: ওপর থেকে সাধারণ কার্ড পড়ে প্রথম ফিলআপ (Wild রয়ে যাবে)
            setTimeout(() => {
                processCascade(); 
            }, 800);

            // ধাপ ৩: ফিলআপ শেষ হওয়ার পর Wild কার্ডগুলো ভ্যানিশ করা
            await new Promise(r => setTimeout(r, 2000)); // রিফিল শেষ হওয়ার সময়

            let wildOnScreen = document.querySelectorAll('.wild-explosion');
            if (wildOnScreen.length > 0) {
                wildOnScreen.forEach(w => {
                    w.style.transition = "all 0.4s ease";
                    w.style.transform = "scale(0)";
                    w.style.opacity = "0";
                    w.classList.add('win-highlight'); // চেনার জন্য ক্লাস যোগ করা
                });

                // ধাপ ৪: Wild উধাও হওয়ার পর শেষবার রিফিল
                setTimeout(() => {
                    processCascade(); 
                }, 500);
            }
        }
        // --- লজিক শেষ ---


        // ব্যালেন্স আপডেট
        document.getElementById('bal-val').innerText = data.bal;
        document.getElementById('win-amount').innerText = data.win;
        
        isSpinning = false;
        if (queue.length < 5) loadBatch();
        
    }, delay);
}
function processCascade() {
    for (let i = 0; i < 5; i++) {
        let reel = document.getElementById(`reel-${i}`);
        let cells = Array.from(reel.querySelectorAll('.cell'));

        // ১. উধাও হওয়া কার্ড এবং পুরনো ওয়াইল্ড কার্ড পরিষ্কার করা
        cells.forEach(c => {
            // যদি কার্ডটি ছোট হয়ে যায় (scale 0) অথবা সেটি আমাদের সেই হাইলাইট হওয়া উইনিং কার্ড হয়
            if (c.style.opacity === "0" || c.style.transform === "scale(0)" || c.classList.contains('win-highlight')) {
                c.remove();
            }
        });

        // ২. খালি জায়গা হিসেব করে নতুন কার্ড যোগ করা
        let remaining = reel.querySelectorAll('.cell').length;
        let missing = 4 - remaining;

        for (let n = 0; n < missing; n++) {
            let newImg = Math.floor(Math.random() * 10 + 1) + ".png";
            let newCard = document.createElement('div');
            newCard.className = 'cell cell-fall'; 
            newCard.innerHTML = `<img src="${newImg}">`;
            
            // রীলের শুরুতে (উপরে) নতুন কার্ডটি ঢুকানো
            reel.prepend(newCard); 
        }
    }
    // কার্ড পড়ার সাউন্ড
    playS('drop');
}



// বাটন কানেক্ট করা
document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();
