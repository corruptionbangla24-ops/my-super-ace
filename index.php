<?php $user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1; ?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Ace Pro</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <!-- হেডার: হোম, ব্যালেন্স, সাউন্ড -->
        <div class="header-section">
            <button class="top-btn">Home</button>
            <div class="balance-area">
                <span class="lbl">BALANCE</span>
                <span id="balance">1739076.40</span>
            </div>
            <!-- index.php এ ব্যালেন্স বক্সের ঠিক নিচে এটি দিন -->
<div id="fs-info" style="display:none; color:#ffd700; font-weight:bold; font-size:14px; text-align:center;">
    FREE SPINS: <span id="fs-count">0</span>
</div>

            <button class="top-btn">Sound: ON</button>
        </div>

        <!-- মাল্টিপ্লায়ার বার -->
        <div class="multiplier-bar">
            <div id="x1" class="multi-box active">x1</div>
            <div id="x2" class="multi-box">x2</div>
            <div id="x3" class="multi-box">x3</div>
            <div id="x5" class="multi-box">x5</div>
        </div>

        <!-- ৫x৪ গেম বোর্ড -->
        <div class="board-grid">
            <?php for ($c = 0; $c < 5; $c++): ?>
                <div class="column" id="reel-<?php echo $c; ?>">
                    <?php for ($r = 0; $r < 4; $r++): ?>
                        <div class="cell"><img src="card_back.png"></div>
                    <?php endfor; ?>
                </div>
            <?php endfor; ?>
        </div>

        <!-- গোল্ডেন কন্ট্রোল প্যানেল (স্ক্রিনশট অনুযায়ী) -->
        <div class="control-panel">
            <button class="circle-btn" onclick="changeBet(-10)">−</button>
            
            <div class="golden-display-box">
                <div class="bet-section">
                    <span class="small-lbl">BET</span>
                    <span id="current-bet">10.00</span>
                </div>
                <div class="win-section">
                    <span class="small-lbl-gold">TOTAL WIN</span>
                    <span id="win-amount">0.00</span>
                </div>
            </div>

            <button class="circle-btn" onclick="changeBet(10)">+</button>
        </div>
<!-- নিচের মেইন বাটন সেকশন -->
<div class="main-action-area">
    <button id="turbo-btn" class="mode-btn side-btn">TURBO</button>
    
    <div class="spin-wrapper">
        <button id="spin-btn" onclick="handleSpin()">SPIN</button>
    </div>
    
    <button id="auto-btn" class="mode-btn side-btn">AUTO</button>
</div>

    <script>const userId = <?php echo $user_id; ?>;</script>
<!-- ৭০ নম্বর লাইনের আগে এটি যোগ করুন -->
<script src="sound_manager.js"></script> 
<script src="animations.js"></script>
<script src="script.js"></script>

</body>
</html>
