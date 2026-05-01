<?php
include 'db.php';
session_start();

header('Content-Type: application/json');

// ১. ইনপুট ডাটা নেওয়া
$user_id = $_POST['user_id'] ?? 0;
$bet_amount = floatval($_POST['bet'] ?? 0);

if ($user_id <= 0 || $bet_amount <= 0) {
    echo json_encode(["status" => "error", "message" => "Invalid Request"]);
    exit();
}

// ২. ব্যালেন্স চেক করা
$stmt = $conn->prepare("SELECT balance FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || $user['balance'] < $bet_amount) {
    echo json_encode(["status" => "error", "message" => "Insufficient Balance"]);
    exit();
}

// ৩. ৫x৪ রিল জেনারেট করা (১০২৪ ওয়েজ লজিক)
$symbols = ['ACE', 'KING', 'QUEEN', 'JOKER', 'SPADE', 'SCATTER', 'WILD'];
$reels = [];
for ($i = 0; $i < 5; $i++) {
    $column = [];
    for ($j = 0; $j < 4; $j++) {
        $column[] = $symbols[array_rand($symbols)];
    }
    $reels[] = $column;
}

// ৪. উইনিং লজিক (RTP ৩০% সেট করা আছে - আপনি চাইলে কমাতে/বাড়াতে পারেন)
$win_chance = rand(1, 100);
$win_amount = 0;
$is_win = false;

if ($win_chance <= 30) {
    $multipliers = [0.5, 1, 2, 5, 10, 20, 50]; // জেতার গুণিতক
    $rand_mult = $multipliers[array_rand($multipliers)];
    $win_amount = $bet_amount * $rand_mult;
    $is_win = true;
}

// ৫. ডাটাবেস আপডেট (টাকা কাটা ও উইন যোগ করা)
$new_balance = $user['balance'] - $bet_amount + $win_amount;
$update_stmt = $conn->prepare("UPDATE users SET balance = ? WHERE id = ?");
$update_stmt->bind_param("di", $new_balance, $user_id);
$update_stmt->execute();

// ৬. রেজাল্ট পাঠানো (জাভাস্ক্রিপ্ট এনিমেশনের জন্য)
echo json_encode([
    "status" => "success",
    "reels" => $reels,
    "win" => number_format($win_amount, 2, '.', ''),
    "new_balance" => number_format($new_balance, 2, '.', ''),
    "is_win" => $is_win
]);
?>
