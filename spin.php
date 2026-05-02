<?php
include 'db.php';
header('Content-Type: application/json');

$user_id = $_POST['user_id'] ?? 0;
$bet = floatval($_POST['bet'] ?? 0);

$res = $conn->query("SELECT balance FROM users WHERE id = '$user_id'");
$user = $res->fetch_assoc();

if (!$user || $user['balance'] < $bet) {
    echo json_encode(["status" => "error", "message" => "Insufficient Balance"]);
    exit;
}

$symbols = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
$reels = [];
for ($i = 0; $i < 5; $i++) {
    $col = [];
    for ($j = 0; $j < 4; $j++) { $col[] = $symbols[array_rand($symbols)]; }
    $reels[] = $col;
}

$win_chance = rand(1, 100);
$win_amount = 0; $is_win = false; $win_symbol = "";

if ($win_chance <= 30) {
    $is_win = true;
    $win_symbol = $symbols[array_rand($symbols)];
    $multipliers = [1, 2, 5, 10, 20];
    $win_amount = $bet * $multipliers[array_rand($multipliers)];
}

$new_balance = $user['balance'] - $bet + $win_amount;
$conn->query("UPDATE users SET balance = '$new_balance' WHERE id = '$user_id'");
$scatter_count = 0;
foreach ($reels as $col) {
    foreach ($col as $sym) {
        if ($sym === 'SCATTER.png') $scatter_count++; 
    }
}
$free_spins_won = ($scatter_count >= 3) ? 10 : 0;
echo json_encode([
    "status" => "success",
    "reels" => $reels,
    "win" => number_format($win_amount, 2, '.', ''),
    "new_balance" => number_format($new_balance, 2, '.', ''),
    "is_win" => $is_win,
    "win_symbol" => $win_symbol,
    "free_spins" => $free_spins_won,
    "scatter_count" => $scatter_count
]);

