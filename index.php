<?php include 'db.php'; $user_id = 1; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Super Ace Pro</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <div class="multiplier-bar">
    <span id="m1" class="active">x1</span>
    <span id="m2">x2</span>
    <span id="m3">x3</span>
    <span id="m5">x5</span>
</div>

        <div class="slot-machine">
            <?php for($i=0;$i<5;$i++): ?>
                <div class="reel" id="reel-<?= $i ?>"><?php for($j=0;$j<4;$j++): ?><div class="cell"><img src="1.png"></div><?php endfor; ?></div>
            <?php endfor; ?>
        </div>
         <div id="free-spin-info" style="display: none; color: gold; text-align: center; font-weight: bold; margin-bottom: 10px; font-size: 14px;">
    FREE SPINS LEFT: <span id="fs-count">0</span>
</div>
           
        <div class="controls">
            <div class="info-row">
                <div class="box"><small>BALANCE</small><div id="bal-val">0.00</div></div>
                <div class="box"><small>WIN</small><div id="win-amount">0.00</div></div>
            </div>
            <button id="spin-btn">SPIN</button>
        </div>
    </div>
    <script>const userId = <?= $user_id ?>;</script>
    <script src="sound_manager.js"></script>
    <script src="script.js"></script>
</body>
</html>
