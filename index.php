<?php
// ইউজার আইডি গেট করা (না থাকলে ১ সেট হবে)
$user_id = isset($_GET['uid']) ? intval($_GET['uid']) : 1;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <!-- মোবাইল স্ক্রিন ফিট করার মাস্টার লাইন -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Super Ace Slot Mobile</title>
    <link rel="stylesheet" href="style.css">
    <style>
        /* দ্রুত লোড হওয়ার জন্য কিছু বেসিক সিএসএস এখানেও দেওয়া হলো */
        body { margin: 0; background: #000; color: #fff; font-family: sans-serif; }
        .game-container { width: 100vw; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; padding: 10px 5px; box-sizing: border-box; }
        .multiplier-bar { display: flex; justify-content: space-around; background: #111; padding: 5px; border-radius: 5px; }
        .multiplier-bar span { padding: 5px 12px; border-radius: 4px; color: #555; font-weight: bold; transition: 0.3s; }
        .multiplier-bar span.active { background: gold; color: #000; box-shadow: 0 0 10px gold; }
        .reel-container { display: flex; justify-content: space-between; gap: 3px; width: 100%; }
        .reel { flex: 1; display: flex; flex-direction: column; gap: 3px; }
        .info-row { display: flex; justify-content: space-between; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-top: 5px; }
        .box { text-align: center; flex: 1; }
        .box small { color: gold; font-size: 10px; display: block; margin-bottom: 2px; }
        .box div { font-size: 18px; font-weight: bold; }
        #spin-btn { width: 90%; margin: 15px auto; height: 55px; background: linear-gradient(180deg, #ff0000, #800000); border: none; border-radius: 50px; color: #fff; font-size: 22px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(255,0,0,0.4); }
        #spin-btn:active { transform: scale(0.95); }
    </style>
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

    <!-- ২. রীল কন্টেইনার (৫টি রীল পাশাপাশি থাকবে) -->
    <div class="reel-container">
        <div class="reel" id="reel-0"></div>
        <div class="reel" id="reel-1"></div>
        <div class="reel" id="reel-2"></div>
        <div class="reel" id="reel-3"></div>
        <div class="reel" id="reel-4"></div>
    </div>

    <!-- ৩. ব্যালেন্স এবং উইন ইনফো -->
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

    <!-- ৪. ফ্রি স্পিন কাউন্টার (এটি দরকার হলে জাভাস্ক্রিপ্ট দেখাবে) -->
    <div id="free-spin-info" style="display: none; color: gold; text-align: center; font-weight: bold; margin-top: 5px;">
        FREE SPINS LEFT: <span id="fs-count">0</span>
    </div>

    <!-- ৫. মেইন স্পিন বাটন -->
    <button id="spin-btn">SPIN</button>
</div>

<!-- জাভাস্ক্রিপ্ট ভেরিয়েবল পাস করা -->
<script>
    const userId = <?php echo $user_id; ?>;
</script>

<!-- স্ক্রিপ্ট ফাইল কানেক্ট করা -->
<script src="sound_manager.js"></script>
<script src="script.js"></script>

</body>
</html>
