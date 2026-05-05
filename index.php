<?php $uid = isset($_GET['uid']) ? intval($_GET['uid']) : 1; ?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Super Ace API Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="api-wrapper">
        <!-- হেডার: ব্যালেন্স ও হোম বাটন -->
        <div class="header">
            <button class="nav-btn" onclick="window.location.href='index.php'">Home</button>
            <div class="balance-container">
                <small>BALANCE</small>
                <div id="balance">0.00</div>
            </div>
            <button class="nav-btn" id="sound-btn">Sound</button>
        </div>

        <!-- মাল্টিপ্লায়ার বার -->
        <div class="m-bar">
            <span id="m1" class="active">x1</span>
            <span id="m2">x2</span>
            <span id="m3">x3</span>
            <span id="m5">x5</span>
        </div>

        <!-- মেইন গেম রীল -->
        <div class="reel-container">
            <div class="reel" id="reel-0"></div>
            <div class="reel" id="reel-1"></div>
            <div class="reel" id="reel-2"></div>
            <div class="reel" id="reel-3"></div>
            <div class="reel" id="reel-4"></div>
        </div>

        <!-- উইন ডিসপ্লে এবং স্পিন বাটন -->
        <div class="footer">
            <div class="win-box">
                <small>TOTAL WIN</small>
                <div id="win-amount">0.00</div>
            </div>
            <button id="spin-btn">SPIN</button>
        </div>

        <!-- ফ্রি স্পিন কাউন্টার -->
        <div id="fs-info" style="display:none;">
            FREE SPINS: <span id="fs-count">0</span>
        </div>
    </div>

    <script>const userId = <?php echo $uid; ?>;</script>
    <script src="sound_manager.js"></script>
    <script src="script.js"></script>
</body>
</html>
