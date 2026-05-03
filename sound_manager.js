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

// সাউন্ড বাজানোর মাস্টার ফাংশন
function playS(name) {
    if (sounds[name]) {
        // সাউন্ড বাজানোর আগে আগের সাউন্ড থাকলে তা বন্ধ করে শুরু থেকে বাজাবে
        sounds[name].pause();
        sounds[name].currentTime = 0;
        sounds[name].play().catch(e => console.log("সাউন্ড এরর:", e));
    }
}
