leteue = [], isSpinning = false, isTurbo = false;
let freeSpinCount = 0, isFreeMode = false;
let currentMultiplier = 1; 
const normalMulti = [1, 2, 3, 5];
const freeMulti = [2, 4, 6, 10];



// ১. ডাটা লোড করা
async function loadBatch() {
    try {
        // নিশ্চিত করুন userId ভেরিয়েবলটি আপনার index.php থেকে আসছে
        let url = `spin_generator.php?uid=${userId}${isFreeMode ? '&mode=free' : ''}`;
        let r = await fetch(url);
        let d = await r.json();
        if (d.results) {
            queue = d.results;
        }
    } catch (e) { 
        console.log("Load error:", e); 
    }
}

// ২. মাল্টিপ্লায়ার ডিসপ্লে আপডেট করা
function updateMultiplierDisplay(level) {
    document.querySelectorAll('.multiplier-bar span').forEach(s => {
        s.classList.remove('active');
    });
    let mElement = document.getElementById('m' + level);
    if (mElement) {
        mElement.classList.add('active');
    }
}



// ২. মেইন স্পিন ফাংশন
async function handleSpin() {
 // ১৫ নম্বর লাইনের জায়গায় এটি বসান
if (isSpinning) return; 
    if (queue.length === 0) {
        loadBatch();
        return;
    }
   
    isSpinning = true;
    currentMultiplier = isFreeMode ? 2 : 1;
    updateMultiplierDisplay(currentMultiplier);

           
    if (isFreeMode) {
        freeSpinCount--; // এক এক করে কমাবে
        
        // এই লাইনটিই আপনার স্ক্রিনের ১০ সংখ্যাটিকে কমিয়ে আপডেট করবে
        let fsDisplay = document.getElementById('fs-count');
        if (fsDisplay) {
            fsDisplay.innerText = freeSpinCount;
        }
        
        currentMultiplier = 2; // ফ্রি গেমে x2 থেকে শুরু
    } else {
        currentMultiplier = 1; // সাধারণ গেমে x1 থেকে শুরু
    }
 
    updateMultiplierDisplay(currentMultiplier);

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
                // ৩টি বা তার বেশি ৯ নম্বর কার্ড চেক করার চূড়ান্ত লজিক
                let scatters = 0;
        data.reels.forEach(col => {
            col.forEach(c => {
                if (c.s === '9.png') scatters++;
            });
        });

        if (scatters >= 3 && !isFreeMode) {
            console.log("Scatter Found: " + scatters);
            playS('scatter');

            
            // সব ৯ নম্বর কার্ডগুলোতে সবুজ আভা দেওয়া
            document.querySelectorAll('img[src="9.png"]').forEach(img => {
                img.parentElement.classList.add('scatter-glow');
            });
            
            // ২ সেকেন্ড পর ফ্রি স্পিন শুরু করা
            setTimeout(() => {
                if (typeof startFreeGames === "function") {
                    startFreeGames();
                } else {
                    console.error("startFreeGames function is missing!");
                    if (data.win_pos && data.win_pos.length > 0) {
            // ১. মাল্টিপ্লায়ার লেভেল সেট করা
            let levels = isFreeMode ? [2, 4, 6, 10] : [1, 2, 3, 5];
            let currentIdx = levels.indexOf(currentMultiplier);
            
            if (currentIdx < levels.length - 1) {
                currentMultiplier = levels[currentIdx + 1];
            }

            // ২. স্ক্রিনে ডিসপ্লে এবং উইন আপডেট করা
            updateMultiplierDisplay(currentMultiplier);
            
            let totalWin = parseFloat(data.win) * currentMultiplier;
            document.getElementById('win-amount').innerText = totalWin.toFixed(2);
            
            playS('calculation'); 

            // ৩. উইন হাইলাইট করা (আপনার ১১৫ নম্বর লাইন থেকে যা শুরু হয়েছে)
            data.win_pos.forEach(p => {
                let cell = document.getElementById(`c-${p.c}-${p.r}`);
                if (cell) cell.classList.add('win-highlight');
            });
            playS('win');
        }
                }
            }, 2000);
        }

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

        // ফ্রি স্পিন অটোমেটিক চালানোর লজিক
        isSpinning = false;
        if (isFreeMode && freeSpinCount > 0) {
            setTimeout(function() {
                handleSpin();
            }, 2000);
        } else if (isFreeMode && freeSpinCount === 0) {
            isFreeMode = false;
            alert("ফ্রি স্পিন শেষ!");
            resetToNormalMode();
        }

        if (queue.length < 5) loadBatch();
    }, delay);
}

function startFreeGames() {
    isFreeMode = true;
    freeSpinCount = 10;
    isSpinning = false;

    if(document.getElementById('m1')) {
        document.getElementById('m1').innerText = "x2";
        document.getElementById('m2').innerText = "x4";
        document.getElementById('m3').innerText = "x6";
        document.getElementById('m5').innerText = "x10";
    }

    if(document.getElementById('free-spin-info')) {
        document.getElementById('free-spin-info').style.display = 'block';
        document.getElementById('fs-count').innerText = freeSpinCount;
    }

    alert("🎰 অভিনন্দন! ১০টি ফ্রি স্পিন শুরু হচ্ছে! 🎰");
    
    setTimeout(function() {
        handleSpin();
    }, 1500);
}
function resetToNormalMode() {
    isFreeMode = false;
    freeSpinCount = 0;
    currentMultiplier = 1;

    // ১. মাল্টিপ্লায়ার টেক্সট রিসেট (x1, x2, x3, x5)
    document.getElementById('m1').innerText = "x1";
    document.getElementById('m2').innerText = "x2";
    document.getElementById('m3').innerText = "x3";
    document.getElementById('m5').innerText = "x5";

    // ২. গ্লো এবং বর্ডার সরিয়ে ফেলা
    let container = document.querySelector('.game-container');
    if (container) {
        container.style.borderColor = "#333";
        container.style.boxShadow = "none";
    }
    
    // ৩. ফ্রি স্পিন কাউন্টার লুকিয়ে ফেলা
    let fsInfo = document.getElementById('free-spin-info');
    if (fsInfo) fsInfo.style.display = 'none';
    
    updateMultiplierDisplay(1); // x1 কে হাইলাইট করা
    console.log("গেম এখন সাধারণ মোডে ফিরেছে।");
}


// বাটন কানেক্ট করা (এই লাইনটি খুব জরুরি)
document.getElementById('spin-btn').onclick = handleSpin;
loadBatch();



