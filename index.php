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
        <!-- ফুটার সেকশনে এটি এভাবে সাজান -->
<div class="footer">
    <div class="bet-win-container">
        <!-- মাইনাস বাটন -->
        <button class="bet-adjust" onclick="changeBet(-10)">-</button>
        
        <!-- টোটাল উইন বক্স (মাঝখানে থাকবে) -->
        <div class="win-box-mini">
    <!-- বর্তমান বেট কত তা এখানে দেখাবে -->
    <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 3px; margin-bottom: 3px;">
        <small style="font-size: 8px; color: #888; display: block;">BET</small>
        <div id="current-bet" style="font-size: 14px; font-weight: bold; color: gold;">10.00</div>
    </div>
    
    <!-- টোটাল উইন এখানে দেখাবে -->
    <small style="font-size: 8px; color: #888; display: block;">TOTAL WIN</small>
    <div id="win-amount" style="font-size: 18px; font-weight: bold; color: #fff;">0.00</div>
</div>

        
        <!-- প্লাস বাটন -->
        <button class="bet-adjust" onclick="changeBet(10)">+</button>
    </div>

    <div class="mode-section">
        <button id="turbo-btn" class="mini-btn">TURBO</button>
        <button id="auto-btn" class="mini-btn">AUTO</button>
    </div>

    <button id="spin-btn">SPIN</button>
</div>

    </div>
    <script>
        const userId = <?php echo isset($uid) ? $uid : 1; ?>;
    </script>
    <script src="sound_manager.js"></script>
<script src="animations.js"></script> <!-- নতুন এনিমেশন ফাইল -->
<script src="script.js"></script>

</body>
</html>

    
