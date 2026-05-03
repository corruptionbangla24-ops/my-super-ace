<?php include 'db.php'; 
$user_id = 1; // উদাহরণ
$res = $conn->query("SELECT balance FROM users WHERE id = $user_id");
$user = $res->fetch_assoc();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Super Ace Turbo</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-box">
        <div class="multiplier"> <span class="active">x1</span> <span>x2</span> <span>x3</span> <span>x5</span> </div>
        <div class="grid">
            <?php for($i=0; $i<5; $i++): ?>
                <div class="reel" id="reel-<?=$i?>">
                    <?php for($j=0; $j<4; $j++): ?><div class="cell"><img src="1.png"></div><?php endfor; ?>
                </div>
            <?php endfor; ?>
        </div>
        <div class="footer">
            <div class="info">BAL: <span id="bal"><?=number_format($user['balance'], 2)?></span> | WIN: <span id="win">0.00</span></div>
            <div class="btns">
                <button id="turbo">TURBO OFF</button>
                <button id="spin">SPIN</button>
            </div>
        </div>
    </div>
    <script> const userId = <?=$user_id?>; </script>
    <script src="script.js"></script>
</body>
</html>
