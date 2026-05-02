<?php
session_start();
include 'db.php';
$user_id = $_GET['user'] ?? 0;
$display_balance = "0.00";
if($user_id > 0){
    $res = $conn->query("SELECT balance FROM users WHERE id = '$user_id'");
    if($row = $res->fetch_assoc()) $display_balance = number_format($row['balance'], 2, '.', '');
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuperAce Ultimate Slot</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<div class="game-container">
    <div class="slot-machine">
        <div id="r1" class="reel"></div><div id="r2" class="reel"></div><div id="r3" class="reel"></div><div id="r4" class="reel"></div><div id="r5" class="reel"></div>
    </div>
    <div class="controls">
        <div class="status-row">
            <span>WIN: <b id="win">0.00</b></span>
            <span>BAL: <b id="bal"><?php echo $display_balance; ?></b></span>
        </div>
        <div class="action-row">
            <button class="btn-small" id="auto-btn">AUTO</button>
            <div class="bet-area">
                <div class="bet-controls">
                    <button class="bet-btn" id="bet-minus">-</button>
                    <span id="bet-val">10.00</span>
                    <button class="bet-btn" id="bet-plus">+</button>
                </div>
            </div>
            <button class="btn-small" id="turbo-btn">TURBO</button>
        </div>
        <div class="main-btn-container">
            <button class="spin-btn" id="spin-trigger">Spin</button>
        </div>
    </div>
</div>
<div id="coin-container"></div>
<script> 
    var php_user_id = "<?php echo $user_id; ?>"; 
    var php_initial_balance = <?php echo $display_balance; ?>; 
</script>
<script src="script.js"></script>
</body>
</html>
