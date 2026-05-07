<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Super Ace Final</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <!-- মেইন ব্যালেন্স ও ফ্রি স্পিন বার্ডল -->
        <div class="top-bar">
            <div>BALANCE: ৳<span id="balance">1000.00</span></div>
            <div id="fs-info" style="display: none; color: red; font-weight: bold;">FREE SPIN: <span id="fs-count">0</span></div>
        </div>

        <!-- মাল্টিপ্লায়ার মিটার -->
        <div class="multiplier-container">
            <div class="mult-box active" id="m1">X1</div>
            <div class="mult-box" id="m2">X2</div>
            <div class="mult-box" id="m3">X3</div>
            <div class="mult-box" id="m5">X5</div>
        </div>

        <!-- ৫টি রীল কন্টেইনার (গেম বোর্ড) -->
        <div class="reels-container">
            <div class="reel" id="reel-0"><div><img src="8.png"></div><div><img src="8.png"></div><div><img src="8.png"></div><div><img src="8.png"></div></div>
            <div class="reel" id="reel-1"><div><img src="8.png"></div><div><img src="8.png"></div><div><img src="8.png"></div><div><img src="8.png"></div></div>
            <div class="reel" id="reel-2"><div><img src="8.png"></div><div><img src="8.png"></div><div><img src="8.png"></div><div><img src="8.png"></div></div>
            <div class="reel" id="reel-3"><div><img src="8.png"></div><div><img src="8.png"></div><div><img src="8.png"></div><div><img src="8.png"></div></div>
            <div class="reel" id="reel-4"><div><img src="8.png"></div><div><img src="8.png"></div><div><img src="8.png"></div><div><img src="8.png"></div></div>
        </div>

        <!-- উইন বক্স এবং কন্ট্রোল বাটন -->
        <div class="control-panel">
            <button onclick="changeBet(-1.00)">-</button>
            <div class="bet-box">BET: ৳<span id="current-bet">1.00</span></div>
            <button onclick="changeBet(1.00)">+</button>
            
            <div class="win-box">WIN: ৳<span id="win-amount">0.00</span></div>
            
            <button id="spin-btn" onclick="handleSpinButton()">SPIN</button>
        </div>
    </div>

    <!-- স্ক্রিপ্ট সিরিয়াল লোডিং -->
    <script src="sound_manager.js"></script>
    <script src="animations.js"></script>
    <script src="script.js"></script>
</body>
</html>
