<?php
session_start();
include 'db.php'; 
$user_id = isset($_GET['user']) ? mysqli_real_escape_string($conn, $_GET['user']) : 0;
$display_balance = "0.00";
if($user_id > 0){
    $query = "SELECT balance FROM users WHERE id = '$user_id'";
    $result = mysqli_query($conn, $query);
    if($result && mysqli_num_rows($result) > 0){
        $u_data = mysqli_fetch_assoc($result);
        $display_balance = number_format($u_data['balance'], 2, '.', '');
    }
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuperAce Slot</title>
    <link rel="stylesheet" href="style.css">
    <style>
        #bal { color: #00ff88; }
        .win-highlight { border: 4px solid #000 !important; box-shadow: 0 0 20px #000; animation: pulseWin 0.5s infinite alternate; }
        @keyframes pulseWin { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes bounce { from { transform: scale(1); } to { transform: scale(1.3); } }
    </style>
</head>
<body>
<div id="free-spin-info" style="display:none; position:absolute; top:10px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.9); padding:8px 20px; border-radius:30px; color:#ffdf1b; font-weight:bold; z-index:100; border:1px solid #ffdf1b;">
    FREE SPINS: <span id="fs-count">0/10</span>
</div>
<div id="big-win-overlay" style="display:none; position:absolute; top:40%; left:50%; transform:translate(-50%, -50%); text-align:center; z-index:200; pointer-events:none; width: 100%;">
    <h1 id="big-win-text" style="font-size:70px; color:#ffdf1b; text-shadow:0 0 30px #000; margin:0; animation: bounce 0.5s infinite alternate;">0.00</h1>
    <div id="total-fs-win" style="display:none; margin-top: 20px;"><span style="background:#ffdf1b; color:#000; padding:12px 25px; border-radius:15px; font-weight:bold; font-size:22px;">TOTAL WIN: ৳<span id="fs-total-val">0</span></span></div>
</div>
<div class="game-container">
    <div class="slot-machine">
        <div id="r1" class="reel"></div><div id="r2" class="reel"></div><div id="r3" class="reel"></div><div id="r4" class="reel"></div><div id="r5" class="reel"></div>
    </div>
    <div class="controls">
        <div class="status-row"><span>WIN: <b id="win">0.00</b></span><span>BAL: <b id="bal"><?php echo $display_balance; ?></b></span></div>
        <div class="action-row"><button class="btn-small" id="auto-btn">AUTO</button><div class="bet-area"><div class="bet-controls"><button class="bet-btn" id="bet-minus">-</button><span id="bet-val">0.50</span><button class="bet-btn" id="bet-plus">+</button></div></div><button class="btn-small" id="turbo-btn">TURBO</button></div>
        <div class="main-btn-container" style="display: flex; justify-content: center;"><button class="spin-btn" id="spin-trigger">Spin</button></div>
    </div>
</div>
<script src="script.js"></script>
<div id="coin-container"></div>
<script>
    var php_user_id = "<?php echo $user_id; ?>";
    var php_initial_balance = <?php echo $display_balance; ?>;
    window.onload = function() { if(document.getElementById('bal')) document.getElementById('bal').innerText = parseFloat(php_initial_balance).toFixed(2); };
</script>
</body></html>
                
