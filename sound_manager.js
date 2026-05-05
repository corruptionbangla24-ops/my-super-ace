// ১. সাউন্ড ফাইলগুলোর অবজেক্ট তৈরি
const sounds = {
    click: new Audio('click.mp3'),
    spin: new Audio('spin.mp3'),
    win: new Audio('win.mp3'),
    stop: new Audio('stop.mp3'),
    scatter: new Audio('scatter.mp3'),
    bigwin: new Audio('bigwin.mp3')
};

// ২. সাউন্ড প্লে করার মাস্টার ফাংশন
function playS(name) {
    // script.js থেকে আসা isMuted চেক করা
    if (typeof isMuted !== 'undefined' && isMuted) {
        return; // সাউন্ড মিউট থাকলে বাজবে না
    }

    if (sounds[name]) {
        try {
            // সাউন্ডটি রিসেট করা (যাতে একটার ওপর একটা সুন্দরভাবে বাজে)
            sounds[name].pause();
            sounds[name].currentTime = 0;
            
            // সাউন্ড প্লে করা
            let playPromise = sounds[name].play();

            // ব্রাউজারের অটো-প্লে বাধা হ্যান্ডেল করা
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("সাউন্ড প্লে হতে ব্রাউজার বাধা দিয়েছে:", name);
                });
            }
        } catch (e) {
            console.error("সাউন্ড ম্যানেজার এরর:", e);
        }
    }
}
