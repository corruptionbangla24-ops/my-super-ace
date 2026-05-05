// ১. সাউন্ডের তালিকা (যাতে ব্রাউজার ফাইলগুলো চেনে)
const sounds = {
    click: new Audio('click.mp3'),
    spin: new Audio('spin.mp3'),
    win: new Audio('win.mp3'),
    stop: new Audio('stop.mp3'),
    scatter: new Audio('scatter.mp3'),
    bigwin: new Audio('bigwin.mp3')
};

// ২. বাজানোর ফাংশন (এটিই আসল কাজ করবে)
function playS(name) {
    // যদি আপনি Sound: OFF করে রাখেন, তবে বাজবে না
    if (typeof isMuted !== 'undefined' && isMuted) return;

    if (sounds[name]) {
        try {
            // আগের সাউন্ড চললে তা থামিয়ে শুরু থেকে বাজাবে
            sounds[name].pause();
            sounds[name].currentTime = 0;
            
            let p = sounds[name].play();
            if (p !== undefined) {
                p.catch(e => console.log("সাউন্ড প্লে হতে বাধা পেয়েছে।"));
            }
        } catch (e) {
            console.error("সাউন্ড ফাইলে সমস্যা:", e);
        }
    }
}
