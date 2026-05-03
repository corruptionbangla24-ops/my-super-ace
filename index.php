<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Ace Pro - Turbo</title>
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

        <!-- ৫ রীল, ৪ রো এর গ্রিড -->
        <div class="slot-machine" id="slot-grid">
            <?php for($i=0; $i<5; $i++): ?>
                <div class="reel" id="reel-<?php echo $i; ?>">
                    <?php for($j=0; $j<4; $j++): ?>
                        <div class="slot-cell"><img src="1.png"></div>
                    <?php endfor; ?>
                </div>
            <?php endfor; ?>
        </div>

        <!-- কন্ট্রোল প্যানেল -->
        <div class="controls">
            <div class="win-display">
                WIN: <span id="win-amount">0.00</span>
            </div>
            
            <div class="main-buttons">
                <div class="balance-info">
                    <small>BALANCE</small>
                    <div id="balance-val">1000.00</div>
                </div>

                <!-- টার্বো এবং স্পিন বাটন -->
                <button id="turbo-btn">TURBO OFF</button>
                <button id="spin-btn">SPIN</button>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
