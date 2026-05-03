<?php 
include 'db.php'; 

// ইউজার ডাটা ফেচ (ধরে নিচ্ছি ইউজার আইডি ১)
$user_id = 1; 
$res = $conn->query("SELECT balance FROM users WHERE id = $user_id");
$user = $res->fetch_assoc();
$balance = $user ? $user['balance'] : 0.00;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Ace Pro</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <!-- মাল্টিপ্লায়ার ডিসপ্লে -->
        <div class="multiplier-bar">
            <span id="m1" class="active">x1</span>
            <span id="m2">x2</span>
            <span id="m3">x3</span>
            <span id="m5">x5</span>
        </div>

        <!-- ৫ রীল, ৪ রো এর মূল স্লট গ্রিড -->
        <div class="slot-machine">
            <?php for($i=0; $i<5; $i++): ?>
                <div class="reel" id="reel-<?= $i ?>">
                    <?php for($j=0; $j<4; $j++): ?>
                        <div class="cell"><img src="1.png"></div>
                    <?php endfor; ?>
                </div>
            <?php endfor; ?>
        </div>

        <!-- কন্ট্রোল প্যানেল -->
        <div class="controls">
            <div class="display-row">
                <div class="info-box">
                    <small>BALANCE</small>
                    <div id="bal-val"><?= number_format($balance, 2) ?></div>
                </div>
                <div class="info-box">
                    <small>WIN</small>
                    <div id="win-amount">0.00</div>
                </div>
            </div>

            <div class="action-row">
                <button id="turbo-btn">TURBO OFF</button>
                <button id="spin-btn">SPIN</button>
            </div>
        </div>
    </div>

    <!-- গ্লোবাল ভেরিয়েবল পাস করা -->
    <script>
        const userId = <?= $user_id ?>;
        let currentBalance = <?= $balance ?>;
        <script src="sound_manager.js"></script>
    <script src="script.js"></script>

</body>
</html>
