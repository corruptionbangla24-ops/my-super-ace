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
        <!-- ১. মাল্টিপ্লায়ার বার -->
        <div class="multiplier-bar">
            <span id="m1" class="active">x1</span>
            <span id="m2">x2</span>
            <span id="m3">x3</span>
            <span id="m5">x5</span>
        </div>

        <!-- ২. রীল কন্টেইনার (এটিই ৫টি রীলকে পাশাপাশি রাখবে) -->
        <div class="reel-container">
            <div class="reel" id="reel-0"></div>
            <div class="reel" id="reel-1"></div>
            <div class="reel" id="reel-2"></div>
            <div class="reel" id="reel-3"></div>
            <div class="reel" id="reel-4"></div>
        </div>

        <!-- ৩. ইনফো রো (ব্যালেন্স ও উইন) -->
        <div class="info-row">
            <div class="box">
                <small>BALANCE</small>
                <div id="balance">0.00</div>
            </div>
            <div class="box">
                <small>WIN</small>
                <div id="win-amount">0.00</div>
            </div>
        </div>

        <!-- ৪. স্পিন বাটন -->
        <button id="spin-btn">SPIN</button>

        <!-- ৫. ফ্রি স্পিন কাউন্টার (এটি লুকিয়ে থাকবে) -->
        <div id="free-spin-info" style="display: none; color: gold; text-align: center; margin-top: 10px;">
            FREE SPINS LEFT: <span id="fs-count">0</span>
        </div>
    </div>

    <!-- স্ক্রিপ্ট কানেকশন -->
    <script>
        const userId = <?php echo isset($_GET['uid']) ? intval($_GET['uid']) : 1; ?>;
    </script>
    <script src="sound_manager.js"></script>
    <script src="script.js"></script>
</body>

</html>
