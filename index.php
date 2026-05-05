<?php 
// ইউজার আইডি গেট করা (লিংক থেকে uid=1 না থাকলেও ডিফল্ট ১ ধরবে)
$uid = isset($_GET['uid']) ? intval($_GET['uid']) : 1; 
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Super Ace Pro API</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="api-wrapper">
        <!-- হেডার সেকশন: হোম বাটন, ব্যালেন্স এবং সাউন্ড -->
        <div class="header">
            <button class="nav-btn" onclick="location.reload()">Home</button>
            <div class="balance-container">
                <small>BALANCE</small>
                <div id="balance">0.00</div>
            </div>
            <button class="nav-btn" id="sound-toggle">Sound: ON</button>
        </div>

        <!-- মাল্টিপ্লায়ার বার -->
        <div class="m-bar">
            <span id="m1" class="active">x1</span>
            <span id="m2">x2</span>
            <span id="m3">x3</span>
            <span id="m5">x5</span>
        </div>

        <!-- ৫টি রীল কন্টেইনার -->
        <div class="reel-container">
            <div class="reel" id="reel-0"></div>
            <div class="reel" id="reel-1"></div>
            <div class="reel" id="reel-2"></div>
            <div class="reel" id="reel-3"></div>
            <div class="reel" id="reel-4"></div>
        </div>

        <!-- ফুটার সেকশন: উইন ডিসপ্লে এবং স্পিন বাটন -->
        <div class="footer">
            <div id="fs-info" style="display:none; color: gold; font-weight: bold; margin-bottom: 5px;">
                FREE SPINS: <span id="fs-count">0</span>
            </div>
            <div class="win-box">
                <small>TOTAL WIN</small>
                <div id="win-amount">0.00</div>
            </div>
            <button id="spin-btn">SPIN</button>
        </div>
    </div>

    <!-- জাভাস্ক্রিপ্টে ইউজার আইডি পাঠানো -->
    <script>
       const userId = 1; 
 
    </script>
    <script src="sound_manager.js"></script>
    <script src="script.js"></script>
</body>
</html>
