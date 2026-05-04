// ১. সাউন্ড অবজেক্ট তৈরি (সরাসরি ফাইল নেম ব্যবহার করা হয়েছে)
const sounds = {
    click: new Audio('click.mp3'),
    win: new Audio('win.mp3'),
    stop: new Audio('stop.mp3'),
    bigwin: new Audio('bigwin.mp3'),
    wild: new Audio('wild.mp3'),
    scatter: new Audio('scatter.mp3')
};

// ২. সাউন্ড বাজানোর মাস্টার ফাংশন
function playS(name) {
    if (sounds[name]) {
        try {
            // সাউন্ডটি আগে থেকে বাজতে থাকলে তা থামিয়ে শুরু থেকে প্লে করবে
            sounds[name].pause();
            sounds[name].currentTime = 0;

            // প্লে করার সময় প্রমিজ হ্যান্ডেল করা (ব্রাউজার এরর এড়াতে)
            let playPromise = sounds[name].play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log(name + " বাজাতে সমস্যা হয়েছে:", error);
                });
            }
        } catch (e) {
            console.warn("Audio play error:", e);
        }
    }
}
