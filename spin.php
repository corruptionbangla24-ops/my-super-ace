<?php
include 'db.php';
session_start();
header('Content-Type: application/json');

$user_id = $_POST['user_id'] ?? 0;
$bet_amount = floatval($_POST['bet'] ?? 0);

if ($user_id <= 0 || $bet_amount <= 0) {
    echo json_encode(["status" => "error", "message" => "Invalid Request"]); exit();
}

// ১. ব্যালেন্স চেক
$stmt = $conn->prepare("SELECT balance FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || $user['balance'] < $bet_amount) {
    echo json_encode(["status" => "error", "message" => "Insufficient Balance"]); exit();
}

// ২. সিম্বল সেটিংস ও ভ্যালু (১০২৪ ওয়েজ লজিক)
$symbols = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
$symbol_values = [
    '2.png' => 50,  // সবচেয়ে দামী
    '10.png' => 30, // দ্বিতীয় দামী
    '1.png' => 10, '3.png' => 8, '4.png' => 5, '5.png' => 4, '6.png' => 3, '7.png' => 2, '8.png' => 1
];

// ৩. ৫x৪ রিল জেনারেট করা
$reels = [];
for ($i = 0; $i < 5; $i++) {
    for ($j = 0; $j < 4; $j++) { $reels[$i][$j] = $symbols[array_rand($symbols)]; }
}

// ৪. পে-লাইন উইনিং লজিক (১, ২, ৩ কলামে মিললে উইন)
$win_amount = 0;
$is_win = false;
$win_symbol = "";
$free_spins = 0;
$scatter_count = 0;

// ৪.১ স্কাটার চেক (9.png)
foreach ($reels as $column) {
    if (in_array('9.png', $column)) $scatter_count++;
}
if ($scatter_count >= 3) $free_spins = 10; // ৩টি স্কাটারে ১০ ফ্রি স্পিন

// ৪.২ রিয়েল পে-লাইন চেক (প্রতিটি চিহ্নের জন্য)
foreach ($symbol_values as $sym => $multiplier) {
    $c1 = count(array_keys($reels[0], $sym));
    $c2 = count(array_keys($reels[1], $sym));
    $c3 = count(array_keys($reels[2], $sym));
    $c4 = count(array_keys($reels[3], $sym));
    $c5 = count(array_keys($reels[4], $sym));

    if ($c1 > 0 && $c2 > 0 && $c3 > 0) { // ১, ২, ৩ কলামে মিললে
        $ways = $c1 * $c2 * $c3;
        $win_mult = 2; // ৩ কলামে ২ গুণ
        if ($c4 > 0) { $ways *= $c4; $win_mult = 5; // ৪ কলামে ৫ গুণ
            if ($c5 > 0) { $ways *= $c5; $win_mult = 15; } // ৫ কলামে ১৫ গুণ
        }
        $win_amount += ($bet_amount / 10) * $multiplier * $ways * $win_mult;
        $is_win = true;
        $win_symbol = $sym;
    }
}

// ৫. ডাটাবেস আপডেট
$new_balance = $user['balance'] - $bet_amount + $win_amount;
$update_stmt = $conn->prepare("UPDATE users SET balance = ? WHERE id = ?");
$update_stmt->bind_param("di", $new_balance, $user_id);
$update_stmt->execute();

// ৬. রেজাল্ট পাঠানো
echo json_encode([
    "status" => "success",
    "reels" => $reels,
    "win" => number_format($win_amount, 2, '.', ''),
    "new_balance" => number_format($new_balance, 2, '.', ''),
    "is_win" => $is_win,
    "win_symbol" => $win_symbol,
    "free_spins" => $free_spins,
    "scatters" => $scatter_count
]);
?>
