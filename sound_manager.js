// ১. সাউন্ড অবজেক্ট তৈরি
const sounds = {
    click: new Audio('sounds/click.mp3'),
    spin: new Audio('sounds/spin.mp3'),
    win: new Audio('sounds/win.mp3'),
    drop: new Audio('sounds/drop.mp3'),
    stop: new Audio('sounds/stop.mp3'),
    bigwin: new Audio('sounds/bigwin.mp3'),
    wild: new Audio('sounds/wild.mp3'),
    scatter: new Audio('sounds/scatter.mp3'),
    calculation: new Audio('sounds/calculation.mp3')
};

// ২. সাউন্ড বাজানোর মাস্টার ফাংশন
function playS(name) {
    if (sounds[name]) {
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
    }
}
