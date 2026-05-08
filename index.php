<?php
$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Ace Casino</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <!-- ১. ওপরের মেইন কন্ট্রোল এবং ব্যালেন্স ডিসপ্লে -->
        <div class="header-container">
            <button class="nav-btn">Home</button>
            <div class="balance-box">
                <span class="label">BALANCE</span>
                <span id="balance">1739076.40</span>
            </div>
            <button class="nav-btn" id="sound-btn">Sound: ON</button>
        </div>

        <!-- ২. মাল্টিপ্লায়ার বার (আপনার স্ক্রিনশটের মতো ক্লাসিক থিম) -->
        <div class="multiplier-bar">
            <div id="x1" class="multi-box active">x1</div>
            <div id="x2" class="multi-box">x2</div>
            <div id="x3" class="multi-box">x3</div>
            <div id="x5" class="multi-box">x5</div>
        </div>

        <!-- ৩. ৫টি কলাম এবং ৪টি সারির মেইন গেম বোর্ড (১০২৪ ওয়েজ গ্রিড) -->
        <div class="game-board">
            <?php for ($c = 0; $c < 5; $c++): ?>
                <div class="reel" id="reel-<?php echo $c; ?>">
                    <?php for ($r = 0; $r < 4; $r++): ?>
                        <div class="card-cell">
                            <img src="card_back.png" alt="Card">
                        </div>
                    <?php endfor; ?>
                </div>
            <?php endfor; ?>
        </div>

        <!-- ৪. বেট কন্ট্রোল ও উইন ডিসপ্লে প্যানেল (গোল্ডেন বর্ডার থিম) -->
        <div class="control-panel">
            <button class="bet-btn minus" onclick="changeBet(-10)">−</button>
            
            <div class="info-center-box">
                <div class="bet-display">
                    <span class="lbl">BET</span>
                    <span id="current-bet">10.00</span>
                </div>
                <div class="win-display">
                    <span class="lbl-win">TOTAL WIN</span>
                    <span id="win-amount">0.00</span>
                </div>
            </div>

            <button class="bet-btn plus" onclick="changeBet(10)">+</button>
        </div>

        <!-- ৫. অটো ও টার্বো মোড বাটন সেকশন -->
        <div class="mode-container">
            <button class="mode-btn" id="turbo-btn">TURBO</button>
            <button class="mode-btn" id="auto-btn">AUTO</button>
        </div>

        <!-- ৬. রাজকীয় মেইন স্পিন বাটন -->
        <div class="spin-container">
            <button id="spin-btn" onclick="handleSpin()">SPIN</button>
        </div>
    </div>

    <!-- গেম আইডি পাস করার জন্য গ্লোবাল ভ্যারিয়েবল -->
    <script>
        const userId = <?php echo $user_id; ?>;
    </script>
    <script src="animations.js"></script>
    <script src="script.js"></script>
</body>
</html>
